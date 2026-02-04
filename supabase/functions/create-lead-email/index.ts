// Supabase Edge Function: create-lead-email
// Creates a lead + first message, sends email to seller (From: domain, Reply-To: buyer, CC: lead-id@domain for history).
// Rate limit by IP. Optional CAPTCHA (Turnstile).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse } from '../_shared/cors.ts';

const EMAIL_RATE_LIMIT_SEC = 60;

interface ReqBody {
  listingId?: string;
  buyerEmail?: string;
  message?: string;
  captchaToken?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return corsPreflightResponse();

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as ReqBody;
    const listingId = body.listingId?.trim();
    const buyerEmail = body.buyerEmail?.trim();
    const message = body.message?.trim();
    const captchaToken = body.captchaToken?.trim();

    if (!listingId || !buyerEmail || !message) {
      return new Response(
        JSON.stringify({ error: 'listingId, buyerEmail and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (message.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Message must be at least 10 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
    if (turnstileSecret && captchaToken) {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: turnstileSecret, response: captchaToken }),
      });
      if (!verifyRes.ok) {
        return new Response(
          JSON.stringify({ error: 'CAPTCHA verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const verifyData = (await verifyRes.json()) as { success?: boolean };
      if (!verifyData.success) {
        return new Response(
          JSON.stringify({ error: 'CAPTCHA verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = await hashIp(ip);
    const endpoint = 'create-lead-email';

    const { data: rateRow } = await supabase
      .from('rate_limit')
      .select('last_at')
      .eq('ip_hash', ipHash)
      .eq('endpoint', endpoint)
      .single();

    if (rateRow?.last_at) {
      const lastAt = new Date(rateRow.last_at).getTime();
      if (Date.now() - lastAt < EMAIL_RATE_LIMIT_SEC * 1000) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, title, description, price, type, category, subcategory, condition, image_urls, seller_email')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sellerEmail = (listing.seller_email as string)?.trim();
    if (!sellerEmail) {
      return new Response(
        JSON.stringify({ error: 'Listing has no seller email' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        listing_id: listingId,
        buyer_email: buyerEmail,
        seller_email: sellerEmail,
        communication_channel: 'email',
      })
      .select('id')
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: leadError?.message || 'Failed to create lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: msgError } = await supabase.from('messages').insert({
      lead_id: lead.id,
      sender: 'buyer',
      content: message,
    });

    if (msgError) {
      console.error('create-lead-email: failed to store message', msgError);
      // Continue anyway; lead was created
    }

    await supabase.from('rate_limit').upsert(
      { ip_hash: ipHash, endpoint, last_at: new Date().toISOString() },
      { onConflict: 'ip_hash,endpoint' }
    );

    const emailDomain = Deno.env.get('EMAIL_DOMAIN');
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (emailDomain && resendKey) {
      const fromAddress = `Marketplace <noreply@${emailDomain}>`;
      const replyToAddress = `lead-${lead.id}@${emailDomain}`;
      const siteUrl = Deno.env.get('SITE_URL') ?? '';
      const { html, text } = buildEmailBody(listing, buyerEmail, message, siteUrl);

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [sellerEmail],
          reply_to: replyToAddress,
          subject: `Nova mensagem: ${(listing.title as string)?.slice(0, 50) || 'Anúncio'}`,
          html,
          text,
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error('create-lead-email: Resend API error', errText);
        return new Response(
          JSON.stringify({ error: 'Failed to send email' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      if (!emailDomain) console.warn('create-lead-email: EMAIL_DOMAIN not set, skipping email');
      if (!resendKey) console.warn('create-lead-email: RESEND_API_KEY not set, skipping email');
    }

    return new Response(JSON.stringify({ leadId: lead.id }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('create-lead-email error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(ip);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Design tokens aligned with website (marketplace-shared)
const EMAIL_ACCENT = '#ff4800';
const EMAIL_BG_DARK = '#0a0a0a';
const EMAIL_BG_DARKER = '#000000';
const EMAIL_TEXT_GRAY = '#b0b0b0';
const EMAIL_BORDER = '#1a1a1a';

interface ListingRow {
  id: string;
  title?: string;
  description?: string | null;
  price?: number | null;
  type?: string;
  category?: string;
  subcategory?: string | null;
  condition?: string | null;
  image_urls?: string[] | null;
  seller_email?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmailBody(
  listing: ListingRow,
  buyerEmail: string,
  message: string,
  siteUrl: string
): { html: string; text: string } {
  const title = listing.title?.trim() || 'Anúncio';
  const description = (listing.description ?? '').trim().slice(0, 200);
  const priceNum = listing.price != null ? Number(listing.price) : NaN;
  const price =
    !Number.isNaN(priceNum) && priceNum > 0 ? `${Math.round(priceNum)} €` : 'Sob consulta';
  const category = [listing.category, listing.subcategory].filter(Boolean).join(' · ') || '—';
  const imageUrl = Array.isArray(listing.image_urls) && listing.image_urls[0]
    ? String(listing.image_urls[0]).trim()
    : '';
  const baseUrl = siteUrl ? siteUrl.replace(/\/$/, '') : '';
  const listingUrl = baseUrl ? `${baseUrl}/marketplace/listing/${listing.id}` : '';

  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
  const safeBuyer = escapeHtml(buyerEmail);
  const safeCategory = escapeHtml(category);
  const safeDescription = escapeHtml(description);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova mensagem sobre o anúncio</title>
</head>
<body style="margin:0; padding:0; background-color:${EMAIL_BG_DARK}; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.5; color: #ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${EMAIL_BG_DARK};">
    <tr>
      <td style="padding: 32px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; margin: 0 auto;">
          <!-- Header -->
          <tr>
            <td style="padding-bottom: 20px;">
              <div style="height: 4px; width: 48px; background-color: ${EMAIL_ACCENT}; border-radius: 2px;"></div>
              <h1 style="margin: 16px 0 4px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
                Nova mensagem
              </h1>
              <p style="margin: 0; font-size: 14px; color: ${EMAIL_TEXT_GRAY};">
                Recebeu uma mensagem sobre um anúncio seu.
              </p>
            </td>
          </tr>
          <!-- Listing card -->
          <tr>
            <td style="padding-bottom: 20px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${EMAIL_BG_DARKER}; border: 1px solid ${EMAIL_BORDER}; border-radius: 8px; overflow: hidden;">
                <tr>
                  ${imageUrl ? `<td style="width: 140px; vertical-align: top;"><img src="${escapeHtml(imageUrl)}" alt="" width="140" height="140" style="display:block; width:140px; height:140px; object-fit: cover; background: ${EMAIL_BORDER};" /></td>` : ''}
                  <td style="padding: 20px; vertical-align: top;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${EMAIL_TEXT_GRAY};">Anúncio</p>
                    <p style="margin: 0 0 8px 0; font-size: 17px; font-weight: 600; color: #ffffff; line-height: 1.3;">${safeTitle}</p>
                    <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: ${EMAIL_ACCENT};">${escapeHtml(price)}</p>
                    <p style="margin: 0; font-size: 13px; color: ${EMAIL_TEXT_GRAY};">${safeCategory}</p>
                    ${safeDescription ? `<p style="margin: 12px 0 0 0; font-size: 13px; color: ${EMAIL_TEXT_GRAY}; line-height: 1.45;">${safeDescription}${description.length >= 200 ? '…' : ''}</p>` : ''}
                    ${listingUrl ? `<p style="margin: 16px 0 0 0;"><a href="${escapeHtml(listingUrl)}" style="display: inline-block; padding: 12px 20px; background-color: ${EMAIL_ACCENT}; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 600; border-radius: 6px;">Ver anúncio</a></p>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Message from buyer -->
          <tr>
            <td style="padding-bottom: 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${EMAIL_BG_DARKER}; border: 1px solid ${EMAIL_BORDER}; border-left: 4px solid ${EMAIL_ACCENT}; border-radius: 0 8px 8px 0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: ${EMAIL_TEXT_GRAY};">
                      Mensagem de ${safeBuyer}
                    </p>
                    <div style="font-size: 15px; color: #ffffff; line-height: 1.6;">${safeMessage}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding-top: 8px; font-size: 12px; color: ${EMAIL_TEXT_GRAY}; text-align: center; border-top: 1px solid ${EMAIL_BORDER};">
              <p style="margin: 0 0 8px 0;">Responda a este email para continuar a conversa. A sua resposta será enviada ao comprador.</p>
              ${listingUrl ? `<p style="margin: 0;"><a href="${escapeHtml(listingUrl)}" style="color: ${EMAIL_ACCENT}; text-decoration: none;">Ver anúncio no site</a></p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    `Nova mensagem sobre o anúncio: ${title}`,
    `Preço: ${price} | Categoria: ${category}`,
    listingUrl ? `Ver anúncio: ${listingUrl}` : '',
    '',
    `Mensagem de ${buyerEmail}:`,
    message,
    '',
    '---',
    'Responda a este email para continuar. A sua resposta será enviada ao comprador.',
  ];
  const text = textLines.filter(Boolean).join('\n');

  return { html, text };
}

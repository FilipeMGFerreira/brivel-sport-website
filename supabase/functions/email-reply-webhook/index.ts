// Supabase Edge Function: email-reply-webhook
// Inbound webhook from Resend when someone replies to lead-<id>@domain.
// Fetches email content via Receiving API, stores message in DB, forwards to the other party.
// Uses EMAIL_DOMAIN (or EMAIL_RELAY_DOMAIN) for the relay address.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse } from '../_shared/cors.ts';

interface ResendWebhook {
  type: string;
  data: {
    email_id: string;
    to: string[];
    from?: string;
    subject?: string;
  };
}

interface ResendEmailContent {
  text: string | null;
  html: string | null;
  subject: string;
}

function extractEmail(address: string): string {
  const m = address.match(/<([^>]+)>/);
  return m ? m[1].toLowerCase().trim() : address.toLowerCase().trim();
}

function senderFromAddress(from: string, buyerEmail: string | null, sellerEmail: string): 'buyer' | 'seller' {
  const fromEmail = extractEmail(from);
  const buyer = buyerEmail ? extractEmail(buyerEmail) : '';
  const seller = extractEmail(sellerEmail);
  if (fromEmail === buyer) return 'buyer';
  return 'seller';
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
    const payload = (await req.json()) as ResendWebhook;
    if (payload.type !== 'email.received' || !payload.data?.email_id) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailId = payload.data.email_id;
    const relayDomain = Deno.env.get('EMAIL_DOMAIN') ?? Deno.env.get('EMAIL_RELAY_DOMAIN');
    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!relayDomain || !resendKey) {
      console.error('email-reply-webhook: EMAIL_DOMAIN/EMAIL_RELAY_DOMAIN or RESEND_API_KEY not set');
      return new Response(JSON.stringify({ error: 'Configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const toList = payload.data?.to ?? [];
    const recipient = Array.isArray(toList) ? toList[0] : toList;
    const match = typeof recipient === 'string' &&
      recipient.match(new RegExp(`^lead-([a-f0-9-]+)@${relayDomain.replace(/\./g, '\\.')}`, 'i'));
    const leadId = match?.[1];

    if (!leadId) {
      console.error('email-reply-webhook: Invalid recipient', recipient);
      return new Response(JSON.stringify({ error: 'Invalid recipient' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentRes = await fetch(`https://api.resend.com/emails/${emailId}/receiving`, {
      headers: { Authorization: `Bearer ${resendKey}` },
    });

    if (!contentRes.ok) {
      console.error('email-reply-webhook: Failed to fetch email content', await contentRes.text());
      return new Response(JSON.stringify({ error: 'Failed to fetch email content' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailContent = (await contentRes.json()) as ResendEmailContent;
    const plainText = (emailContent.text ?? emailContent.html?.replace(/<[^>]+>/g, '') ?? '').trim();

    if (!plainText) {
      return new Response(JSON.stringify({ error: 'No message content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
    );

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, buyer_email, seller_email')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      console.error('email-reply-webhook: Lead not found', leadId);
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fromHeader = payload.data?.from ?? '';
    const sender = senderFromAddress(fromHeader, lead.buyer_email as string | null, lead.seller_email as string);

    const { error: msgError } = await supabase.from('messages').insert({
      lead_id: lead.id,
      sender,
      content: plainText,
    });

    if (msgError) {
      console.error('email-reply-webhook: Failed to store message', msgError);
      return new Response(JSON.stringify({ error: 'Failed to store message' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const buyerEmail = lead.buyer_email as string | null;
    const emailDomain = Deno.env.get('EMAIL_DOMAIN') ?? relayDomain;
    const fromAddr = `lead-${lead.id}@${emailDomain}`;

    if (sender === 'seller' && buyerEmail) {
      const forwardRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: `Marketplace <noreply@${emailDomain}>`,
          to: [buyerEmail],
          reply_to: fromAddr,
          subject: emailContent.subject || 'Resposta do vendedor (anúncio)',
          text: `${plainText}\n\n---\nResponda a este email para continuar a conversa.`,
        }),
      });

      if (!forwardRes.ok) {
        console.error('email-reply-webhook: Failed to forward', await forwardRes.text());
        return new Response(JSON.stringify({ error: 'Failed to forward email' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (sender === 'buyer') {
      const sellerEmail = (lead.seller_email as string)?.trim();
      if (sellerEmail) {
        const forwardRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: `Marketplace <noreply@${emailDomain}>`,
            to: [sellerEmail],
            reply_to: fromAddr,
            subject: emailContent.subject || 'Resposta do comprador (anúncio)',
            text: `${plainText}\n\n---\nResponda a este email para continuar a conversa.`,
          }),
        });

        if (!forwardRes.ok) {
          console.error('email-reply-webhook: Failed to forward to seller', await forwardRes.text());
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('email-reply-webhook:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

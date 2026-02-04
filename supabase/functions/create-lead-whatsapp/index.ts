// Supabase Edge Function: create-lead-whatsapp
// Creates a lead record when buyer clicks WhatsApp (channel = whatsapp). No message proxy.
// Rate limit by IP.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse } from '../_shared/cors.ts';

const WHATSAPP_RATE_LIMIT_SEC = 20;

interface ReqBody {
  listingId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const body = (await req.json()) as ReqBody;
    const listingId = body.listingId?.trim();

    if (!listingId) {
      return new Response(
        JSON.stringify({ error: 'listingId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const ipHash = await hashIp(ip);
    const endpoint = 'create-lead-whatsapp';

    const { data: rateRow } = await supabase.from('rate_limit').select('last_at').eq('ip_hash', ipHash).eq('endpoint', endpoint).single();
    if (rateRow?.last_at) {
      const lastAt = new Date(rateRow.last_at).getTime();
      if (Date.now() - lastAt < WHATSAPP_RATE_LIMIT_SEC * 1000) {
        return new Response(
          JSON.stringify({ error: 'Too many requests. Please wait.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, seller_email, seller_phone')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sellerPhone = (listing.seller_phone as string)?.trim();
    if (!sellerPhone) {
      return new Response(
        JSON.stringify({ error: 'Listing has no WhatsApp contact' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        listing_id: listingId,
        buyer_email: null,
        seller_email: listing.seller_email,
        communication_channel: 'whatsapp',
      })
      .select('id')
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: leadError?.message || 'Failed to create lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase.from('rate_limit').upsert(
      { ip_hash: ipHash, endpoint, last_at: new Date().toISOString() },
      { onConflict: 'ip_hash,endpoint' }
    );

    return new Response(
      JSON.stringify({ leadId: lead.id }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('create-lead-whatsapp error:', e);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

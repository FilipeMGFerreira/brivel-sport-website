export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/** Preflight OPTIONS response with CORS (status 200 as per Supabase docs). */
export function corsPreflightResponse(): Response {
  return new Response('ok', { status: 200, headers: corsHeaders });
}

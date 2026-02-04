-- Leads and messages for marketplace contact flow (email / WhatsApp).
-- Run after supabase-schema.sql (listings table must exist).
-- See COMMUNICATION_FLOW in marketplace README.

-- Rate limiting for Edge Functions (IP-based, per endpoint)
create table if not exists rate_limit (
  ip_hash text not null,
  endpoint text not null,
  last_at timestamptz not null default now(),
  primary key (ip_hash, endpoint)
);

alter table rate_limit enable row level security;
-- No anon/authenticated policies; Edge Functions use service role

-- Leads: one per contact attempt (email or WhatsApp)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  buyer_email text,
  seller_email text not null,
  communication_channel text not null check (communication_channel in ('email', 'whatsapp')),
  created_at timestamptz default now()
);

create index if not exists leads_listing_id_idx on leads(listing_id);
create index if not exists leads_created_at_idx on leads(created_at desc);

alter table leads enable row level security;

-- Anon can insert (frontend creates leads via Edge Function or direct insert)
create policy "Leads anon insert"
  on leads for insert
  to anon
  with check (true);

-- Authenticated can read (for future admin view)
create policy "Leads authenticated read"
  on leads for select
  to authenticated
  using (true);

-- Service role used by Edge Functions for full access
-- (no anon/authenticated update/delete needed for MVP)

-- Messages: email thread only (buyer/seller replies via relay)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  sender text not null check (sender in ('buyer', 'seller')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists messages_lead_id_idx on messages(lead_id);

alter table messages enable row level security;

-- No anon/authenticated access; Edge Functions use service role
-- Allow service role only (default: no policies = no access for anon/auth)
create policy "Messages service role all"
  on messages for all
  to service_role
  using (true)
  with check (true);

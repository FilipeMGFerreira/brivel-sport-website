-- Marketplace listings table (run in Supabase SQL Editor)
-- See MARKETPLACE_ARCHITECTURE.md for context.

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  type text not null,
  category text not null,
  subcategory text,
  status text not null,
  is_visible boolean not null default true,
  condition text,
  seller_email text not null,
  seller_phone text,
  price numeric,
  attributes jsonb,
  image_urls text[],
  tags text[],
  created_at timestamptz default now()
);

alter table listings enable row level security;

-- Public read: anon key (unauthenticated) and authenticated users can select all rows
create policy "Public read"
  on listings for select
  to anon
  using (true);

create policy "Public read authenticated"
  on listings for select
  to authenticated
  using (true);

-- Admin write: authenticated users can insert, update, delete
create policy "Admin write"
  on listings for insert
  to authenticated
  with check (true);

create policy "Admin update"
  on listings for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin delete"
  on listings for delete
  to authenticated
  using (true);

-- Optional: Storage bucket for marketplace images (create in Dashboard > Storage)
-- Bucket name: marketplace-images
-- Public: yes (for read access)
-- RLS: public read; authenticated can upload

-- Leads and messages: run supabase-schema-leads-messages.sql after this.

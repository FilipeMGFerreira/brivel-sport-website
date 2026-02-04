-- Fix: allow anonymous (anon key) to read listings
-- Run this in Supabase SQL Editor if the marketplace shows no products and you already ran supabase-schema.sql.

-- Drop the old policy if it exists (no "to anon")
drop policy if exists "Public read" on listings;

-- Create policies so anon and authenticated can select
create policy "Public read"
  on listings for select
  to anon
  using (true);

create policy "Public read authenticated"
  on listings for select
  to authenticated
  using (true);

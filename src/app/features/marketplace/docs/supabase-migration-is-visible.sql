-- Add is_visible to control whether a listing appears in the public list.
-- Run in Supabase SQL Editor if you already have the listings table.

alter table listings add column if not exists is_visible boolean not null default true;

comment on column listings.is_visible is 'When false, listing is hidden from the public list (deactivated).';

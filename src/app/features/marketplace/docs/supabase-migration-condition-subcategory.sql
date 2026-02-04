-- Add condition (NEW/USED) and subcategory to existing listings table.
-- Run in Supabase SQL Editor if you already have the listings table.

alter table listings add column if not exists condition text;
alter table listings add column if not exists subcategory text;

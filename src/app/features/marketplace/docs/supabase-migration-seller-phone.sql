-- Add seller_phone to listings for WhatsApp contact (wa.me).
-- Run in Supabase SQL Editor if you already have the listings table.

alter table listings add column if not exists seller_phone text;

comment on column listings.seller_phone is 'Optional phone/WhatsApp for wa.me contact; when set, WhatsApp option is shown on listing detail.';

# Marketplace Feature

Peças (car parts) marketplace – public list/detail and admin CRUD.

## Setup

1. **Dependencies**: Run `npm install` (adds `@supabase/supabase-js`).
2. **Config**: Copy `src/app/appsettings.example.ts` to `src/app/appsettings.ts` and set `supabase.url` and `supabase.anonKey`.
3. **Database**: Run `docs/supabase-schema.sql` in the Supabase SQL Editor to create the `listings` table and RLS policies. If you already have the table, run `docs/supabase-migration-condition-subcategory.sql` to add `condition` and `subcategory` columns.
4. **Storage (for listing images)**: Create the `marketplace-images` bucket and policies – see [docs/supabase-storage-setup.md](docs/supabase-storage-setup.md).
5. **Dummy data (optional)**: Run `docs/supabase-seed-dummy-listings.sql` in the Supabase SQL Editor to insert sample car part listings.
6. **Admin users**: Create users in Supabase Auth (Dashboard or invite). They sign in at `/marketplace/admin/login`.
7. **Contact flow (Email + WhatsApp)**: On listing detail, buyers can choose "Contactar por email" or "Contactar por WhatsApp" (if the listing has a seller phone). Run `docs/supabase-schema-leads-messages.sql` and `docs/supabase-migration-seller-phone.sql`, deploy Edge Functions (`supabase/functions`), and set secrets – see [supabase/functions/README.md](../../../supabase/functions/README.md).

## Routes

- `/marketplace` or `/marketplace/list` – public listing list (filters: condition Novo/Usado, category, subcategory, price; pills show condition and status; reserved/unavailable cards in gray).
- `/marketplace/list/:id` or `/marketplace/listing/:id` – public listing detail.
- `/marketplace/admin/login` – admin login.
- `/marketplace/admin` – admin listing list (after login).
- `/marketplace/admin/new` – create listing.
- `/marketplace/admin/edit/:id` – edit listing.

## Troubleshooting: no products showing

If Supabase is configured but the marketplace list is empty:

1. **RLS**: The app uses the **anon** key for public reads. Run `docs/supabase-fix-rls-public-read.sql` in the Supabase SQL Editor to allow anonymous read on `listings`.
2. **Data**: Run `docs/supabase-seed-dummy-listings.sql` if you haven’t already.
3. **Browser console**: Open DevTools (F12) → Console. Any error when loading `/marketplace/list` will be logged as `[Marketplace] getListings failed:`.

## Docs

- [MARKETPLACE_ARCHITECTURE.md](docs/MARKETPLACE_ARCHITECTURE.md) – architecture, adding verticals, trade-offs.
- [supabase-schema.sql](docs/supabase-schema.sql) – Supabase schema and RLS.
- [supabase-seed-dummy-listings.sql](docs/supabase-seed-dummy-listings.sql) – dummy car part listings (run after schema).
- [supabase-fix-rls-public-read.sql](docs/supabase-fix-rls-public-read.sql) – fix RLS so anon can read listings.
- [supabase-migration-condition-subcategory.sql](docs/supabase-migration-condition-subcategory.sql) – add `condition` and `subcategory` columns to existing `listings` table.
- [supabase-schema-leads-messages.sql](docs/supabase-schema-leads-messages.sql) – leads, messages, and rate_limit tables for contact flow.
- [supabase-migration-seller-phone.sql](docs/supabase-migration-seller-phone.sql) – add optional `seller_phone` to listings (WhatsApp contact).
- [supabase-storage-setup.md](docs/supabase-storage-setup.md) – Storage bucket for listing images (upload from admin form).
- [supabase/functions/README.md](../../../supabase/functions/README.md) – Edge Functions for contact flow (create-lead-email, create-lead-whatsapp, email-reply-webhook).

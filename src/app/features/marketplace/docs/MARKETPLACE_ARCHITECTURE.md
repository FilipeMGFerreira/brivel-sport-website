# Marketplace Feature – Architecture

This document describes the marketplace feature architecture, how to add new verticals, why the model scales, and trade-offs.

## Overview

The marketplace is a **feature-scoped** area under `src/app/features/marketplace/`. It follows **Clean Architecture** inside the feature: domain (no framework), application (use cases), infrastructure (Supabase), presentation (Angular). The app shell (navbar + footer) and design system (Tailwind, styles) are shared with the base app.

## Layers

- **Domain**: Entities (`Listing`), value objects (`Money`), enums (`ListingType`, `ListingStatus`), repository **interfaces** (ports). No Angular, no Supabase.
- **Application**: Use cases that depend only on domain and repository interfaces. They orchestrate listing CRUD and auth.
- **Infrastructure**: Supabase client and implementations of `ListingRepository` and `AuthRepository`. Maps DB rows to domain entities; persists `attributes` as JSONB and `image_urls` as text array.
- **Presentation**: Angular components (public list/detail, admin login/list/form) and `adminAuthGuard`. Components depend only on use cases; they use the same Tailwind/design tokens as the base app.

## Generic Listing Model

The core entity is **Listing**, not “car part”. Listing has:

- `type`: `CAR_PART` | `CAR` | `SERVICE` | `GENERIC`
- `attributes`: optional `Record<string, unknown>` (JSONB in DB)
- `imageUrls`: optional `string[]`

Car parts are a **specialization**: `type === CAR_PART` and `attributes` hold `brand`, `model`, `partCode`. Other verticals (cars, services) reuse the same table and entity; only `type` and `attributes` shape change. No separate tables per vertical.

## How to Add a New Vertical (e.g. Cars)

1. **Domain**: Add a new value to `ListingType` (e.g. `CAR`) and, if useful, a small helper or type for the new `attributes` shape (e.g. `getCarAttributes(listing)`).
2. **Application**: No change. Use cases already work with generic `Listing` and `attributes`.
3. **Infrastructure**: No change. Repository already persists `attributes` as JSONB.
4. **Presentation**: In the admin form, when `type === CAR`, show extra fields (e.g. year, mileage, fuel) and map them to `listing.attributes`. In the public list/detail, filter or display by `type` and show the new attributes. Optionally add a new route or tab for “Carros” that filters by `ListingType.CAR`.

No new tables or core entity changes are required.

## Why the Model Scales

- **Single table**: One `listings` table for all verticals; no schema explosion.
- **Generic entity**: `Listing` + `type` + `attributes`; vertical-specific data lives in `attributes`.
- **Use cases stay vertical-agnostic**: They don’t know about car parts vs cars; they load/save `Listing` and optional filters (e.g. by `type`).
- **New vertical = new type + UI**: Add enum value, optional helper type, and presentation logic. Backend and domain stay unchanged.

## Trade-offs

- **JSONB `attributes` vs strict columns**: Flexible and easy to extend; complex queries or indexing on attribute fields are harder. For MVP and moderate scale, JSONB is acceptable; you can add expression indexes or computed columns later if needed.
- **RLS “any authenticated can write”**: Simple; every logged-in user can create/update/delete listings. To restrict to “admin” only, you’d add a role (e.g. in JWT or a `profiles` table) and tighten RLS policies.
- **Admin users created outside the app**: No signup UI; admins are created/invited via Supabase Dashboard (or another backend). Keeps the app simple and avoids open signup.

## Supabase Setup

1. **Config**: Copy `appsettings.example.ts` to `appsettings.ts` and set `supabase.url` and `supabase.anonKey`.
2. **Schema**: Run `docs/supabase-schema.sql` in the Supabase SQL Editor to create `listings` and RLS policies.
3. **Auth**: Create admin users in Supabase Auth (Dashboard or invite). They sign in via `/marketplace/admin/login`.
4. **Images**: Either use external image URLs in the form, or create a Storage bucket (e.g. `marketplace-images`), make it public for read, and use the bucket’s public URLs as `image_urls`.

## Entry Point

The marketplace is **not** on the main landing page. It is reached only via the **PEÇAS** link in the top bar. The same navbar and footer from the base app wrap the marketplace routes.

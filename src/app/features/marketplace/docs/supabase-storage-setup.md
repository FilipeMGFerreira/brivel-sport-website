# Supabase Storage – Listing images

Listing photos are uploaded to Supabase Storage and their public URLs are stored in the `listings.image_urls` column.

## 1. Create the bucket

1. In **Supabase Dashboard** go to **Storage**.
2. Click **New bucket**.
3. **Name:** `marketplace-images`
4. **Public bucket:** turn **ON** (so the app can show images via public URLs).
5. Click **Create bucket**.

## 2. Storage policies (RLS)

Go to **Storage** → **marketplace-images** → **Policies** and add:

- **Public read**  
  - Policy name: `Public read`  
  - Allowed operation: **SELECT** (read)  
  - Target roles: `public` (or leave default)  
  - USING expression: `true`  

- **Authenticated upload**  
  - Policy name: `Authenticated upload`  
  - Allowed operation: **INSERT**  
  - Target roles: `authenticated`  
  - WITH CHECK expression: `true`  

- **Authenticated update/delete** (optional, for replacing/deleting images)  
  - Policy name: `Authenticated update`  
  - Allowed operation: **UPDATE**  
  - Target roles: `authenticated`  
  - USING: `true`, WITH CHECK: `true`  

  - Policy name: `Authenticated delete`  
  - Allowed operation: **DELETE**  
  - Target roles: `authenticated`  
  - USING: `true`  

## 3. File layout

Files are stored under:

- `draft/<uuid>-<filename>` for new listings (before save).
- `<listing-id>/<uuid>-<filename>` when editing an existing listing.

Only **authenticated** users (admin logged in via Supabase Auth) can upload. The app uses the same Supabase client and session for listing CRUD and storage uploads.

import { Injectable } from '@angular/core';
import { getSupabaseClient } from './supabase.client';

export const MARKETPLACE_IMAGES_BUCKET = 'marketplace-images';

/**
 * Uploads listing images to Supabase Storage and returns their public URLs.
 * Bucket must be public and allow authenticated uploads (see docs).
 */
@Injectable({ providedIn: 'root' })
export class ListingImageUploadService {
  /**
   * Uploads a file to the marketplace-images bucket and returns its public URL.
   * @param file The file to upload
   * @param listingId Optional listing id (e.g. when editing) for path organization; use 'draft' for new listings
   */
  async uploadFile(file: File, listingId?: string): Promise<string> {
    const supabase = getSupabaseClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80);
    const path = `${listingId ?? 'draft'}/${crypto.randomUUID()}-${safeName}`;

    const { data, error } = await supabase.storage.from(MARKETPLACE_IMAGES_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

    if (error) {
      const hint = error.message.includes('Bucket not found')
        ? ' Crie o bucket "marketplace-images" no Supabase Dashboard (Storage).'
        : error.message.includes('new row violates row-level security')
        ? ' Verifique as políticas do bucket: utilizadores autenticados devem poder fazer INSERT.'
        : '';
      throw new Error(error.message + hint);
    }
    const { data: urlData } = supabase.storage.from(MARKETPLACE_IMAGES_BUCKET).getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  /**
   * Uploads multiple files and returns their public URLs in order.
   */
  async uploadFiles(files: File[], listingId?: string): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadFile(file, listingId);
      urls.push(url);
    }
    return urls;
  }
}

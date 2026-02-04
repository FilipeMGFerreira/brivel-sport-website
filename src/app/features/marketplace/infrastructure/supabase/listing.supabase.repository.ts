import { Listing } from '../../domain/entities/listing.entity';
import { ListingRepository, ListingFilter } from '../../domain/repositories/listing.repository';
import { ListingType } from '../../domain/enums/listing-type.enum';
import { ListingStatus } from '../../domain/enums/listing-status.enum';
import { PartCondition } from '../../domain/enums/part-condition.enum';
import { Money } from '../../domain/value-objects/money.vo';
import { getSupabaseClient } from './supabase.client';

interface ListingRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  status: string;
  is_visible: boolean;
  seller_email: string;
  seller_phone?: string | null;
  price: number | null;
  condition?: string | null;
  subcategory?: string | null;
  attributes: Record<string, unknown> | null;
  image_urls?: string[] | string | null;
  tags?: string[] | null;
  created_at: string | null;
}

function normalizeImageUrls(raw: string[] | string | null | undefined): string[] | undefined {
  if (raw == null) return undefined;
  if (Array.isArray(raw)) {
    const urls = raw.filter((u) => typeof u === 'string' && u.trim().length > 0);
    return urls.length ? urls : undefined;
  }
  if (typeof raw === 'string' && raw.trim().length > 0) return [raw.trim()];
  return undefined;
}

function rowToListing(row: ListingRow): Listing {
  return new Listing(
    row.id,
    row.title,
    row.description ?? '',
    row.type as ListingType,
    row.category,
    row.status as ListingStatus,
    row.is_visible !== false,
    row.seller_email,
    row.seller_phone?.trim() || undefined,
    row.price != null ? Money.fromNumber(Number(row.price)) : undefined,
    (row.condition as PartCondition) ?? undefined,
    row.subcategory ?? undefined,
    row.attributes ?? undefined,
    normalizeImageUrls(row.image_urls),
    Array.isArray(row.tags) && row.tags.length > 0
      ? row.tags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
      : undefined,
    row.created_at ? new Date(row.created_at) : undefined
  );
}

function listingToRow(listing: Omit<Listing, 'id' | 'createdAt'>): Omit<ListingRow, 'id' | 'created_at'> {
  return {
    title: listing.title,
    description: listing.description || null,
    type: listing.type,
    category: listing.category,
    status: listing.status,
    is_visible: listing.isVisible !== false,
    seller_email: listing.sellerEmail,
    seller_phone: listing.sellerPhone?.trim() || null,
    price: listing.price?.amount ?? null,
    condition: listing.condition ?? null,
    subcategory: listing.subcategory ?? null,
    attributes: listing.attributes ?? null,
    image_urls: listing.imageUrls ?? null,
    tags: listing.tags?.length ? listing.tags : null
  };
}

export class ListingSupabaseRepository extends ListingRepository {
  private readonly table = 'listings';

  async getListings(filter?: ListingFilter): Promise<Listing[]> {
    let query = getSupabaseClient().from(this.table).select('*').order('created_at', { ascending: false });
    if (filter?.type) query = query.eq('type', filter.type);
    if (filter?.status) query = query.eq('status', filter.status);
    if (filter?.isVisible !== undefined) query = query.eq('is_visible', filter.isVisible);
    if (filter?.condition) query = query.eq('condition', filter.condition);
    if (filter?.category) query = query.eq('category', filter.category);
    if (filter?.subcategory) query = query.eq('subcategory', filter.subcategory);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data as ListingRow[]).map(rowToListing);
  }

  async getById(id: string): Promise<Listing | null> {
    const { data, error } = await getSupabaseClient().from(this.table).select('*').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data ? rowToListing(data as ListingRow) : null;
  }

  async create(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    const row = listingToRow(listing);
    const { data, error } = await getSupabaseClient().from(this.table).insert(row).select().single();
    if (error) throw new Error(error.message);
    return rowToListing(data as ListingRow);
  }

  async update(id: string, data: Partial<Omit<Listing, 'id' | 'type'>>): Promise<Listing> {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update['title'] = data.title;
    if (data.description !== undefined) update['description'] = data.description;
    if (data.category !== undefined) update['category'] = data.category;
    if (data.subcategory !== undefined) update['subcategory'] = data.subcategory;
    if (data.status !== undefined) update['status'] = data.status;
    if (data.isVisible !== undefined) update['is_visible'] = data.isVisible;
    if (data.condition !== undefined) update['condition'] = data.condition;
    if (data.sellerEmail !== undefined) update['seller_email'] = data.sellerEmail;
    if (data.sellerPhone !== undefined) update['seller_phone'] = data.sellerPhone?.trim() || null;
    if (data.price !== undefined) update['price'] = data.price?.amount ?? null;
    if (data.attributes !== undefined) update['attributes'] = data.attributes;
    if (data.imageUrls !== undefined) update['image_urls'] = data.imageUrls;
    if (data.tags !== undefined) update['tags'] = data.tags?.length ? data.tags : null;
    const { data: result, error } = await getSupabaseClient().from(this.table).update(update).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return rowToListing(result as ListingRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseClient().from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
  }
}

import { Listing } from './listing.entity';
import { ListingType } from '../enums/listing-type.enum';

export interface CarPartAttributes {
  brand: string;
  model: string;
  partCode: string;
}

export function getCarPartAttributes(listing: Listing): CarPartAttributes | null {
  if (listing.type !== ListingType.CAR_PART || !listing.attributes) return null;
  const a = listing.attributes as Record<string, unknown>;
  if (typeof a['brand'] !== 'string' || typeof a['model'] !== 'string' || typeof a['partCode'] !== 'string') return null;
  return { brand: a['brand'], model: a['model'], partCode: a['partCode'] };
}

import { Listing } from '../entities/listing.entity';
import { ListingType } from '../enums/listing-type.enum';
import { ListingStatus } from '../enums/listing-status.enum';
import { PartCondition } from '../enums/part-condition.enum';

export interface ListingFilter {
  type?: ListingType;
  status?: ListingStatus;
  /** When true, only listings visible in the public list are returned. */
  isVisible?: boolean;
  condition?: PartCondition;
  category?: string;
  subcategory?: string;
}

export abstract class ListingRepository {
  abstract getListings(filter?: ListingFilter): Promise<Listing[]>;
  abstract getById(id: string): Promise<Listing | null>;
  abstract create(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing>;
  abstract update(id: string, data: Partial<Omit<Listing, 'id' | 'type'>>): Promise<Listing>;
  abstract delete(id: string): Promise<void>;
}

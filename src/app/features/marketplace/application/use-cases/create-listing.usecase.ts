import { Injectable } from '@angular/core';
import { Listing } from '../../domain/entities/listing.entity';
import { ListingRepository } from '../../domain/repositories/listing.repository';

@Injectable()
export class CreateListingUseCase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(listing: Omit<Listing, 'id' | 'createdAt'>): Promise<Listing> {
    if (!listing.title?.trim()) throw new Error('Title is required');
    if (!listing.imageUrls?.length) throw new Error('At least one image URL is required');
    return this.listingRepository.create(listing);
  }
}

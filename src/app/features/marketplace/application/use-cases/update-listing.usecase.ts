import { Injectable } from '@angular/core';
import { Listing } from '../../domain/entities/listing.entity';
import { ListingRepository } from '../../domain/repositories/listing.repository';

@Injectable()
export class UpdateListingUseCase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(id: string, data: Partial<Omit<Listing, 'id' | 'type'>>): Promise<Listing> {
    if (data.title !== undefined && !data.title?.trim()) throw new Error('Title cannot be empty');
    if (data.imageUrls !== undefined && !data.imageUrls?.length) throw new Error('At least one image URL is required');
    return this.listingRepository.update(id, data);
  }
}

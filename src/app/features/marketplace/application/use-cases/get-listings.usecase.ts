import { Injectable } from '@angular/core';
import { Listing } from '../../domain/entities/listing.entity';
import { ListingRepository, ListingFilter } from '../../domain/repositories/listing.repository';

@Injectable()
export class GetListingsUseCase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(filter?: ListingFilter): Promise<Listing[]> {
    return this.listingRepository.getListings(filter);
  }
}

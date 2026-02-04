import { Injectable } from '@angular/core';
import { Listing } from '../../domain/entities/listing.entity';
import { ListingRepository } from '../../domain/repositories/listing.repository';

@Injectable()
export class GetListingByIdUseCase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(id: string): Promise<Listing | null> {
    return this.listingRepository.getById(id);
  }
}

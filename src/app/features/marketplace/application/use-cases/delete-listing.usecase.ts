import { Injectable } from '@angular/core';
import { ListingRepository } from '../../domain/repositories/listing.repository';

@Injectable()
export class DeleteListingUseCase {
  constructor(private readonly listingRepository: ListingRepository) {}

  async execute(id: string): Promise<void> {
    await this.listingRepository.delete(id);
  }
}

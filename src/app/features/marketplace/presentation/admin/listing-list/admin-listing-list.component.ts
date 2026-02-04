import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { GetListingsUseCase } from '../../../application/use-cases/get-listings.usecase';
import { DeleteListingUseCase } from '../../../application/use-cases/delete-listing.usecase';
import { UpdateListingUseCase } from '../../../application/use-cases/update-listing.usecase';
import { Listing } from '../../../domain/entities/listing.entity';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { PartCondition } from '../../../domain/enums/part-condition.enum';

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.AVAILABLE]: 'Disponível',
  [ListingStatus.RESERVED]: 'Reservado',
  [ListingStatus.UNAVAILABLE]: 'Indisponível'
};

const PART_CONDITION_LABELS: Record<PartCondition, string> = {
  [PartCondition.NEW]: 'Novo',
  [PartCondition.USED]: 'Usado'
};

@Component({
  selector: 'app-admin-listing-list',
  standalone: true,
  imports: [CommonModule, RouterLink, SafeResourceUrlPipe],
  templateUrl: './admin-listing-list.component.html',
  styleUrls: ['./admin-listing-list.component.scss']
})
export class AdminListingListComponent implements OnInit {
  listings: Listing[] = [];
  loading = true;
  error: string | null = null;
  deletingId: string | null = null;
  togglingId: string | null = null;

  readonly ListingStatus = ListingStatus;
  readonly PartCondition = PartCondition;
  readonly statusLabel = (s: ListingStatus) => LISTING_STATUS_LABELS[s];
  readonly conditionLabel = (c: PartCondition) => PART_CONDITION_LABELS[c];

  constructor(
    private readonly getListings: GetListingsUseCase,
    private readonly deleteListing: DeleteListingUseCase,
    private readonly updateListing: UpdateListingUseCase
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.getListings
      .execute({ isVisible: undefined })
      .then((list) => {
        this.listings = list;
        this.loading = false;
      })
      .catch((e) => {
        this.error = e?.message ?? 'Erro ao carregar anúncios.';
        this.loading = false;
        console.error('[Marketplace Admin] getListings failed:', e);
      });
  }

  isActive(listing: Listing): boolean {
    return listing.isVisible !== false;
  }

  async setActive(listing: Listing, active: boolean): Promise<void> {
    if (this.togglingId === listing.id) return;
    this.togglingId = listing.id;
    try {
      await this.updateListing.execute(listing.id, { isVisible: active });
      listing.isVisible = active;
      this.load();
    } catch (e) {
      this.error = (e as Error)?.message ?? 'Erro ao atualizar.';
      console.error('[Marketplace Admin] setActive failed:', e);
    } finally {
      this.togglingId = null;
    }
  }

  async deleteItem(id: string): Promise<void> {
    if (this.deletingId === id || !confirm('Tem a certeza que pretende eliminar este anúncio?')) return;
    this.deletingId = id;
    try {
      await this.deleteListing.execute(id);
      this.load();
    } catch (e) {
      this.error = (e as Error)?.message ?? 'Erro ao eliminar.';
      console.error('[Marketplace Admin] delete failed:', e);
    } finally {
      this.deletingId = null;
    }
  }

  thumbnailUrl(listing: Listing): string | null {
    return listing.imageUrls?.length ? listing.imageUrls[0] : null;
  }

  priceText(listing: Listing): string {
    if (!listing.price) return 'Sob consulta';
    return `${listing.price.amount} €`;
  }
}

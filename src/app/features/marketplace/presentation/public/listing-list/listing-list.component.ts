import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { GetListingsUseCase } from '../../../application/use-cases/get-listings.usecase';
import { Listing } from '../../../domain/entities/listing.entity';
import { ListingType } from '../../../domain/enums/listing-type.enum';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { PartCondition } from '../../../domain/enums/part-condition.enum';
import { MAIN_CATEGORIES, getSubcategoriesFor } from '../../../domain/constants/categories';

const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  [ListingType.CAR_PART]: 'Peças',
  [ListingType.CAR]: 'Carros'
};

const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.AVAILABLE]: 'Disponível',
  [ListingStatus.RESERVED]: 'Reservado',
  [ListingStatus.UNAVAILABLE]: 'Indisponível'
};

const PART_CONDITION_LABELS: Record<PartCondition, string> = {
  [PartCondition.NEW]: 'Novo',
  [PartCondition.USED]: 'Usado'
};

function tagToSlug(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SafeResourceUrlPipe],
  templateUrl: './listing-list.component.html',
  styleUrls: ['./listing-list.component.scss']
})
export class ListingListComponent implements OnInit, OnDestroy {
  allListings: Listing[] = [];
  loading = true;
  error: string | null = null;

  selectedType = signal<ListingType>(ListingType.CAR_PART);
  searchQuery = signal('');
  selectedCategory = signal<string>('');
  selectedSubcategory = signal<string>('');
  selectedCondition = signal<PartCondition | ''>('');
  selectedStatus = signal<ListingStatus | ''>('');
  /** Tag from URL (?tag=xyz); filters listings by tags. */
  selectedTag = signal<string>('');
  priceMin = signal<number>(0);
  priceMax = signal<number>(1000);
  private querySub?: Subscription;

  readonly ListingType = ListingType;
  readonly ListingStatus = ListingStatus;
  readonly PartCondition = PartCondition;
  readonly listingTypes = [ListingType.CAR_PART, ListingType.CAR] as const;
  readonly typeLabel = (t: ListingType) => LISTING_TYPE_LABELS[t];
  readonly statusLabel = (s: ListingStatus) => LISTING_STATUS_LABELS[s];
  readonly conditionLabel = (c: PartCondition) => PART_CONDITION_LABELS[c];
  readonly isListingDisabled = (listing: Listing) =>
    listing.status === ListingStatus.RESERVED || listing.status === ListingStatus.UNAVAILABLE;
  readonly mainCategories = [...MAIN_CATEGORIES];
  readonly subcategoriesForSelected = () => getSubcategoriesFor(this.selectedCategory());

  priceRange = computed(() => {
    const withPrice = this.allListings.filter((l) => l.price != null && l.price.amount > 0);
    if (withPrice.length === 0) return { min: 0, max: 1000 };
    const amounts = withPrice.map((l) => l.price!.amount);
    let min = Math.floor(Math.min(...amounts));
    let max = Math.ceil(Math.max(...amounts));
    if (max <= min) max = min + 100;
    return { min, max };
  });

  sliderMin = computed(() => this.priceRange().min);
  sliderMax = computed(() => this.priceRange().max);

  filteredListings = computed(() => {
    let list = this.allListings;
    const q = this.searchQuery().trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description?.toLowerCase().includes(q) ?? false) ||
          l.category.toLowerCase().includes(q) ||
          (l.subcategory?.toLowerCase().includes(q) ?? false)
      );
    }
    const cat = this.selectedCategory();
    if (cat) list = list.filter((l) => l.category === cat);
    const sub = this.selectedSubcategory();
    if (sub) list = list.filter((l) => l.subcategory === sub);
    const cond = this.selectedCondition();
    if (cond) list = list.filter((l) => l.condition === cond);
    const status = this.selectedStatus();
    if (status) list = list.filter((l) => l.status === status);
    const tag = this.selectedTag();
    if (tag) {
      const slug = tag.trim().toLowerCase();
      list = list.filter((l) => l.tags?.some((t) => tagToSlug(t) === slug) ?? false);
    }
    const min = this.priceMin();
    const max = this.priceMax();
    const range = this.priceRange();
    const fullRange = min <= range.min && max >= range.max;
    if (!fullRange) {
      list = list.filter((l) => {
        if (l.price == null) return false;
        const p = l.price.amount;
        return p >= min && p <= max;
      });
    }
    return list;
  });

  constructor(
    private readonly getListings: GetListingsUseCase,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.querySub = this.route.queryParamMap.subscribe((params) => {
      const tag = params.get('tag')?.trim() ?? '';
      this.selectedTag.set(tag);
    });
    this.load();
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.getListings
      .execute({ type: this.selectedType(), isVisible: true })
      .then((list) => {
        this.allListings = list;
        const withPrice = list.filter((l) => l.price != null && l.price.amount > 0);
        const min = withPrice.length ? Math.floor(Math.min(...withPrice.map((l) => l.price!.amount))) : 0;
        const max = withPrice.length ? Math.ceil(Math.max(...withPrice.map((l) => l.price!.amount))) : 1000;
        this.priceMin.set(min);
        this.priceMax.set(max);
        this.loading = false;
      })
      .catch((e) => {
        this.error = e?.message ?? 'Erro ao carregar listagem.';
        this.loading = false;
        console.error('[Marketplace] getListings failed:', e);
      });
  }

  selectType(type: ListingType): void {
    this.selectedType.set(type);
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.selectedCondition.set('');
    this.load();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
    this.selectedSubcategory.set('');
  }

  onSubcategoryChange(value: string): void {
    this.selectedSubcategory.set(value);
  }

  onConditionChange(value: string): void {
    this.selectedCondition.set(value === '' ? '' : (value as PartCondition));
  }

  onStatusChange(value: string): void {
    this.selectedStatus.set(value === '' ? '' : (value as ListingStatus));
  }

  onPriceRangeChange(minValue: number, maxValue: number): void {
    const range = this.priceRange();
    let min = Number.isNaN(minValue) ? range.min : Math.max(range.min, minValue);
    let max = Number.isNaN(maxValue) ? range.max : Math.min(range.max, maxValue);
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }
    this.priceMin.set(min);
    this.priceMax.set(max);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.selectedSubcategory.set('');
    this.selectedCondition.set('');
    this.selectedStatus.set('');
    this.selectedTag.set('');
    const range = this.priceRange();
    this.priceMin.set(range.min);
    this.priceMax.set(range.max);
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  clearTagFilter(): void {
    this.selectedTag.set('');
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }

  thumbnailUrl(listing: Listing): string | null {
    return listing.imageUrls?.length ? listing.imageUrls[0] : null;
  }

  priceText(listing: Listing): string {
    if (!listing.price) return 'Sob consulta';
    return `${listing.price.amount} €`;
  }
}

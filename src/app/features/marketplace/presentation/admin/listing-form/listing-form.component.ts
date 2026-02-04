import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { CreateListingUseCase } from '../../../application/use-cases/create-listing.usecase';
import { UpdateListingUseCase } from '../../../application/use-cases/update-listing.usecase';
import { GetListingByIdUseCase } from '../../../application/use-cases/get-listing-by-id.usecase';
import { ListingImageUploadService } from '../../../infrastructure/supabase/listing-image-upload.service';
import { AdminToastService } from '../../services/admin-toast.service';
import { ListingType } from '../../../domain/enums/listing-type.enum';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { PartCondition } from '../../../domain/enums/part-condition.enum';
import { MAIN_CATEGORIES, getSubcategoriesFor } from '../../../domain/constants/categories';
import { Money } from '../../../domain/value-objects/money.vo';
import { TagInputComponent } from '../../shared/tag-input/tag-input.component';

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SafeResourceUrlPipe, TagInputComponent],
  templateUrl: './listing-form.component.html',
  styleUrls: ['./listing-form.component.scss']
})
export class ListingFormComponent implements OnInit {
  form: FormGroup;
  isEdit = false;
  listingId: string | null = null;
  isSubmitting = false;
  isUploading = false;
  error: string | null = null;

  readonly ListingType = ListingType;
  readonly ListingStatus = ListingStatus;
  readonly PartCondition = PartCondition;
  readonly mainCategories = [...MAIN_CATEGORIES];
  readonly subcategoriesFor = (category: string) => getSubcategoriesFor(category);

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly getListingById: GetListingByIdUseCase,
    private readonly createListing: CreateListingUseCase,
    private readonly updateListing: UpdateListingUseCase,
    private readonly imageUpload: ListingImageUploadService,
    private readonly toast: AdminToastService,
    private readonly ngZone: NgZone
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      type: [ListingType.CAR_PART, [Validators.required]],
      category: ['', [Validators.required]],
      subcategory: [''],
      condition: [PartCondition.NEW, [Validators.required]],
      status: [ListingStatus.AVAILABLE, [Validators.required]],
      isVisible: [true, [Validators.required]],
      sellerEmail: ['', [Validators.required, Validators.email]],
      sellerPhone: [''],
      priceAmount: [null as number | null],
      tags: this.fb.array([]),
      imageUrls: this.fb.array([]),
      brand: [''],
      model: [''],
      partCode: ['']
    });
  }

  get imageUrls(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  get tagsArray(): FormArray {
    return this.form.get('tags') as FormArray;
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.listingId = id;
      this.getListingById.execute(id).then((listing) => {
        if (!listing) return;
        this.form.patchValue({
          title: listing.title,
          description: listing.description ?? '',
          type: listing.type,
          category: listing.category,
          subcategory: listing.subcategory ?? '',
          condition: listing.condition ?? PartCondition.NEW,
          status: listing.status,
          isVisible: listing.isVisible !== false,
          sellerEmail: listing.sellerEmail,
          sellerPhone: listing.sellerPhone ?? '',
          priceAmount: listing.price?.amount ?? null,
          brand: (listing.attributes as Record<string, unknown>)?.['brand'] ?? '',
          model: (listing.attributes as Record<string, unknown>)?.['model'] ?? '',
          partCode: (listing.attributes as Record<string, unknown>)?.['partCode'] ?? ''
        });
        this.imageUrls.clear();
        (listing.imageUrls ?? []).filter((u) => u?.trim()).forEach((url) =>
          this.imageUrls.push(this.fb.control(url, [Validators.required, Validators.pattern(/^https?:\/\//)]))
        );
        this.tagsArray.clear();
        (listing.tags ?? []).filter((t) => t?.trim()).forEach((tag) => this.tagsArray.push(this.fb.control(tag.trim())));
      }).catch((e) => (this.error = e?.message ?? 'Erro ao carregar.'));
    }
  }

  removeImageUrl(index: number): void {
    this.imageUrls.removeAt(index);
  }

  onCategoryControlChange(value: string): void {
    this.form.patchValue({ subcategory: '' }, { emitEvent: false });
  }

  async onImageFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;
    this.isUploading = true;
    this.error = null;
    try {
      const urls = await this.imageUpload.uploadFiles(Array.from(files), this.listingId ?? undefined);
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            for (const url of urls) {
              this.imageUrls.push(this.fb.control(url, [Validators.required, Validators.pattern(/^https:\/\//)]));
            }
            input.value = '';
            this.isUploading = false;
          });
        }, 0);
      });
    } catch (e) {
      const msg = (e as Error)?.message ?? 'Erro ao carregar imagens.';
      this.error = msg + ' Certifique-se de que está autenticado e que o bucket marketplace-images existe e permite upload (ver docs/supabase-storage-setup.md).';
      this.toast.showError(msg);
      console.error('[Marketplace] Upload falhou:', e);
      setTimeout(() => (this.isUploading = false), 0);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    const type = this.form.value.type as ListingType;
    const attributes: Record<string, unknown> = {};
    if (type === ListingType.CAR_PART) {
      attributes['brand'] = this.form.value.brand ?? '';
      attributes['model'] = this.form.value.model ?? '';
      attributes['partCode'] = this.form.value.partCode ?? '';
    }
    const tagsRaw = ((this.form.get('tags')?.value ?? []) as string[]).map((s) => String(s).trim()).filter((s) => s.length > 0);
    const imageUrls = (this.form.value.imageUrls as string[]).filter((u: string) => u?.trim());
    if (!imageUrls.length) {
      this.error = 'Pelo menos uma imagem é obrigatória. Carregue imagens acima.';
      return;
    }
    const payload = {
      title: this.form.value.title.trim(),
      description: (this.form.value.description ?? '').trim(),
      type,
      category: (this.form.value.category ?? '').trim(),
      subcategory: (this.form.value.subcategory ?? '').trim() || undefined,
      condition: (this.form.value.condition as PartCondition) ?? PartCondition.NEW,
      status: this.form.value.status as ListingStatus,
      isVisible: this.form.value.isVisible !== false,
      sellerEmail: this.form.value.sellerEmail.trim(),
      sellerPhone: (this.form.value.sellerPhone as string)?.trim() || undefined,
      price: this.form.value.priceAmount != null ? Money.fromNumber(Number(this.form.value.priceAmount)) : undefined,
      tags: tagsRaw.length ? tagsRaw : undefined,
      attributes: Object.keys(attributes).length ? attributes : undefined,
      imageUrls
    };

    this.isSubmitting = true;
    this.error = null;

    const done = () => {
      this.isSubmitting = false;
      this.toast.showSuccess(this.isEdit ? 'Anúncio guardado.' : 'Anúncio criado.');
      this.router.navigate(['/marketplace/admin']);
    };

    if (this.isEdit && this.listingId) {
      this.updateListing.execute(this.listingId, payload).then(done).catch((e) => {
        const msg = e?.message ?? 'Erro ao guardar.';
        this.error = msg;
        this.toast.showError(msg);
        this.isSubmitting = false;
      });
    } else {
      this.createListing.execute(payload).then(done).catch((e) => {
        const msg = e?.message ?? 'Erro ao criar.';
        this.error = msg;
        this.toast.showError(msg);
        this.isSubmitting = false;
      });
    }
  }
}

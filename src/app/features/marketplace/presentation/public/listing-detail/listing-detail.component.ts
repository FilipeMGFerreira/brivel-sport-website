import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SafeResourceUrlPipe } from '../../pipes/safe-resource-url.pipe';
import { GetListingByIdUseCase } from '../../../application/use-cases/get-listing-by-id.usecase';
import { ContactSellerService } from '../../services/contact-seller.service';
import { Listing } from '../../../domain/entities/listing.entity';
import { getCarPartAttributes } from '../../../domain/entities/car-part.entity';
import { ListingStatus } from '../../../domain/enums/listing-status.enum';
import { PartCondition } from '../../../domain/enums/part-condition.enum';
import { Subscription } from 'rxjs';
import { appSettings } from '../../../../../appsettings';

const STATUS_LABELS: Record<ListingStatus, string> = {
  [ListingStatus.AVAILABLE]: 'Disponível',
  [ListingStatus.RESERVED]: 'Reservado',
  [ListingStatus.UNAVAILABLE]: 'Indisponível'
};

const CONDITION_LABELS: Record<PartCondition, string> = {
  [PartCondition.NEW]: 'Novo',
  [PartCondition.USED]: 'Usado'
};

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SafeResourceUrlPipe],
  templateUrl: './listing-detail.component.html',
  styleUrls: ['./listing-detail.component.scss']
})
export class ListingDetailComponent implements OnInit, OnDestroy, AfterViewChecked {
  listing: Listing | null = null;
  loading = true;
  error: string | null = null;
  selectedImageIndex = 0;
  lightboxOpen = false;
  lightboxIndex = 0;

  contactView: 'choice' | 'email' = 'choice';
  contactForm: FormGroup;
  contactSubmitting = false;
  contactSuccess = false;

  showSuccessModal = false;
  contactError: string | null = null;
  whatsappOpening = false;
  readonly turnstileSiteKey = ((appSettings as Record<string, unknown>)['turnstile'] as { siteKey?: string } | undefined)?.siteKey ?? '';
  private paramSub?: Subscription;
  private turnstileRendered = false;
  private successModalTimer: ReturnType<typeof setTimeout> | null = null;

  readonly ListingStatus = ListingStatus;
  readonly PartCondition = PartCondition;
  readonly statusLabel = (s: ListingStatus) => STATUS_LABELS[s];
  readonly conditionLabel = (c: PartCondition) => CONDITION_LABELS[c];

  tagToSlug(tag: string): string {
    return tag.trim().toLowerCase().replace(/\s+/g, '-');
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly getListingById: GetListingByIdUseCase,
    private readonly contactSeller: ContactSellerService,
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.contactForm = this.fb.group({
      buyerEmail: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (!id) {
        this.error = 'ID inválido.';
        this.loading = false;
        this.listing = null;
        return;
      }
      this.loading = true;
      this.error = null;
      this.listing = null;
      this.selectedImageIndex = 0;

      this.getListingById.execute(id).then((listing) => {
        this.listing = listing;
        this.loading = false;
        this.cdr.detectChanges();
      }).catch((e) => {
        this.error = e?.message ?? 'Erro ao carregar anúncio.';
        this.loading = false;
        this.cdr.detectChanges();
      });
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
    if (this.successModalTimer != null) {
      clearTimeout(this.successModalTimer);
      this.successModalTimer = null;
    }
  }

  ngAfterViewChecked(): void {
    if (this.contactView === 'email' && this.turnstileSiteKey && !this.turnstileRendered) {
      const el = document.getElementById('turnstile-contact');
      const win = window as Window & { turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; theme?: string }) => string } };
      if (el && win.turnstile && !el.querySelector('iframe')) {
        win.turnstile.render(el, { sitekey: this.turnstileSiteKey, theme: 'dark' });
        this.turnstileRendered = true;
        this.cdr.detectChanges();
      }
    }
    if (this.contactView !== 'email') this.turnstileRendered = false;
  }

  get imageUrls(): string[] {
    return this.listing?.imageUrls ?? [];
  }

  get mainImageUrl(): string | null {
    return this.imageUrls[this.selectedImageIndex] ?? this.imageUrls[0] ?? null;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  lightboxPrev(): void {
    const len = this.imageUrls.length;
    if (len === 0) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + len) % len;
  }

  lightboxNext(): void {
    const len = this.imageUrls.length;
    if (len === 0) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % len;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.showSuccessModal) {
      if (this.successModalTimer != null) {
        clearTimeout(this.successModalTimer);
        this.successModalTimer = null;
      }
      this.showSuccessModal = false;
      this.contactSuccess = false;
      this.cdr.detectChanges();
      this.router.navigate(['/marketplace/list']);
    } else if (this.contactView === 'email') {
      this.backToContactChoice();
    } else if (this.lightboxOpen) {
      this.closeLightbox();
    }
  }

  get carPartAttrs() {
    return this.listing ? getCarPartAttributes(this.listing) : null;
  }

  priceText(): string {
    if (!this.listing?.price) return 'Sob consulta';
    return `${this.listing.price.amount} €`;
  }

  /** Show inline email form instead of channel choice. */
  showEmailForm(): void {
    this.contactView = 'email';
    this.contactSuccess = false;
    this.contactError = null;
    this.turnstileRendered = false;
    this.cdr.detectChanges();
  }

  /** Go back to contact channel choice (email / WhatsApp). */
  backToContactChoice(): void {
    this.contactView = 'choice';
    this.contactForm.reset();
    this.contactError = null;
    this.cdr.detectChanges();
  }

  get captchaToken(): string {
    const el = document.querySelector('textarea[name="cf-turnstile-response"]') as HTMLTextAreaElement | null;
    return el?.value?.trim() ?? '';
  }

  async submitContactEmail(): Promise<void> {
    if (this.contactForm.invalid || !this.listing || this.contactSubmitting) return;
    const token = this.captchaToken;
    if (!token && this.turnstileSiteKey) {
      this.contactError = 'Por favor, complete a verificação de segurança.';
      this.cdr.detectChanges();
      return;
    }
    this.contactSubmitting = true;
    this.contactError = null;
    this.cdr.detectChanges();
    try {
      await this.contactSeller.createLeadEmail({
        listingId: this.listing.id,
        buyerEmail: this.contactForm.value.buyerEmail.trim(),
        message: this.contactForm.value.message.trim(),
        captchaToken: token,
      });
      this.contactForm.reset();
      this.contactSuccess = true;
      this.showSuccessModal = true;
      this.cdr.detectChanges();
      this.successModalTimer = setTimeout(() => {
        this.showSuccessModal = false;
        this.contactSuccess = false;
        this.successModalTimer = null;
        this.cdr.detectChanges();
        this.router.navigate(['/marketplace/list']);
      }, 3500);
    } catch (e) {
      this.contactError = (e as Error)?.message ?? 'Erro ao enviar mensagem. Tente novamente.';
      this.cdr.detectChanges();
    } finally {
      this.contactSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  openWhatsApp(): void {
    if (!this.listing?.sellerPhone || this.whatsappOpening) return;
    this.whatsappOpening = true;
    this.contactError = null;
    this.cdr.detectChanges();

    const prefill = `Olá, tenho interesse no anúncio: ${this.listing.title}`;
    const url = this.contactSeller.getWhatsAppUrl(this.listing.sellerPhone, prefill);

    // Open WhatsApp immediately in the same tab (more reliable on mobile/iOS)
    window.location.href = url;

    // Fire-and-forget lead creation; do not block WhatsApp opening if it fails
    this.contactSeller
      .createLeadWhatsApp({ listingId: this.listing.id })
      .catch((e) => {
        console.error('[Marketplace] Failed to create WhatsApp lead:', e);
      })
      .finally(() => {
        this.whatsappOpening = false;
        this.cdr.detectChanges();
      });
  }
}

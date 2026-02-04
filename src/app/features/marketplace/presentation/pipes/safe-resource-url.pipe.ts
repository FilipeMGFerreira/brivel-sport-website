import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Sanitizes a URL for use in img [src] so external URLs (e.g. Supabase Storage) load correctly.
 */
@Pipe({ name: 'safeResourceUrl', standalone: true })
export class SafeResourceUrlPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer) {}

  transform(url: string | null | undefined): SafeResourceUrl | string {
    if (url == null || url.trim() === '') return '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url.trim());
  }
}

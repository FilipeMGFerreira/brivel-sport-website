import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { appSettings } from '../appsettings';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private isInitialized = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.checkGA4Initialization();
    }
  }

  /**
   * Verifica se o GA4 está inicializado (script carregado no HTML)
   */
  private checkGA4Initialization(): void {
    // O script já está no index.html, apenas verifica se está disponível
    if (typeof window.gtag === 'function') {
      this.isInitialized = true;
    } else {
      // Aguarda o script carregar (caso ainda não tenha carregado)
      const checkInterval = setInterval(() => {
        if (typeof window.gtag === 'function') {
          this.isInitialized = true;
          clearInterval(checkInterval);
        }
      }, 100);
      
      // Timeout após 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
      }, 5000);
    }
  }

  /**
   * Rastreia um page view
   */
  trackPageView(pageTitle: string, pagePath?: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof window.gtag !== 'function') {
      return;
    }

    // Usa gtag diretamente (padrão oficial do GA4)
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: pagePath || window.location.href,
      page_path: pagePath || window.location.pathname
    });
  }

  /**
   * Rastreia um evento customizado
   */
  trackEvent(eventName: string, eventParams?: Record<string, any>): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (typeof window.gtag !== 'function') {
      return;
    }

    // Usa gtag diretamente (padrão oficial do GA4)
    window.gtag('event', eventName, eventParams || {});
  }

  /**
   * Rastreia clique em botão
   */
  trackButtonClick(buttonName: string, additionalParams?: Record<string, any>): void {
    this.trackEvent('button_click', {
      button_name: buttonName,
      ...additionalParams
    });
  }

  /**
   * Rastreia clique em navegação
   */
  trackNavigation(sectionName: string): void {
    this.trackEvent('navigation_click', {
      section_name: sectionName
    });
  }

  /**
   * Rastreia abertura de galeria
   */
  trackGalleryOpen(galleryType: 'car' | 'build', itemName: string): void {
    this.trackEvent('gallery_open', {
      gallery_type: galleryType,
      item_name: itemName
    });
  }

  /**
   * Rastreia navegação na galeria
   */
  trackGalleryNavigate(direction: 'next' | 'previous' | 'thumbnail', imageIndex: number, totalImages: number): void {
    this.trackEvent('gallery_navigate', {
      direction,
      image_index: imageIndex + 1,
      total_images: totalImages
    });
  }

  /**
   * Rastreia submissão de formulário
   */
  trackFormSubmit(formType: string, success: boolean = true): void {
    this.trackEvent(success ? 'form_submit' : 'form_error', {
      form_type: formType
    });
  }

  /**
   * Rastreia clique em link social
   */
  trackSocialClick(platform: string): void {
    this.trackEvent('social_click', {
      platform: platform.toLowerCase()
    });
  }
}

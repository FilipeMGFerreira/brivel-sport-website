import { Component } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private analyticsService: AnalyticsService) {}

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Track navigation click
      this.analyticsService.trackNavigation(sectionId);
    }
  }

  trackSocialClick(platform: string) {
    this.analyticsService.trackSocialClick(platform);
  }
}

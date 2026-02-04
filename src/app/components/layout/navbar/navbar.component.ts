import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.closeMenu();
      this.analyticsService.trackNavigation(sectionId);
      this.analyticsService.trackPageView(`${sectionId} - Brivel Sport`, `#${sectionId}`);
    }
  }

  onNavClick(sectionId: string) {
    const isHome = this.router.url === '/' || this.router.url === '';
    if (isHome) {
      this.scrollToSection(sectionId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToSection(sectionId), 100);
      });
    }
    this.closeMenu();
  }
}

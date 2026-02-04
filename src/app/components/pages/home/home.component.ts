import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstagramService, InstagramPost } from '../../../services/instagram.service';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  currentHeroIndex = 0;
  isLoadingPosts = false;
  
  heroImages = [
    './assets/cars/car1/car1_2.jpg',
    './assets/images/img1.jpg',
    './assets/cars/car2/car2_5.JPG',
    './assets/images/img7.jpeg',
    './assets/cars/car3/car3_5.jpeg',
    './assets/images/img2.jpg',
    './assets/cars/car1/car1_9.jpg',
    './assets/cars/car2/car2_2.jpg',
    './assets/images/img12.JPG',
    './assets/cars/car3/car3_10.JPG'
  ];

  // Instagram posts - será populado via API
  instagramPosts: InstagramPost[] = [];

  // Posts de fallback caso a API não esteja configurada
  private fallbackPosts: InstagramPost[] = [
    {
      id: '1',
      image: './assets/images/img1.jpg',
      caption: 'Preparação para a próxima corrida! 🏁',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 150,
      timestamp: new Date()
    },
    {
      id: '2',
      image: './assets/images/img2.jpg',
      caption: 'Nossa equipe em ação! 💪',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 200,
      timestamp: new Date()
    },
    {
      id: '3',
      image: './assets/images/img3.jpg',
      caption: 'Honda Civic TypeR pronto para competição! 🚗',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 180,
      timestamp: new Date()
    },
    {
      id: '4',
      image: './assets/images/img4.jpg',
      caption: 'Vitória na última corrida! 🏆',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 250,
      timestamp: new Date()
    },
    {
      id: '5',
      image: './assets/images/img5.jpeg',
      caption: 'Preparação técnica em andamento! 🔧',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 120,
      timestamp: new Date()
    },
    {
      id: '6',
      image: './assets/images/img6.jpeg',
      caption: 'Equipe Brivel Sport em destaque! ⭐',
      link: 'https://www.instagram.com/brivelsport/',
      likes: 300,
      timestamp: new Date()
    }
  ];

  constructor(
    private instagramService: InstagramService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.startHeroCarousel();
    this.loadInstagramPosts();
    // Track initial page view
    this.analyticsService.trackPageView('Home - Brivel Sport');
  }

  /**
   * Carrega os posts do Instagram via API
   */
  loadInstagramPosts() {
    this.isLoadingPosts = true;
    this.instagramPosts = []; // Limpa posts anteriores
    
    this.instagramService.getRecentPosts(6).subscribe({
      next: (posts: InstagramPost[]) => {
        if (posts && posts.length > 0) {
          this.instagramPosts = posts;
        } else {
          // Usa posts de fallback se a API não retornar dados
          this.instagramPosts = this.fallbackPosts;
        }
        this.isLoadingPosts = false;
      },
      error: (error: any) => {
        // Usa posts de fallback em caso de erro
        this.instagramPosts = this.fallbackPosts;
        this.isLoadingPosts = false;
      }
    });
  }

  startHeroCarousel() {
    setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
    }, 5000);
  }

  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Track navigation click
      this.analyticsService.trackButtonClick(`hero_${sectionId}`, {
        section: sectionId
      });
      // Track page view for section
      this.analyticsService.trackPageView(`${sectionId} - Brivel Sport`, `#${sectionId}`);
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';

export interface RaceBuild {
  id: number;
  name: string;
  year: number;
  owner: string;
  championship: string;
  mainImage: string;
  images: string[];
  buildImages: string[];
}

@Component({
  selector: 'app-builds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './builds.component.html'
})
export class BuildsComponent {
  selectedBuild: RaceBuild | null = null;
  selectedCarImages: RaceBuild | null = null;
  currentImageIndex = 0;
  currentCarImageIndex = 0;
  isBuildGallery = false;

  constructor(private analyticsService: AnalyticsService) {}

  builds: RaceBuild[] = [
    {
      id: 1,
      name: 'Honda Civic TypeR #150',
      year: 2022,
      owner: 'Filipe Ferreira',
      championship: 'Type R Legacy Cup',
      mainImage: './assets/cars/car1/car1_6.jpg',
      images: [
        './assets/cars/car1/car1_1.jpg',
        './assets/cars/car1/car1_2.jpg',
        './assets/cars/car1/car1_3.jpg',
        './assets/cars/car1/car1_4.jpg',
        './assets/cars/car1/car1_5.jpg',
        './assets/cars/car1/car1_6.jpg',
        './assets/cars/car1/car1_7.jpg',
        './assets/cars/car1/car1_8.JPG',
        './assets/cars/car1/car1_9.jpg',
        './assets/cars/car1/car1_10.JPG',
        './assets/cars/car1/car1_11.JPG',
        './assets/cars/car1/car1_12.JPG'
      ],
      buildImages: [
        './assets/cars/car1/build/build1_1.jpg',
        './assets/cars/car1/build/build1_2.jpg',
        './assets/cars/car1/build/build1_3.jpg',
        './assets/cars/car1/build/build1_4.jpg',
        './assets/cars/car1/build/build1_5.jpg',
        './assets/cars/car1/build/build1_6.jpg',
        './assets/cars/car1/build/build1_7.jpg',
        './assets/cars/car1/build/build1_8.jpg',
        './assets/cars/car1/build/build1_9.jpg',
        './assets/cars/car1/build/build1_10.jpg',
        './assets/cars/car1/build/build1_11.jpg',
        './assets/cars/car1/build/build1_12.jpg',
        './assets/cars/car1/build/build1_13.jpg',
        './assets/cars/car1/build/build1_14.jpg',
        './assets/cars/car1/build/build1_15.jpg',
        './assets/cars/car1/build/build1_16.jpg'
      ]
    },
    {
      id: 2,
      name: 'Honda Civic TypeR #173',
      year: 2025,
      owner: 'Paulo Taveira',
      championship: 'Type R Legacy Cup',
      mainImage: './assets/cars/car3/car3_1.jpg',
      images: [
        './assets/cars/car3/car3_1.jpg',
        './assets/cars/car3/car3_2.jpg',
        './assets/cars/car3/car3_3.jpg',
        './assets/cars/car3/car3_4.jpg',
        './assets/cars/car3/car3_5.JPG',
        './assets/cars/car3/car3_6.JPG',
        './assets/cars/car3/car3_7.JPG',
        './assets/cars/car3/car3_8.JPG',
        './assets/cars/car3/car3_9.JPG',
        './assets/cars/car3/car3_10.JPG',
        './assets/cars/car3/car3_11.JPG'
      ],
      buildImages: (() => {
        const images: string[] = [];
        for (let i = 1; i <= 75; i++) {
          images.push(`./assets/cars/car3/build/build3_${i}.jpg`);
        }
        return images;
      })()
    }
  ];

  selectBuild(build: RaceBuild) {
    this.selectedBuild = build;
    this.currentImageIndex = 0;
    this.isBuildGallery = true;
    // Track button click and gallery open
    this.analyticsService.trackButtonClick('ver_fotos_build', {
      build_name: build.name
    });
    this.analyticsService.trackGalleryOpen('build', build.name);
  }

  selectCarImages(build: RaceBuild) {
    this.selectedCarImages = build;
    this.currentCarImageIndex = 0;
    this.isBuildGallery = false;
    // Track gallery open for car images
    this.analyticsService.trackGalleryOpen('car', build.name);
  }

  closeModal() {
    this.selectedBuild = null;
    this.selectedCarImages = null;
    this.currentImageIndex = 0;
    this.currentCarImageIndex = 0;
    this.isBuildGallery = false;
  }

  nextImage() {
    if (this.isBuildGallery && this.selectedBuild) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedBuild.buildImages.length;
      this.analyticsService.trackGalleryNavigate('next', this.currentImageIndex, this.selectedBuild.buildImages.length);
    } else if (!this.isBuildGallery && this.selectedCarImages) {
      this.currentCarImageIndex = (this.currentCarImageIndex + 1) % this.selectedCarImages.images.length;
      this.analyticsService.trackGalleryNavigate('next', this.currentCarImageIndex, this.selectedCarImages.images.length);
    }
  }

  previousImage() {
    if (this.isBuildGallery && this.selectedBuild) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedBuild.buildImages.length - 1 
        : this.currentImageIndex - 1;
      this.analyticsService.trackGalleryNavigate('previous', this.currentImageIndex, this.selectedBuild.buildImages.length);
    } else if (!this.isBuildGallery && this.selectedCarImages) {
      this.currentCarImageIndex = this.currentCarImageIndex === 0 
        ? this.selectedCarImages.images.length - 1 
        : this.currentCarImageIndex - 1;
      this.analyticsService.trackGalleryNavigate('previous', this.currentCarImageIndex, this.selectedCarImages.images.length);
    }
  }

  goToImage(index: number) {
    if (this.isBuildGallery && this.selectedBuild) {
      this.currentImageIndex = index;
      this.analyticsService.trackGalleryNavigate('thumbnail', index, this.selectedBuild.buildImages.length);
    } else if (!this.isBuildGallery && this.selectedCarImages) {
      this.currentCarImageIndex = index;
      this.analyticsService.trackGalleryNavigate('thumbnail', index, this.selectedCarImages.images.length);
    }
  }
}

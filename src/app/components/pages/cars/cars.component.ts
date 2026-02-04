import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../../services/analytics.service';

export interface Car {
  id: number;
  name: string;
  description: string;
  image: string;
  images: string[];
  championships: string[];
  stats: {
    raceStarts: string;
    podiums: string;
    wins: string;
    polePositions: string;
  };
}

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cars.component.html'
})
export class CarsComponent {
  selectedCar: Car | null = null;
  currentImageIndex = 0;

  constructor(private analyticsService: AnalyticsService) {}

  cars: Car[] = [
    {
      id: 1,
      name: 'Honda Civic TypeR #150',
      description: 'Construido sobre a regulamentação Civic Atomic Cup e atualizado para Type R Legacy Cup, construido no ano de 2022.',
      image: './assets/cars/car1/car1_1.jpg',
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
      championships: [
        'Troféu Type R Legacy Cup',
        'Campeonato de Portugal de Montanha',
        'Campeonato de Portugal de Velocidade Super Legends'
      ],
      stats: {
        raceStarts: '24',
        podiums: '12',
        wins: '5',
        polePositions: '8'
      }
    },
    {
      id: 2,
      name: 'Honda Civic TypeR #156',
      description: 'Construido sobre a regulamentação Type R Legacy Cup, construido no ano de 2024.',
      image: './assets/cars/car2/car2_1.jpg',
      images: [
        './assets/cars/car2/car2_1.jpg',
        './assets/cars/car2/car2_2.jpg',
        './assets/cars/car2/car2_3.jpg',
        './assets/cars/car2/car2_4.JPG',
        './assets/cars/car2/car2_5.JPG',
        './assets/cars/car2/car2_6.JPG',
        './assets/cars/car2/car2_7.JPG',
        './assets/cars/car2/car2_8.JPG',
        './assets/cars/car2/car2_9.JPG'
      ],
      championships: [
        'Troféu Type R Legacy Cup',
        'Campeonato de Portugal de Montanha',
        'Campeonato de Portugal de Velocidade Super Legends'
      ],
      stats: {
        raceStarts: '18',
        podiums: '9',
        wins: '3',
        polePositions: '6'
      }
    }
  ];

  selectCar(car: Car) {
    this.selectedCar = car;
    this.currentImageIndex = 0;
    // Track gallery open
    this.analyticsService.trackGalleryOpen('car', car.name);
  }

  closeModal() {
    this.selectedCar = null;
    this.currentImageIndex = 0;
  }

  nextImage() {
    if (this.selectedCar) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedCar.images.length;
      // Track gallery navigation
      this.analyticsService.trackGalleryNavigate('next', this.currentImageIndex, this.selectedCar.images.length);
    }
  }

  previousImage() {
    if (this.selectedCar) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedCar.images.length - 1 
        : this.currentImageIndex - 1;
      // Track gallery navigation
      this.analyticsService.trackGalleryNavigate('previous', this.currentImageIndex, this.selectedCar.images.length);
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
    if (this.selectedCar) {
      // Track gallery navigation
      this.analyticsService.trackGalleryNavigate('thumbnail', index, this.selectedCar.images.length);
    }
  }

  scrollToContact() {
    const element = document.getElementById('contato');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Track button click
      this.analyticsService.trackButtonClick('alugar_carro');
    }
  }
}

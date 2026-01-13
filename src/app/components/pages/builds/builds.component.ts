import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RaceBuild {
  id: number;
  name: string;
  year: number;
  owner: string;
  championship: string;
  mainImage: string;
  images: string[];
}

@Component({
  selector: 'app-builds',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './builds.component.html'
})
export class BuildsComponent {
  selectedBuild: RaceBuild | null = null;
  currentImageIndex = 0;

  builds: RaceBuild[] = [
    {
      id: 1,
      name: 'Honda Civic TypeR #1',
      year: 2023,
      owner: 'João Silva',
      championship: 'Campeonato Nacional de Velocidade',
      mainImage: './assets/cars/car1/car1_1.jpg',
      images: [
        './assets/cars/car1/car1_1.jpg',
        './assets/cars/car1/car1_2.jpg',
        './assets/cars/car1/car1_3.jpg',
        './assets/cars/car1/car1_4.jpg'
      ]
    },
    {
      id: 2,
      name: 'Honda Civic TypeR #2',
      year: 2022,
      owner: 'Maria Santos',
      championship: 'TCR Portugal',
      mainImage: './assets/cars/car2/car2_1.jpg',
      images: [
        './assets/cars/car2/car2_1.jpg',
        './assets/cars/car2/car2_2.jpg',
        './assets/cars/car2/car2_3.jpg'
      ]
    },
    {
      id: 3,
      name: 'Honda Civic TypeR #3',
      year: 2024,
      owner: 'Pedro Costa',
      championship: 'Circuito de Vila Real',
      mainImage: './assets/cars/car3/car3_1.jpg',
      images: [
        './assets/cars/car3/car3_1.jpg',
        './assets/cars/car3/car3_2.jpg',
        './assets/cars/car3/car3_3.jpg'
      ]
    }
  ];

  selectBuild(build: RaceBuild) {
    this.selectedBuild = build;
    this.currentImageIndex = 0;
  }

  closeModal() {
    this.selectedBuild = null;
    this.currentImageIndex = 0;
  }

  nextImage() {
    if (this.selectedBuild) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedBuild.images.length;
    }
  }

  previousImage() {
    if (this.selectedBuild) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.selectedBuild.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number) {
    this.currentImageIndex = index;
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentHeroIndex = 0;
  
  heroImages = [
    'assets/images/img1.jpg',
    'assets/images/img2.jpg',
    'assets/images/img3.jpg',
    'assets/images/img4.jpg',
    'assets/images/img5.jpeg',
    'assets/images/img6.jpeg',
    'assets/images/img7.jpeg',
    'assets/images/img8.jpeg',
    'assets/cars/car1/car1_1.jpg',
    'assets/cars/car1/car1_2.jpg',
    'assets/cars/car2/car2_1.jpg',
    'assets/cars/car3/car3_1.jpg'
  ];

  ngOnInit() {
    this.startHeroCarousel();
  }

  startHeroCarousel() {
    setInterval(() => {
      this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
    }, 5000);
  }

  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
  }
}

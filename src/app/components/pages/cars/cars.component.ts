import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent {
  cars = [
    {
      id: 1,
      name: 'Honda Civic TypeR #1',
      description: 'Carro de competição totalmente preparado, otimizado para pista com configurações de alto desempenho.',
      image: 'assets/cars/car1/car1_1.jpg',
      images: [
        'assets/cars/car1/car1_1.jpg',
        'assets/cars/car1/car1_2.jpg',
        'assets/cars/car1/car1_3.jpg'
      ]
    },
    {
      id: 2,
      name: 'Honda Civic TypeR #2',
      description: 'Equipado com as melhores peças e ajustes finos para máxima performance em competições.',
      image: 'assets/cars/car2/car2_1.jpg',
      images: [
        'assets/cars/car2/car2_1.jpg',
        'assets/cars/car2/car2_2.jpg',
        'assets/cars/car2/car2_3.jpg'
      ]
    },
    {
      id: 3,
      name: 'Honda Civic TypeR #3',
      description: 'Preparado com tecnologia de ponta e experiência de pista para resultados excepcionais.',
      image: 'assets/cars/car3/car3_1.jpg',
      images: [
        'assets/cars/car3/car3_1.jpg',
        'assets/cars/car3/car3_2.jpg',
        'assets/cars/car3/car3_3.jpg'
      ]
    }
  ];
}

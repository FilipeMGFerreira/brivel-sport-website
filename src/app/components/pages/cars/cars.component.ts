import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cars.component.html'
})
export class CarsComponent {
  cars = [
    {
      id: 1,
      name: 'Honda Civic TypeR #1',
      description: 'Carro de competição totalmente preparado, otimizado para pista com configurações de alto desempenho.',
      image: './assets/cars/car1/car1_1.jpg',
      stats: {
        power: '350 HP',
        weight: '1.200 kg',
        topSpeed: '280 km/h',
        acceleration: '4.2s'
      }
    },
    {
      id: 2,
      name: 'Honda Civic TypeR #2',
      description: 'Equipado com as melhores peças e ajustes finos para máxima performance em competições.',
      image: './assets/cars/car2/car2_1.jpg',
      stats: {
        power: '380 HP',
        weight: '1.150 kg',
        topSpeed: '290 km/h',
        acceleration: '3.9s'
      }
    },
    {
      id: 3,
      name: 'Honda Civic TypeR #3',
      description: 'Preparado com tecnologia de ponta e experiência de pista para resultados excepcionais.',
      image: './assets/cars/car3/car3_1.jpg',
      stats: {
        power: '400 HP',
        weight: '1.100 kg',
        topSpeed: '300 km/h',
        acceleration: '3.6s'
      }
    }
  ];
}

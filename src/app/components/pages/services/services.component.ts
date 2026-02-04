import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  services = [
    {
      title: 'Assistência Técnica',
      description: 'Acompanhamento técnico completo em pista durante competições e eventos, assegurando fiabilidade e máximo desempenho.',
      image: './assets/images/img8.jpeg'
    },
    {
      title: 'Aluguer de Viaturas',
      description: 'Viaturas de competição totalmente preparadas e prontas a utilizar.',
      image: './assets/cars/car2/car2_4.JPG'
    },
    {
      title: 'Preparação de Viaturas',
      description: 'Serviços profissionais de setup, manutenção e optimização de performance para competição.',
      image: './assets/images/img3.jpg'
    }
    
  ];
}

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
      title: 'Assistência em Corridas',
      description: 'Oferecemos suporte completo em pista durante competições e eventos. Nossa equipe técnica está sempre pronta para garantir que você tenha o melhor desempenho possível.',
      image: './assets/images/img3.jpg'
    },
    {
      title: 'Aluguel de Carros',
      description: 'Disponibilizamos carros de competição preparados e prontos para uso. Nossa frota de Honda Civic TypeR está sempre em perfeitas condições para suas corridas.',
      image: './assets/images/img4.jpg'
    },
    {
      title: 'Preparação de Carros',
      description: 'Serviços completos de setup, manutenção e otimização de performance. Nossa equipe especializada garante que seu carro esteja no melhor estado possível.',
      image: './assets/images/img5.jpeg'
    }
  ];
}

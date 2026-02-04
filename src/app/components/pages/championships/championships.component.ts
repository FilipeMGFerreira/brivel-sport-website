import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Championship {
  id: number;
  name: string;
  description: string;
  image: string;
  isPrincipal: boolean;
  websiteUrl?: string;
}

@Component({
  selector: 'app-championships',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './championships.component.html'
})
export class ChampionshipsComponent {
  championships: Championship[] = [
    {
      id: 1,
      name: 'Troféu Type R Legacy Cup',
      description: 'Troféu monomarca de velocidade dedicado ao Honda Civic Type-R (EP3). Formato desportivo com 5 provas em Portugal e Espanha, 2 corridas por prova de 25 minutos cada. Competição que celebra o legado do modelo icónico, promovendo igualdade de condições e destacando o talento individual dos pilotos.',
      image: './assets/logos/typerlegacycuplogo.png',
      isPrincipal: true,
      websiteUrl: 'https://www.typerlegacycup.com'
    },
    {
      id: 2,
      name: 'Campeonato de Portugal de Montanha',
      description: 'Uma das competições mais desafiantes do automobilismo nacional, com provas realizadas em diversas rampas icónicas do país. Competição que testa a técnica e coragem dos pilotos em subidas íngremes e técnicas.',
      image: './assets/logos/cpmlogo.png',
      isPrincipal: false,
      websiteUrl: 'https://campeonatomontanha.pt/'
    },
    {
      id: 3,
      name: 'Campeonato de Portugal de Velocidade Super Legends',
      description: 'Competição que reúne máquinas potentes e uma competitividade de topo. Campeonato que oferece espetáculos de alta velocidade e emoção, destacando-se pela performance e competitividade dos participantes.',
      image: './assets/logos/cpvllogo.png',
      isPrincipal: false,
      websiteUrl: 'https://www.fpak.pt/campeonatos/2026/velocidade/cpvsl'
    }
  ];
}

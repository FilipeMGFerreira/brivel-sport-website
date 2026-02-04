import { Component } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { ServicesComponent } from '../services/services.component';
import { ChampionshipsComponent } from '../championships/championships.component';
import { CarsComponent } from '../cars/cars.component';
import { BuildsComponent } from '../builds/builds.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HomeComponent, ServicesComponent, ChampionshipsComponent, CarsComponent, BuildsComponent, ContactComponent],
  templateUrl: './main.component.html'
})
export class MainComponent {
}

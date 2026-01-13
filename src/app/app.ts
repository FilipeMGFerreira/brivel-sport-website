import { Component } from '@angular/core';
import { NavbarComponent } from './components/layout/navbar/navbar.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { MainComponent } from './components/pages/main/main.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, FooterComponent, MainComponent],
  templateUrl: './app.html'
})
export class App {
}

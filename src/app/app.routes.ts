import { Routes } from '@angular/router';
import { MainComponent } from './components/pages/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'marketplace',
    loadChildren: () =>
      import('./features/marketplace/marketplace.module').then((m) => m.MarketplaceModule)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

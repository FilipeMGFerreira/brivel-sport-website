import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminToastComponent } from '../admin/toast/admin-toast.component';

@Component({
  selector: 'app-marketplace-shell',
  standalone: true,
  imports: [RouterOutlet, AdminToastComponent],
  styleUrls: ['./marketplace-shell.component.scss'],
  template: `
    <router-outlet></router-outlet>
    <app-admin-toast />
  `
})
export class MarketplaceShellComponent {}

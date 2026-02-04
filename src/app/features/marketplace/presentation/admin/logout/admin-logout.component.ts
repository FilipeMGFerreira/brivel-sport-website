import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthRepository } from '../../../domain/repositories/auth.repository';

/**
 * Handles logout: signs out via AuthRepository and redirects to marketplace list.
 * Used as a route target so the navbar can link to /marketplace/admin/logout.
 */
@Component({
  selector: 'app-admin-logout',
  standalone: true,
  imports: [],
  template: `<p class="text-text-gray text-sm p-4">A terminar sessão...</p>`
})
export class AdminLogoutComponent implements OnInit {
  constructor(
    private readonly auth: AuthRepository,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.auth.logout().then(() => {
      this.router.navigate(['/marketplace/list']);
    }).catch(() => {
      this.router.navigate(['/marketplace/list']);
    });
  }
}

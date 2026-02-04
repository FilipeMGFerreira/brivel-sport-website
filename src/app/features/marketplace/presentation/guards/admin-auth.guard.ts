import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthRepository } from '../../domain/repositories/auth.repository';

/**
 * Protects admin routes: only allows access when the user has a valid auth token (logged in via Supabase Auth).
 * Redirects to /marketplace/admin/login when not authenticated.
 */
export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthRepository);
  const router = inject(Router);
  return auth.isAuthenticated().then((ok) =>
    ok ? true : router.createUrlTree(['/marketplace/admin/login'])
  );
};

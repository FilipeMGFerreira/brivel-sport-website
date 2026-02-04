import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { AnalyticsService } from './services/analytics.service';
import { AuthRepository } from './features/marketplace/domain/repositories/auth.repository';
import { SupabaseAuthRepository } from './features/marketplace/infrastructure/supabase/supabase-auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    AnalyticsService,
    { provide: AuthRepository, useClass: SupabaseAuthRepository }
  ]
};

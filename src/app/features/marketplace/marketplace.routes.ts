import { Routes } from '@angular/router';
import { ListingRepository } from './domain/repositories/listing.repository';
import { AuthRepository } from './domain/repositories/auth.repository';
import { ListingSupabaseRepository } from './infrastructure/supabase/listing.supabase.repository';
import { SupabaseAuthRepository } from './infrastructure/supabase/supabase-auth.repository';
import { GetListingsUseCase } from './application/use-cases/get-listings.usecase';
import { GetListingByIdUseCase } from './application/use-cases/get-listing-by-id.usecase';
import { CreateListingUseCase } from './application/use-cases/create-listing.usecase';
import { UpdateListingUseCase } from './application/use-cases/update-listing.usecase';
import { DeleteListingUseCase } from './application/use-cases/delete-listing.usecase';
import { LoginUseCase } from './application/use-cases/login.usecase';
import { ListingListComponent } from './presentation/public/listing-list/listing-list.component';
import { ListingDetailComponent } from './presentation/public/listing-detail/listing-detail.component';
import { AdminLoginComponent } from './presentation/admin/login/admin-login.component';
import { AdminLogoutComponent } from './presentation/admin/logout/admin-logout.component';
import { AdminListingListComponent } from './presentation/admin/listing-list/admin-listing-list.component';
import { ListingFormComponent } from './presentation/admin/listing-form/listing-form.component';
import { adminAuthGuard } from './presentation/guards/admin-auth.guard';
import { MarketplaceShellComponent } from './presentation/marketplace-shell/marketplace-shell.component';

export const marketplaceRoutes: Routes = [
  {
    path: '',
    component: MarketplaceShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list/:id',
        component: ListingDetailComponent
      },
      {
        path: 'listing/:id',
        component: ListingDetailComponent
      },
      {
        path: 'list',
        component: ListingListComponent
      },
      {
        path: 'admin/login',
        component: AdminLoginComponent
      },
      {
        path: 'admin/logout',
        component: AdminLogoutComponent,
        canActivate: [adminAuthGuard]
      },
      {
        path: 'admin',
        component: AdminListingListComponent,
        canActivate: [adminAuthGuard]
      },
      {
        path: 'admin/new',
        component: ListingFormComponent,
        canActivate: [adminAuthGuard]
      },
      {
        path: 'admin/edit/:id',
        component: ListingFormComponent,
        canActivate: [adminAuthGuard]
      },
      {
        path: '**',
        redirectTo: 'list'
      }
    ]
  }
];

export const marketplaceProviders = [
  { provide: ListingRepository, useClass: ListingSupabaseRepository },
  { provide: AuthRepository, useClass: SupabaseAuthRepository },
  GetListingsUseCase,
  GetListingByIdUseCase,
  CreateListingUseCase,
  UpdateListingUseCase,
  DeleteListingUseCase,
  LoginUseCase
];

import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { marketplaceRoutes, marketplaceProviders } from './marketplace.routes';

@NgModule({
  imports: [RouterModule.forChild(marketplaceRoutes)],
  providers: marketplaceProviders
})
export class MarketplaceModule {}

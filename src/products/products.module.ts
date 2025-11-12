import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorController } from './finished-link-monitor.controller';
import { PotentialLinkMonitorController } from './potential-link-monitor.controller';
import { ProductItemsController } from './product-items.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    ProductsController,
    FinishedLinkMonitorController,
    PotentialLinkMonitorController,
    ProductItemsController,
  ],
  providers: [ProductsService],
})
export class ProductsModule {}

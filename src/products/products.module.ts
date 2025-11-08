import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorController } from './finished-link-monitor.controller';

@Module({
  controllers: [ProductsController, FinishedLinkMonitorController],
  providers: [ProductsService],
})
export class ProductsModule {}

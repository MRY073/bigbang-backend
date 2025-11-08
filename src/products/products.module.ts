import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorController } from './finished-link-monitor.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController, FinishedLinkMonitorController],
  providers: [ProductsService],
})
export class ProductsModule {}

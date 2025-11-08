import { Module } from '@nestjs/common';
import { AdAnalysisController } from './ad-analysis.controller';
import { AdAnalysisService } from './ad-analysis.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdAnalysisController],
  providers: [AdAnalysisService],
})
export class AdAnalysisModule {}

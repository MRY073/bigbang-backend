import { Module } from '@nestjs/common';
import { AdAnalysisController } from './ad-analysis.controller';
import { AdAnalysisService } from './ad-analysis.service';

@Module({
  controllers: [AdAnalysisController],
  providers: [AdAnalysisService],
})
export class AdAnalysisModule {}

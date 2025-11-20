import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

/**
 * AI 模块
 * 提供系统级提示词和 AI 服务
 */
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}


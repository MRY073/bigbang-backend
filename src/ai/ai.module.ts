import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiGatewayService } from './ai-gateway.service';
import { AiPromptCacheService } from './ai-prompt-cache.service';
import { AiProviderRegistry } from './providers/ai-provider.registry';
import { DeepseekProvider } from './providers/deepseek.provider';

/**
 * AI 模块
 * 提供系统级提示词和 AI 服务
 */
@Module({
  providers: [
    AiService,
    AiGatewayService,
    AiPromptCacheService,
    AiProviderRegistry,
    DeepseekProvider,
  ],
  exports: [AiService, AiGatewayService],
})
export class AiModule {}


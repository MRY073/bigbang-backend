import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiProviderKey } from './providers/ai-provider.interface';
import { AiProviderRegistry } from './providers/ai-provider.registry';
import {
  AiPromptCacheService,
  CreateLinkAiPromptRecord,
  LinkAiPromptRecord,
} from './ai-prompt-cache.service';
import {
  AiGatewayRequestDto,
  AiGatewayResponseDto,
} from './dto/ai-gateway.dto';
import { createHash } from 'node:crypto';

const DEFAULT_PROVIDER_MODELS: Record<AiProviderKey, string> = {
  [AiProviderKey.DEEPSEEK]: 'deepseek-chat',
};

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiProviderRegistry: AiProviderRegistry,
    private readonly aiPromptCacheService: AiPromptCacheService,
  ) {}

  /**
   * 统一对外暴露的 AI 调用入口
   */
  async requestAnalysis(
    request: AiGatewayRequestDto,
  ): Promise<AiGatewayResponseDto> {
    if (!request.linkId) {
      throw new Error('linkId 不可为空');
    }

    const promptDate = this.normalizeDate(request.promptDate);

    const cachedRecord = await this.aiPromptCacheService.getByLinkAndDate(
      request.linkId,
      promptDate,
    );

    if (!request.forceRefresh && cachedRecord?.status === 'success') {
      return this.buildResponseFromCache(cachedRecord);
    }

    const providerKey = request.provider ?? AiProviderKey.DEEPSEEK;
    const provider = this.aiProviderRegistry.resolve(providerKey);

    const promptPayload = this.buildPromptPayload(request);
    const fullPrompt = this.aiService.buildAnalysisPrompt({
      ...promptPayload,
      format: request.format,
      supplementaryPrompt: request.supplementaryPrompt,
    });

    const baseRecord = this.buildRecordBase({
      request,
      providerKey,
      promptDate,
      promptPayload,
      fullPrompt,
    });

    try {
      const providerResponse = await provider.createCompletion({
        prompt: fullPrompt,
        temperature: request.temperature,
        model: request.modelId,
        responseFormat: request.responseFormat ?? 'text',
      });

      const successRecord: CreateLinkAiPromptRecord = {
        ...baseRecord,
        model_name: providerResponse.model,
        ai_response: providerResponse.content,
        raw_response: JSON.stringify(providerResponse.raw ?? {}),
        prompt_tokens: providerResponse.usage?.promptTokens ?? null,
        completion_tokens: providerResponse.usage?.completionTokens ?? null,
        total_tokens: providerResponse.usage?.totalTokens ?? null,
        status: 'success',
      };

      await this.persistRecord(successRecord, cachedRecord?.id);

      return {
        result: providerResponse.content,
        provider: providerKey,
        model: providerResponse.model,
        promptDate,
        cacheHit: false,
        usage: providerResponse.usage,
      };
    } catch (error) {
      const failureRecord: CreateLinkAiPromptRecord = {
        ...baseRecord,
        status: 'failed',
        error_message:
          error instanceof Error ? error.message : 'AI 调用失败，未知错误',
      };

      await this.persistRecord(failureRecord, cachedRecord?.id);

      throw error;
    }
  }

  private buildPromptPayload(request: AiGatewayRequestDto) {
    return {
      question: request.question,
      adData: request.adData,
      shopeeData: request.shopeeData,
      productData: request.productData,
      context: request.context,
    };
  }

  private normalizeDate(date?: string | Date): string {
    if (!date) {
      return new Date().toISOString().slice(0, 10);
    }
    if (date instanceof Date) {
      return date.toISOString().slice(0, 10);
    }
    return new Date(date).toISOString().slice(0, 10);
  }

  private hashPrompt(prompt: string): string {
    return createHash('sha256').update(prompt).digest('hex');
  }

  private normalizeSupplementaryPrompt(
    supplementaryPrompt: AiGatewayRequestDto['supplementaryPrompt'],
  ): string | null {
    if (!supplementaryPrompt) {
      return null;
    }
    if (typeof supplementaryPrompt === 'string') {
      return supplementaryPrompt;
    }
    if (Array.isArray(supplementaryPrompt)) {
      return supplementaryPrompt.join('\n');
    }
    try {
      return JSON.stringify(supplementaryPrompt, null, 2);
    } catch (error) {
      this.logger.warn(`补充提示词序列化失败：${error}`);
      return null;
    }
  }

  private buildResponseFromCache(
    record: LinkAiPromptRecord,
  ): AiGatewayResponseDto {
    return {
      result: record.ai_response ?? '',
      provider: record.model_key as AiProviderKey,
      model: record.model_name,
      promptDate: record.prompt_date,
      cacheHit: true,
      cacheRecordId: record.id,
      usage: {
        promptTokens: record.prompt_tokens ?? undefined,
        completionTokens: record.completion_tokens ?? undefined,
        totalTokens: record.total_tokens ?? undefined,
      },
    };
  }

  private buildRecordBase(params: {
    request: AiGatewayRequestDto;
    providerKey: AiProviderKey;
    promptDate: string;
    promptPayload: Record<string, any>;
    fullPrompt: string;
  }): CreateLinkAiPromptRecord {
    const { request, providerKey, promptDate, promptPayload, fullPrompt } =
      params;
    return {
      link_id: request.linkId,
      link_url: request.linkUrl ?? null,
      shop_id: request.shopId ?? null,
      prompt_date: promptDate,
      model_key: providerKey,
      model_name:
        request.modelId ?? DEFAULT_PROVIDER_MODELS[providerKey] ?? 'unknown',
      prompt_text: fullPrompt,
      prompt_hash: this.hashPrompt(fullPrompt),
      business_payload: JSON.stringify(promptPayload),
      supplementary_prompt: this.normalizeSupplementaryPrompt(
        request.supplementaryPrompt,
      ),
      metadata: request.metadata ?? null,
    };
  }

  private async persistRecord(
    record: CreateLinkAiPromptRecord,
    existingId?: number,
  ) {
    if (existingId) {
      await this.aiPromptCacheService.update(existingId, record);
    } else {
      await this.aiPromptCacheService.create(record);
    }
  }
}



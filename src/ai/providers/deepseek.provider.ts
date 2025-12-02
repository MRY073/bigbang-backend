import { Injectable, Logger } from '@nestjs/common';
import {
  AiProvider,
  AiProviderKey,
  AiProviderRequest,
  AiProviderResponse,
} from './ai-provider.interface';
import {
  getDeepseekConfig,
  validateDeepseekConfig,
} from '../../config/deepseek.config';

@Injectable()
export class DeepseekProvider implements AiProvider {
  readonly key = AiProviderKey.DEEPSEEK;
  private readonly logger = new Logger(DeepseekProvider.name);
  private readonly apiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private readonly config = getDeepseekConfig();

  constructor() {
    // 构造函数中不验证配置，允许应用启动
    // 配置验证延迟到实际调用 API 时进行
  }

  async createCompletion(
    request: AiProviderRequest,
  ): Promise<AiProviderResponse> {
    // 在实际调用 API 时验证配置
    validateDeepseekConfig();
    // 验证后，apiKey 一定不为 null
    const apiKey = this.config.apiKey!;

    const body = {
      model: request.model ?? 'deepseek-chat',
      messages:
        request.messages ??
        [
          {
            role: 'user',
            content: request.prompt,
          },
        ],
      temperature: request.temperature ?? 0.3,
      response_format:
        request.responseFormat === 'json'
          ? {
              type: 'json_object',
            }
          : {
              type: 'text',
            },
    };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Deepseek API 调用失败：${response.status} - ${errorText}`,
      );
      throw new Error(`Deepseek API 调用失败：${response.statusText}`);
    }

    const data = (await response.json()) as any;
    const choice = data?.choices?.[0];
    const content = choice?.message?.content ?? '';

    return {
      id: data?.id ?? '',
      content,
      model: data?.model ?? body.model,
      raw: data,
      usage: {
        promptTokens: data?.usage?.prompt_tokens,
        completionTokens: data?.usage?.completion_tokens,
        totalTokens: data?.usage?.total_tokens,
      },
    };
  }
}




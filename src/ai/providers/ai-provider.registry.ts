import { Injectable } from '@nestjs/common';
import { AiProvider, AiProviderKey } from './ai-provider.interface';
import { DeepseekProvider } from './deepseek.provider';

@Injectable()
export class AiProviderRegistry {
  private readonly providers = new Map<AiProviderKey, AiProvider>();

  constructor(deepseekProvider: DeepseekProvider) {
    this.register(deepseekProvider);
  }

  resolve(providerKey: AiProviderKey = AiProviderKey.DEEPSEEK): AiProvider {
    const provider = this.providers.get(providerKey);
    if (!provider) {
      throw new Error(`未找到 AI Provider：${providerKey}`);
    }
    return provider;
  }

  private register(provider: AiProvider) {
    this.providers.set(provider.key, provider);
  }
}




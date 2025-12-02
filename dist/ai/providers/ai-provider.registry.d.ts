import { AiProvider, AiProviderKey } from './ai-provider.interface';
import { DeepseekProvider } from './deepseek.provider';
export declare class AiProviderRegistry {
    private readonly providers;
    constructor(deepseekProvider: DeepseekProvider);
    resolve(providerKey?: AiProviderKey): AiProvider;
    private register;
}

import { AiProvider, AiProviderKey, AiProviderRequest, AiProviderResponse } from './ai-provider.interface';
export declare class DeepseekProvider implements AiProvider {
    readonly key = AiProviderKey.DEEPSEEK;
    private readonly logger;
    private readonly apiUrl;
    private readonly config;
    constructor();
    createCompletion(request: AiProviderRequest): Promise<AiProviderResponse>;
}

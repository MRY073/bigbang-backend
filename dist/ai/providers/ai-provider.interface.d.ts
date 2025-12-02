export declare enum AiProviderKey {
    DEEPSEEK = "deepseek"
}
export type AiResponseFormat = 'text' | 'json';
export interface AiCompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface AiProviderRequest {
    prompt: string;
    messages?: AiCompletionMessage[];
    temperature?: number;
    model?: string;
    responseFormat?: AiResponseFormat;
    metadata?: Record<string, any>;
}
export interface AiProviderResponse {
    id: string;
    content: string;
    model: string;
    raw: any;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}
export interface AiProvider {
    readonly key: AiProviderKey;
    createCompletion(request: AiProviderRequest): Promise<AiProviderResponse>;
}

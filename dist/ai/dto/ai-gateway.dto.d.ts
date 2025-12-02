import { AnalysisRequestDto } from './analysis-request.dto';
import { AiProviderKey, AiResponseFormat } from '../providers/ai-provider.interface';
export declare class AiGatewayRequestDto extends AnalysisRequestDto {
    linkId: string;
    linkUrl?: string;
    shopId?: string;
    provider?: AiProviderKey;
    modelId?: string;
    temperature?: number;
    responseFormat?: AiResponseFormat;
    supplementaryPrompt?: string | string[] | Record<string, any>;
    promptDate?: string | Date;
    forceRefresh?: boolean;
    metadata?: Record<string, any>;
}
export interface AiGatewayResponseDto {
    result: string;
    provider: AiProviderKey;
    model: string;
    promptDate: string;
    cacheHit: boolean;
    cacheRecordId?: number;
    usage?: {
        promptTokens?: number;
        completionTokens?: number;
        totalTokens?: number;
    };
}

import { AiService } from './ai.service';
import { AiProviderRegistry } from './providers/ai-provider.registry';
import { AiPromptCacheService } from './ai-prompt-cache.service';
import { AiGatewayRequestDto, AiGatewayResponseDto } from './dto/ai-gateway.dto';
export declare class AiGatewayService {
    private readonly aiService;
    private readonly aiProviderRegistry;
    private readonly aiPromptCacheService;
    private readonly logger;
    constructor(aiService: AiService, aiProviderRegistry: AiProviderRegistry, aiPromptCacheService: AiPromptCacheService);
    requestAnalysis(request: AiGatewayRequestDto): Promise<AiGatewayResponseDto>;
    private buildPromptPayload;
    private normalizeDate;
    private hashPrompt;
    private normalizeSupplementaryPrompt;
    private buildResponseFromCache;
    private buildRecordBase;
    private persistRecord;
}

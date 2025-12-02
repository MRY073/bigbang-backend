"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGatewayService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_provider_interface_1 = require("./providers/ai-provider.interface");
const ai_provider_registry_1 = require("./providers/ai-provider.registry");
const ai_prompt_cache_service_1 = require("./ai-prompt-cache.service");
const node_crypto_1 = require("node:crypto");
const DEFAULT_PROVIDER_MODELS = {
    [ai_provider_interface_1.AiProviderKey.DEEPSEEK]: 'deepseek-chat',
};
let AiGatewayService = AiGatewayService_1 = class AiGatewayService {
    aiService;
    aiProviderRegistry;
    aiPromptCacheService;
    logger = new common_1.Logger(AiGatewayService_1.name);
    constructor(aiService, aiProviderRegistry, aiPromptCacheService) {
        this.aiService = aiService;
        this.aiProviderRegistry = aiProviderRegistry;
        this.aiPromptCacheService = aiPromptCacheService;
    }
    async requestAnalysis(request) {
        if (!request.linkId) {
            throw new Error('linkId 不可为空');
        }
        const promptDate = this.normalizeDate(request.promptDate);
        const cachedRecord = await this.aiPromptCacheService.getByLinkAndDate(request.linkId, promptDate);
        if (!request.forceRefresh && cachedRecord?.status === 'success') {
            return this.buildResponseFromCache(cachedRecord);
        }
        const providerKey = request.provider ?? ai_provider_interface_1.AiProviderKey.DEEPSEEK;
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
            const successRecord = {
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
        }
        catch (error) {
            const failureRecord = {
                ...baseRecord,
                status: 'failed',
                error_message: error instanceof Error ? error.message : 'AI 调用失败，未知错误',
            };
            await this.persistRecord(failureRecord, cachedRecord?.id);
            throw error;
        }
    }
    buildPromptPayload(request) {
        return {
            question: request.question,
            adData: request.adData,
            shopeeData: request.shopeeData,
            productData: request.productData,
            context: request.context,
        };
    }
    normalizeDate(date) {
        if (!date) {
            return new Date().toISOString().slice(0, 10);
        }
        if (date instanceof Date) {
            return date.toISOString().slice(0, 10);
        }
        return new Date(date).toISOString().slice(0, 10);
    }
    hashPrompt(prompt) {
        return (0, node_crypto_1.createHash)('sha256').update(prompt).digest('hex');
    }
    normalizeSupplementaryPrompt(supplementaryPrompt) {
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
        }
        catch (error) {
            this.logger.warn(`补充提示词序列化失败：${error}`);
            return null;
        }
    }
    buildResponseFromCache(record) {
        return {
            result: record.ai_response ?? '',
            provider: record.model_key,
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
    buildRecordBase(params) {
        const { request, providerKey, promptDate, promptPayload, fullPrompt } = params;
        return {
            link_id: request.linkId,
            link_url: request.linkUrl ?? null,
            shop_id: request.shopId ?? null,
            prompt_date: promptDate,
            model_key: providerKey,
            model_name: request.modelId ?? DEFAULT_PROVIDER_MODELS[providerKey] ?? 'unknown',
            prompt_text: fullPrompt,
            prompt_hash: this.hashPrompt(fullPrompt),
            business_payload: JSON.stringify(promptPayload),
            supplementary_prompt: this.normalizeSupplementaryPrompt(request.supplementaryPrompt),
            metadata: request.metadata ?? null,
        };
    }
    async persistRecord(record, existingId) {
        if (existingId) {
            await this.aiPromptCacheService.update(existingId, record);
        }
        else {
            await this.aiPromptCacheService.create(record);
        }
    }
};
exports.AiGatewayService = AiGatewayService;
exports.AiGatewayService = AiGatewayService = AiGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        ai_provider_registry_1.AiProviderRegistry,
        ai_prompt_cache_service_1.AiPromptCacheService])
], AiGatewayService);
//# sourceMappingURL=ai-gateway.service.js.map
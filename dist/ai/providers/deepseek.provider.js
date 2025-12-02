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
var DeepseekProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepseekProvider = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_interface_1 = require("./ai-provider.interface");
const deepseek_config_1 = require("../../config/deepseek.config");
let DeepseekProvider = DeepseekProvider_1 = class DeepseekProvider {
    key = ai_provider_interface_1.AiProviderKey.DEEPSEEK;
    logger = new common_1.Logger(DeepseekProvider_1.name);
    apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    config = (0, deepseek_config_1.getDeepseekConfig)();
    constructor() {
    }
    async createCompletion(request) {
        (0, deepseek_config_1.validateDeepseekConfig)();
        const apiKey = this.config.apiKey;
        const body = {
            model: request.model ?? 'deepseek-chat',
            messages: request.messages ??
                [
                    {
                        role: 'user',
                        content: request.prompt,
                    },
                ],
            temperature: request.temperature ?? 0.3,
            response_format: request.responseFormat === 'json'
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
            this.logger.error(`Deepseek API 调用失败：${response.status} - ${errorText}`);
            throw new Error(`Deepseek API 调用失败：${response.statusText}`);
        }
        const data = (await response.json());
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
};
exports.DeepseekProvider = DeepseekProvider;
exports.DeepseekProvider = DeepseekProvider = DeepseekProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DeepseekProvider);
//# sourceMappingURL=deepseek.provider.js.map
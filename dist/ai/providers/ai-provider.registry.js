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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProviderRegistry = void 0;
const common_1 = require("@nestjs/common");
const ai_provider_interface_1 = require("./ai-provider.interface");
const deepseek_provider_1 = require("./deepseek.provider");
let AiProviderRegistry = class AiProviderRegistry {
    providers = new Map();
    constructor(deepseekProvider) {
        this.register(deepseekProvider);
    }
    resolve(providerKey = ai_provider_interface_1.AiProviderKey.DEEPSEEK) {
        const provider = this.providers.get(providerKey);
        if (!provider) {
            throw new Error(`未找到 AI Provider：${providerKey}`);
        }
        return provider;
    }
    register(provider) {
        this.providers.set(provider.key, provider);
    }
};
exports.AiProviderRegistry = AiProviderRegistry;
exports.AiProviderRegistry = AiProviderRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [deepseek_provider_1.DeepseekProvider])
], AiProviderRegistry);
//# sourceMappingURL=ai-provider.registry.js.map
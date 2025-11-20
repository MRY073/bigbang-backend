"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const ai_prompts_1 = require("./ai.prompts");
let AiService = class AiService {
    getSystemPrompt() {
        return (0, ai_prompts_1.getSystemPrompt)();
    }
    buildPrompt(businessData, format = 'text') {
        let businessDataPrompt = '';
        if (typeof businessData === 'string') {
            businessDataPrompt = businessData;
        }
        else {
            businessDataPrompt = JSON.stringify(businessData, null, 2);
        }
        let formatNote = '';
        if (format === 'json') {
            formatNote = '\n\n【注意：以下数据为 JSON 格式，请仔细解析】';
        }
        else if (format === 'csv') {
            formatNote = '\n\n【注意：以下数据为 CSV 格式，请仔细解析】';
        }
        const fullBusinessPrompt = `${formatNote}\n${businessDataPrompt}`;
        return (0, ai_prompts_1.buildFullPrompt)(fullBusinessPrompt);
    }
    buildAnalysisPrompt(params) {
        const parts = [];
        if (params.question) {
            parts.push(`## 需要解决的问题\n\n${params.question}\n`);
        }
        if (params.adData) {
            const data = typeof params.adData === 'string'
                ? params.adData
                : JSON.stringify(params.adData, null, 2);
            parts.push(`## 广告数据\n\n${data}\n`);
        }
        if (params.shopeeData) {
            const data = typeof params.shopeeData === 'string'
                ? params.shopeeData
                : JSON.stringify(params.shopeeData, null, 2);
            parts.push(`## Shopee 导出数据\n\n${data}\n`);
        }
        if (params.productData) {
            const data = typeof params.productData === 'string'
                ? params.productData
                : JSON.stringify(params.productData, null, 2);
            parts.push(`## 产品数据\n\n${data}\n`);
        }
        if (params.context) {
            parts.push(`## 其他上下文信息\n\n${params.context}\n`);
        }
        const businessDataPrompt = parts.join('\n');
        return (0, ai_prompts_1.buildFullPrompt)(businessDataPrompt);
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map
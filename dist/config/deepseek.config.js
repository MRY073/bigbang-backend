"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeepseekConfig = getDeepseekConfig;
exports.validateDeepseekConfig = validateDeepseekConfig;
const DEEPSEEK_CONFIG = {
    apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here',
};
function getDeepseekConfig() {
    return DEEPSEEK_CONFIG;
}
function validateDeepseekConfig() {
    if (!DEEPSEEK_CONFIG.apiKey || DEEPSEEK_CONFIG.apiKey === 'your-deepseek-api-key-here') {
        throw new Error('DeepSeek API Key 未配置，请设置环境变量 DEEPSEEK_API_KEY 或在 src/config/deepseek.config.ts 中填写 API Key');
    }
}
//# sourceMappingURL=deepseek.config.js.map
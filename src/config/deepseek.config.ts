export interface DeepseekConfig {
  apiKey: string | null;
}

/**
 * DeepSeek 配置
 * 优先从环境变量 DEEPSEEK_API_KEY 读取，如果没有则从配置文件读取
 */
const DEEPSEEK_CONFIG: DeepseekConfig = {
  // 优先从环境变量读取，如果没有则使用配置文件中的值
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-deepseek-api-key-here',
};

/**
 * 提供 DeepSeek 相关的统一配置入口
 * 返回配置，但不强制要求 API Key 必须配置（允许应用启动，但在使用时再检查）
 */
export function getDeepseekConfig(): DeepseekConfig {
  return DEEPSEEK_CONFIG;
}

/**
 * 验证 DeepSeek API Key 是否已配置
 * 如果未配置，抛出错误
 */
export function validateDeepseekConfig(): void {
  if (!DEEPSEEK_CONFIG.apiKey || DEEPSEEK_CONFIG.apiKey === 'your-deepseek-api-key-here') {
    throw new Error(
      'DeepSeek API Key 未配置，请设置环境变量 DEEPSEEK_API_KEY 或在 src/config/deepseek.config.ts 中填写 API Key',
    );
  }
}


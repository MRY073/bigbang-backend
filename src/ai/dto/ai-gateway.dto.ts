import { AnalysisRequestDto } from './analysis-request.dto';
import { AiProviderKey, AiResponseFormat } from '../providers/ai-provider.interface';

export class AiGatewayRequestDto extends AnalysisRequestDto {
  /**
   * 链接唯一 ID（必填，用于日级缓存）
   */
  linkId!: string;

  /**
   * 链接跳转地址，便于排查
   */
  linkUrl?: string;

  /**
   * 店铺 ID（可选）
   */
  shopId?: string;

  /**
   * 使用的 AI Provider（默认 deepseek）
   */
  provider?: AiProviderKey;

  /**
   * 指定 Provider 内的模型 ID
   */
  modelId?: string;

  /**
   * 温度
   */
  temperature?: number;

  /**
   * 响应格式要求
   */
  responseFormat?: AiResponseFormat;

  /**
   * 补充提示词（第 2.5 层）
   */
  supplementaryPrompt?: string | string[] | Record<string, any>;

  /**
   * 指定日期（YYYY-MM-DD），默认当天
   */
  promptDate?: string | Date;

  /**
   * 是否强制刷新（忽略缓存）
   */
  forceRefresh?: boolean;

  /**
   * 额外元数据，写入数据库
   */
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




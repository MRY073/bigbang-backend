/**
 * AI 分析请求 DTO
 * 用于定义业务数据层的输入结构
 */

export class AnalysisRequestDto {
  /**
   * 需要解决的问题（可选）
   * 例如："帮我分析下这个广告最近为什么掉了"
   */
  question?: string;

  /**
   * 广告数据（可选）
   * 可以是 3~30 天的广告数据
   */
  adData?: object | string;

  /**
   * Shopee 导出数据（可选）
   * CSV 内容或解析后的对象
   */
  shopeeData?: object | string;

  /**
   * 产品数据（可选）
   * 链接特征：类目、客单价、上新时间、图片、卖点等
   */
  productData?: object | string;

  /**
   * 其他上下文信息（可选）
   */
  context?: string;

  /**
   * 数据格式（可选）
   * 'json' | 'text' | 'csv'
   */
  format?: 'json' | 'text' | 'csv';
}

/**
 * AI 分析响应 DTO
 * 用于定义 AI 分析的输出结构
 */
export class AnalysisResponseDto {
  /**
   * 分析结果
   */
  result: string;

  /**
   * 是否为 JSON 格式
   */
  isJson?: boolean;

  /**
   * 如果结果是 JSON，解析后的对象
   */
  parsedData?: any;
}


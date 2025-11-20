import { Injectable } from '@nestjs/common';
import { getSystemPrompt, buildFullPrompt } from './ai.prompts';

/**
 * AI 服务
 * 负责组合系统级提示词（第2层）和业务数据（第3层）
 * 
 * 注意：实际的 GPT-40 API 调用应该在第1层（接口层）完成
 * 本服务仅负责提示词的组合和格式化
 */
@Injectable()
export class AiService {
  /**
   * 获取系统级提示词（第2层）
   * @returns 系统提示词
   */
  getSystemPrompt(): string {
    return getSystemPrompt();
  }

  /**
   * 构建完整的提示词
   * 组合系统级提示词（第2层）和业务数据（第3层）
   * 
   * @param businessData 业务数据，可以是：
   *   - 3~30 天广告数据
   *   - Shopee 导出的 CSV 内容
   *   - 链接特征（类目、客单价、上新时间、图片、卖点等）
   *   - 需要解决的问题（如"帮我分析下这个广告最近为什么掉了"）
   * @param format 数据格式，'json' | 'text' | 'csv'
   * @returns 完整的提示词字符串
   */
  buildPrompt(
    businessData: string | object,
    format: 'json' | 'text' | 'csv' = 'text',
  ): string {
    let businessDataPrompt = '';

    if (typeof businessData === 'string') {
      businessDataPrompt = businessData;
    } else {
      // 如果是对象，格式化为 JSON
      businessDataPrompt = JSON.stringify(businessData, null, 2);
    }

    // 根据格式添加说明
    let formatNote = '';
    if (format === 'json') {
      formatNote = '\n\n【注意：以下数据为 JSON 格式，请仔细解析】';
    } else if (format === 'csv') {
      formatNote = '\n\n【注意：以下数据为 CSV 格式，请仔细解析】';
    }

    const fullBusinessPrompt = `${formatNote}\n${businessDataPrompt}`;

    return buildFullPrompt(fullBusinessPrompt);
  }

  /**
   * 构建分析请求提示词
   * 用于标准化的数据分析场景
   * 
   * @param params 分析参数
   * @returns 完整的提示词
   */
  buildAnalysisPrompt(params: {
    question?: string; // 需要解决的问题
    adData?: object | string; // 广告数据
    shopeeData?: object | string; // Shopee 数据
    productData?: object | string; // 产品数据
    context?: string; // 其他上下文信息
  }): string {
    const parts: string[] = [];

    // 问题描述
    if (params.question) {
      parts.push(`## 需要解决的问题\n\n${params.question}\n`);
    }

    // 广告数据
    if (params.adData) {
      const data =
        typeof params.adData === 'string'
          ? params.adData
          : JSON.stringify(params.adData, null, 2);
      parts.push(`## 广告数据\n\n${data}\n`);
    }

    // Shopee 数据
    if (params.shopeeData) {
      const data =
        typeof params.shopeeData === 'string'
          ? params.shopeeData
          : JSON.stringify(params.shopeeData, null, 2);
      parts.push(`## Shopee 导出数据\n\n${data}\n`);
    }

    // 产品数据
    if (params.productData) {
      const data =
        typeof params.productData === 'string'
          ? params.productData
          : JSON.stringify(params.productData, null, 2);
      parts.push(`## 产品数据\n\n${data}\n`);
    }

    // 其他上下文
    if (params.context) {
      parts.push(`## 其他上下文信息\n\n${params.context}\n`);
    }

    const businessDataPrompt = parts.join('\n');

    return buildFullPrompt(businessDataPrompt);
  }
}


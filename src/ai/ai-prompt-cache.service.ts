import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';

export interface LinkAiPromptRecord {
  id: number;
  link_id: string;
  link_url: string | null;
  shop_id: string | null;
  prompt_date: string;
  model_key: string;
  model_name: string;
  prompt_text: string;
  prompt_hash: string;
  business_payload: string;
  supplementary_prompt: string | null;
  ai_response: string | null;
  raw_response: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  status: 'pending' | 'success' | 'failed';
  error_message: string | null;
  metadata: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLinkAiPromptRecord {
  link_id: string;
  prompt_date: string;
  model_key: string;
  model_name: string;
  prompt_text: string;
  prompt_hash: string;
  business_payload: string;
  supplementary_prompt?: string | null;
  ai_response?: string | null;
  raw_response?: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  link_url?: string | null;
  shop_id?: string | null;
  status?: 'pending' | 'success' | 'failed';
  error_message?: string | null;
  metadata?: Record<string, any> | null;
}

@Injectable()
export class AiPromptCacheService {
  private readonly tableName = 'link_ai_prompt_logs';

  constructor(private readonly mysqlService: MysqlService) {}

  /**
   * 查询当日缓存
   */
  async getByLinkAndDate(
    linkId: string,
    promptDate: string,
  ): Promise<LinkAiPromptRecord | null> {
    const sql = `SELECT * FROM ${this.tableName} WHERE link_id = ? AND prompt_date = ? LIMIT 1`;
    return this.mysqlService.queryOne<LinkAiPromptRecord>(sql, [
      linkId,
      promptDate,
    ]);
  }

  /**
   * 新增记录
   */
  async create(record: CreateLinkAiPromptRecord): Promise<number> {
    const payload = this.prepareInsertPayload(record);
    return this.mysqlService.insert(this.tableName, payload);
  }

  /**
   * 更新记录
   */
  async update(
    id: number,
    updates: Partial<CreateLinkAiPromptRecord>,
  ): Promise<number> {
    const payload = this.prepareUpdatePayload(updates);
    if (Object.keys(payload).length === 0) {
      return 0;
    }
    return this.mysqlService.update(
      this.tableName,
      payload,
      { id },
    );
  }

  private prepareInsertPayload(record: CreateLinkAiPromptRecord) {
    const payload: Record<string, any> = {};
    Object.entries(record).forEach(([key, value]) => {
      if (key === 'metadata') {
        payload[key] = this.serializeMetadata(value);
        return;
      }
      payload[key] = value === undefined ? null : value;
    });

    payload.status = payload.status ?? 'pending';
    payload.supplementary_prompt = payload.supplementary_prompt ?? null;
    payload.ai_response = payload.ai_response ?? null;
    payload.raw_response = payload.raw_response ?? null;
    payload.prompt_tokens = payload.prompt_tokens ?? null;
    payload.completion_tokens = payload.completion_tokens ?? null;
    payload.total_tokens = payload.total_tokens ?? null;
    payload.link_url = payload.link_url ?? null;
    payload.shop_id = payload.shop_id ?? null;
    payload.error_message = payload.error_message ?? null;

    return payload;
  }

  private prepareUpdatePayload(
    updates: Partial<CreateLinkAiPromptRecord>,
  ): Record<string, any> {
    const payload: Record<string, any> = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }
      if (key === 'metadata') {
        payload[key] = this.serializeMetadata(value as Record<string, any> | null | undefined);
        return;
      }
      payload[key] = value;
    });
    return payload;
  }

  private serializeMetadata(
    metadata: Record<string, any> | null | undefined,
  ): string | null | undefined {
    if (metadata === undefined) {
      return undefined;
    }
    if (metadata === null) {
      return null;
    }
    return JSON.stringify(metadata);
  }
}



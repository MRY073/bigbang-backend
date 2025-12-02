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
export declare class AiPromptCacheService {
    private readonly mysqlService;
    private readonly tableName;
    constructor(mysqlService: MysqlService);
    getByLinkAndDate(linkId: string, promptDate: string): Promise<LinkAiPromptRecord | null>;
    create(record: CreateLinkAiPromptRecord): Promise<number>;
    update(id: number, updates: Partial<CreateLinkAiPromptRecord>): Promise<number>;
    private prepareInsertPayload;
    private prepareUpdatePayload;
    private serializeMetadata;
}

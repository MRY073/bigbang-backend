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
exports.AiPromptCacheService = void 0;
const common_1 = require("@nestjs/common");
const mysql_service_1 = require("../database/mysql.service");
let AiPromptCacheService = class AiPromptCacheService {
    mysqlService;
    tableName = 'link_ai_prompt_logs';
    constructor(mysqlService) {
        this.mysqlService = mysqlService;
    }
    async getByLinkAndDate(linkId, promptDate) {
        const sql = `SELECT * FROM ${this.tableName} WHERE link_id = ? AND prompt_date = ? LIMIT 1`;
        return this.mysqlService.queryOne(sql, [
            linkId,
            promptDate,
        ]);
    }
    async create(record) {
        const payload = this.prepareInsertPayload(record);
        return this.mysqlService.insert(this.tableName, payload);
    }
    async update(id, updates) {
        const payload = this.prepareUpdatePayload(updates);
        if (Object.keys(payload).length === 0) {
            return 0;
        }
        return this.mysqlService.update(this.tableName, payload, { id });
    }
    prepareInsertPayload(record) {
        const payload = {};
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
    prepareUpdatePayload(updates) {
        const payload = {};
        Object.entries(updates).forEach(([key, value]) => {
            if (value === undefined) {
                return;
            }
            if (key === 'metadata') {
                payload[key] = this.serializeMetadata(value);
                return;
            }
            payload[key] = value;
        });
        return payload;
    }
    serializeMetadata(metadata) {
        if (metadata === undefined) {
            return undefined;
        }
        if (metadata === null) {
            return null;
        }
        return JSON.stringify(metadata);
    }
};
exports.AiPromptCacheService = AiPromptCacheService;
exports.AiPromptCacheService = AiPromptCacheService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], AiPromptCacheService);
//# sourceMappingURL=ai-prompt-cache.service.js.map
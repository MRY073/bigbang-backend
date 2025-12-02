# AI 模块

本模块实现了电商数据分析系统的 AI 支持架构（提示词 → 模型调用 → 数据缓存）。

## 架构说明

### 第 1 层：接口层（`AiGatewayService`）
- 统一封装 AI 调用（当前接入 DeepSeek，未来可扩展更多 Provider）
- 负责模型路由、错误治理、数据落库与缓存
- 默认以「链接 + 日期」为粒度缓存，重复调用直接命中数据库

### 第 2 层：系统级提示词
- **位置**：`ai.prompts.ts` 的 `SYSTEM_PROMPT`
- 每次调用自动附加角色设定、输出规范、分析流程

### 第 2.5 层：补充提示词
- **入口**：`AiService.buildPrompt/buildAnalysisPrompt` 的 `supplementaryPrompt`
- 支持 `string | string[] | object`
- 用于在系统提示词与业务数据之间注入一次性说明、检查项等

### 第 3 层：业务数据层
- 调用方动态传入（广告数据、Shopee 导出、产品特征、问题描述等）

## 快速开始

### 1. 借助 `AiGatewayService` 完成调用 + 缓存

```typescript
import { AiGatewayService } from './ai/ai-gateway.service';
import { AiProviderKey } from './ai/providers/ai-provider.interface';

constructor(private readonly aiGateway: AiGatewayService) {}

async analyzeLink() {
  const response = await this.aiGateway.requestAnalysis({
    linkId: '123456',
    shopId: 'shop-001',
    question: '最近 7 天广告成本为什么飙升？',
    adData: recentAdStats,
    supplementaryPrompt: {
      reviewer: '运营-小张',
      note: '重点关注访客来源波动',
    },
    provider: AiProviderKey.DEEPSEEK,
  });

  return response.result; // 如果同一天已计算过，会直接返回缓存
}
```

> `forceRefresh: true` 可跳过缓存并重算。

### 2. 仍可单独使用提示词组合服务

```typescript
const systemPrompt = this.aiService.getSystemPrompt();

const promptA = this.aiService.buildPrompt('数据...', {
  format: 'text',
  supplementaryPrompt: '额外上下文',
});

const promptB = this.aiService.buildAnalysisPrompt({
  question: '帮我分析...',
  adData: { ... },
  productData: { ... },
  context: '其他信息',
  supplementaryPrompt: ['使用 JSON 输出', '附带关键结论 TL;DR'],
});
```

## 数据落库存储

- 新增表：`link_ai_prompt_logs`（见 `migrations/create_link_ai_prompt_logs.sql`）
- 关键字段：链接 ID、日期、模型、提示词哈希、补充信息、业务载荷、AI 响应、token 统计、错误信息等
- 每条链接每天仅存一条记录，方便追溯和手工复盘

## 文件导航

- `ai-gateway.service.ts`：统一调用、缓存、落库
- `ai-prompt-cache.service.ts`：数据读写
- `providers/*`：AI Provider 接口与 DeepSeek 实现
- `ai.service.ts`：提示词组合（系统层 + 补充层 + 业务层）
- `ai.prompts.ts`：系统提示词
- `dto/*`：请求/响应 DTO

## 模块导入

```typescript
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AiModule],
})
export class XxxModule {}
```

## 扩展能力

- 接入新模型：实现 `AiProvider`，在 `AiProviderRegistry` 注册即可
- 缓存策略：基于 `AiPromptCacheService` 可做后台审计、手动重刷等
- 输出格式：通过 `responseFormat` 指定 `json`/`text`
- 补充信息：`supplementaryPrompt` 支持字符串、数组、对象自动格式化



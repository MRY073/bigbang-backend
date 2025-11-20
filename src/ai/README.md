# AI 模块

本模块实现了电商数据分析系统的 AI 支持架构。

## 架构说明

系统采用三层架构：

### 第 1 层：接口层（不在本模块）
- 功能：通过 MCP 从不同数据源获取数据 → 将数据传入第 3 层 → 调用 GPT-40 → 返回结果给前端
- 不包含提示词逻辑

### 第 2 层：系统级提示词（本模块的核心）
- **位置**：`ai.prompts.ts` 中的 `SYSTEM_PROMPT`
- **特点**：写死在后台，每次调用都自动加入
- **内容**：定义 AI 的角色、风格、分析要求、输出规范等

### 第 3 层：业务数据层（动态输入）
- 由调用方传入，包括：
  - 3~30 天广告数据
  - Shopee 导出的 CSV 内容
  - 链接特征（类目、客单价、上新时间、图片、卖点等）
  - 需要解决的问题（如"帮我分析下这个广告最近为什么掉了"）

## 使用方法

### 1. 获取系统提示词

```typescript
import { AiService } from './ai/ai.service';

// 在服务中注入
constructor(private readonly aiService: AiService) {}

// 获取系统提示词
const systemPrompt = this.aiService.getSystemPrompt();
```

### 2. 构建完整提示词

```typescript
// 方式1：直接传入业务数据字符串
const fullPrompt = this.aiService.buildPrompt(
  '这里是广告数据...',
  'text'
);

// 方式2：传入对象（会自动转换为 JSON）
const fullPrompt = this.aiService.buildPrompt(
  { adData: [...], productData: {...} },
  'json'
);

// 方式3：使用结构化方法
const fullPrompt = this.aiService.buildAnalysisPrompt({
  question: '帮我分析下这个广告最近为什么掉了',
  adData: { /* 广告数据 */ },
  productData: { /* 产品数据 */ },
  context: '其他上下文信息'
});
```

### 3. 在第 1 层调用 GPT-40

```typescript
// 示例：在第1层（接口层）调用
async callGPT40(businessData: any) {
  // 1. 使用 AI 服务构建完整提示词
  const fullPrompt = this.aiService.buildAnalysisPrompt({
    question: '分析广告数据',
    adData: businessData,
  });

  // 2. 调用 GPT-40 API（这里需要实际的 API 调用代码）
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // 或其他 GPT-40 模型
    messages: [
      {
        role: 'system',
        content: this.aiService.getSystemPrompt(), // 系统提示词
      },
      {
        role: 'user',
        content: businessData, // 业务数据
      },
    ],
  });

  return response.choices[0].message.content;
}
```

## 文件说明

- `ai.prompts.ts`: 系统级提示词定义
- `ai.service.ts`: AI 服务，提供提示词组合方法
- `ai.module.ts`: NestJS 模块配置
- `dto/analysis-request.dto.ts`: 请求和响应 DTO 定义

## 注意事项

1. **系统提示词修改**：如需修改系统提示词，请编辑 `ai.prompts.ts` 中的 `SYSTEM_PROMPT` 常量

2. **数据格式**：支持 JSON、文本、CSV 三种格式，使用 `buildPrompt` 方法时指定 `format` 参数

3. **模块导入**：在需要使用 AI 服务的模块中，导入 `AiModule`：

```typescript
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AiModule],
  // ...
})
```

## 扩展

如果需要在第 1 层实现实际的 GPT API 调用，可以：

1. 安装 OpenAI SDK：
```bash
npm install openai
```

2. 在 `ai.service.ts` 中添加实际的 API 调用方法
3. 配置环境变量存储 API Key
4. 添加错误处理和重试逻辑


# AI 模块使用示例

本文档展示如何在实际场景中使用 AI 模块的系统提示词功能。

## 场景1：在服务中使用 AI 服务构建提示词

### 示例：在现有的 ProductsService 中集成 AI 分析

```typescript
import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { MysqlService } from '../database/mysql.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly mysqlService: MysqlService,
    private readonly aiService: AiService, // 注入 AI 服务
  ) {}

  /**
   * 获取潜力产品的AI建议（使用系统提示词）
   */
  async getPotentialLinkAISuggestionWithAI(
    shopID: string,
    shopName: string,
    date: string,
    productID: string,
    productName: string,
  ): Promise<{ suggestion: string }> {
    // 1. 获取该产品的监控数据
    const monitorData = await this.getPotentialLinkMonitorData(
      shopID,
      shopName,
      date,
    );

    const productData = monitorData.find((p) => p.id === productID);

    if (!productData) {
      return {
        suggestion: '未找到该产品的监控数据，无法生成建议。',
      };
    }

    // 2. 使用 AI 服务构建完整提示词
    const fullPrompt = this.aiService.buildAnalysisPrompt({
      question: `分析产品 ${productName} (ID: ${productID}) 的广告表现，给出优化建议`,
      adData: {
        visitorsAvg: productData.visitorsAvg,
        visitorsStd: productData.visitorsStd,
        adCostAvg: productData.adCostAvg,
        adCostStd: productData.adCostStd,
        salesAvg: productData.salesAvg,
        salesStd: productData.salesStd,
        warningLevel: productData.warningLevel,
      },
      productData: {
        productID,
        productName,
        shopID,
        shopName,
        date,
      },
      context: '这是潜力链接监控数据，需要分析广告表现并给出优化建议',
    });

    // 3. 这里应该调用 GPT-40 API（第1层接口层）
    // const aiResponse = await this.callGPT40(fullPrompt);
    
    // 4. 返回结果
    return {
      suggestion: fullPrompt, // 实际使用时应该是 aiResponse
    };
  }
}
```

## 场景2：在控制器中使用（如果需要）

### 示例：创建 AI 分析控制器

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalysisRequestDto } from './dto/analysis-request.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ai-analysis')
@UseGuards(AuthGuard)
export class AiAnalysisController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 构建完整提示词（供第1层接口层调用）
   * POST /ai-analysis/build-prompt
   */
  @Post('build-prompt')
  async buildPrompt(@Body() dto: AnalysisRequestDto) {
    // 构建完整提示词（包含系统提示词和业务数据）
    const fullPrompt = this.aiService.buildAnalysisPrompt({
      question: dto.question,
      adData: dto.adData,
      shopeeData: dto.shopeeData,
      productData: dto.productData,
      context: dto.context,
    });

    return {
      code: 200,
      message: 'success',
      data: {
        systemPrompt: this.aiService.getSystemPrompt(), // 系统提示词（第2层）
        fullPrompt, // 完整提示词（系统提示词 + 业务数据）
      },
    };
  }

  /**
   * 仅获取系统提示词
   * GET /ai-analysis/system-prompt
   */
  @Get('system-prompt')
  async getSystemPrompt() {
    return {
      code: 200,
      message: 'success',
      data: {
        systemPrompt: this.aiService.getSystemPrompt(),
      },
    };
  }
}
```

## 场景3：在第1层接口层调用 GPT-40

### 示例：如何在实际的 GPT API 调用中使用

```typescript
import { AiService } from './ai/ai.service';
import OpenAI from 'openai'; // 需要安装: npm install openai

export class GPT40Service {
  private openai: OpenAI;

  constructor(private readonly aiService: AiService) {
    // 初始化 OpenAI 客户端
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // 从环境变量读取
    });
  }

  /**
   * 调用 GPT-40 进行分析
   * @param businessData 业务数据（第3层）
   * @returns AI 分析结果
   */
  async analyzeWithGPT40(businessData: {
    question?: string;
    adData?: any;
    shopeeData?: any;
    productData?: any;
    context?: string;
  }): Promise<string> {
    // 1. 使用 AI 服务获取系统提示词（第2层）
    const systemPrompt = this.aiService.getSystemPrompt();

    // 2. 构建用户消息（业务数据，第3层）
    const userMessage = this.aiService.buildAnalysisPrompt(businessData);

    // 3. 调用 GPT-40 API
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // 或 'gpt-4o-mini' 等
        messages: [
          {
            role: 'system',
            content: systemPrompt, // 系统级提示词（第2层）
          },
          {
            role: 'user',
            content: userMessage, // 业务数据（第3层）
          },
        ],
        temperature: 0.7, // 可根据需要调整
        max_tokens: 2000, // 可根据需要调整
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('GPT-40 API 调用失败:', error);
      throw error;
    }
  }
}
```

## 场景4：直接使用系统提示词

### 示例：在需要系统提示词的任何地方使用

```typescript
import { AiService } from './ai/ai.service';

export class SomeService {
  constructor(private readonly aiService: AiService) {}

  async doSomething() {
    // 获取系统提示词
    const systemPrompt = this.aiService.getSystemPrompt();
    
    // 构建包含业务数据的提示词
    const fullPrompt = this.aiService.buildPrompt(
      { /* 业务数据 */ },
      'json'
    );

    // 使用提示词...
  }
}
```

## 场景5：处理不同格式的业务数据

```typescript
// JSON 格式的业务数据
const jsonData = {
  adData: { /* ... */ },
  productData: { /* ... */ },
};
const prompt1 = this.aiService.buildPrompt(jsonData, 'json');

// 文本格式的业务数据
const textData = '广告数据：...';
const prompt2 = this.aiService.buildPrompt(textData, 'text');

// CSV 格式的业务数据
const csvData = 'date,spend,sales\n2024-01-01,100,200';
const prompt3 = this.aiService.buildPrompt(csvData, 'csv');
```

## 注意事项

1. **模块导入**：确保在使用 AI 服务的模块中导入 `AiModule`：
   ```typescript
   @Module({
     imports: [AiModule], // 导入 AI 模块
     // ...
   })
   ```

2. **系统提示词修改**：如需修改系统提示词，请编辑 `src/ai/ai.prompts.ts` 中的 `SYSTEM_PROMPT` 常量。

3. **API 调用**：实际的 GPT-40 API 调用应该在第1层（接口层）完成，本模块仅负责提示词的组合。

4. **环境变量**：如果需要调用 GPT API，需要在 `.env` 文件中配置：
   ```
   OPENAI_API_KEY=your-api-key-here
   ```


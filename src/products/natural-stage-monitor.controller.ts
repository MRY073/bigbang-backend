import { Controller, Get, Post, Query, Body, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import {
  NaturalStageMonitorDto,
  NaturalStageAISuggestionDto,
  BatchNaturalStageAISuggestionDto,
} from './dto/natural-stage-monitor.dto';
import { NaturalStageMonitorChartDto } from './dto/monitor-chart.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('natural')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class NaturalStageMonitorController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 自然流商品监控
   * GET /api/natural/stage/monitor/list?shopID=店铺ID&shopName=店铺名称&date=2024-01-15&customCategory=分类名称
   */
  @Get('stage/monitor/list')
  async getNaturalStageMonitor(
    @Query() query: NaturalStageMonitorDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, customCategory } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const data = await this.productsService.getNaturalStageMonitorData(
        shopID,
        shopName,
        customCategory,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '查询成功',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 自然流商品监控AI建议
   * GET /api/natural/stage/monitor/ai-suggestion?shopID=店铺ID&shopName=店铺名称&date=2024-01-15&productID=产品ID&productName=产品名称
   */
  @Get('stage/monitor/ai-suggestion')
  async getNaturalStageAISuggestion(
    @Query() query: NaturalStageAISuggestionDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, date, productID, productName } = query;

    if (!shopID || !shopName || !date || !productID || !productName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID、shopName、date、productID 和 productName 参数不能为空',
      });
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2024-01-15）',
      });
    }

    // 验证日期是否有效
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'date 参数不是有效的日期',
      });
    }

    try {
      const data = await this.productsService.getNaturalStageAISuggestion(
        shopID,
        shopName,
        date,
        productID,
        productName,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '查询成功',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 批量获取自然流商品监控的AI建议
   * POST /api/natural/stage/monitor/batch-ai-suggestion
   */
  @Post('stage/monitor/batch-ai-suggestion')
  async batchNaturalStageAISuggestion(
    @Body() body: BatchNaturalStageAISuggestionDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, date } = body;

    if (!shopID || !shopName || !date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID、shopName 和 date 参数不能为空',
      });
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2024-01-15）',
      });
    }

    // 验证日期是否有效
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'date 参数不是有效的日期',
      });
    }

    try {
      const data = await this.productsService.batchNaturalStageAISuggestion(
        shopID,
        shopName,
        date,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '任务创建成功',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '任务创建失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 自然流商品监控折线图数据
   * GET /api/natural/stage/monitor/chart?shopID=店铺ID&shopName=店铺名称&productID=商品ID&startDate=2024-01-01&endDate=2024-01-31
   */
  @Get('stage/monitor/chart')
  async getNaturalStageMonitorChart(
    @Query() query: NaturalStageMonitorChartDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, productID, startDate, endDate } = query;

    if (!shopID || !shopName || !productID || !startDate || !endDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID、shopName、productID、startDate 和 endDate 参数不能为空',
      });
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'startDate 和 endDate 参数格式错误，应为 YYYY-MM-DD 格式',
      });
    }

    try {
      const data = await this.productsService.getNaturalStageMonitorChartData(
        shopID,
        shopName,
        productID,
        startDate,
        endDate,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '查询成功',
        data,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      if (errorMessage.includes('不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '查询失败',
          error: errorMessage,
        });
      }
      
      if (errorMessage.includes('格式') || errorMessage.includes('范围') || errorMessage.includes('不能')) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '查询失败',
          error: errorMessage,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '查询失败',
        error: errorMessage,
      });
    }
  }

  /**
   * 保存自然流商品监控分析
   * POST /api/natural/stage/monitor/save-analysis
   */
  @Post('stage/monitor/save-analysis')
  async saveNaturalStageMonitorAnalysis(
    @Body() body: SaveAnalysisDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, productID, analysis, improvementPlan } = body;

    if (!shopID || !shopName || !productID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID、shopName 和 productID 参数不能为空',
      });
    }

    // 验证字数限制
    if (analysis && analysis.length > 10000) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'analysis 长度不能超过10000字符',
      });
    }
    if (improvementPlan && improvementPlan.length > 10000) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'improvementPlan 长度不能超过10000字符',
      });
    }

    try {
      await this.productsService.saveNaturalStageMonitorAnalysis(
        shopID,
        shopName,
        productID,
        analysis,
        improvementPlan,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '保存成功',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      if (errorMessage.includes('不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: '保存失败',
          error: errorMessage,
        });
      }

      if (errorMessage.includes('必填') || errorMessage.includes('长度')) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: '保存失败',
          error: errorMessage,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '保存失败',
        error: errorMessage,
      });
    }
  }
}


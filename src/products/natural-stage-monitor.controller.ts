import { Controller, Get, Post, Query, Body, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import {
  NaturalStageMonitorDto,
  NaturalStageAISuggestionDto,
  BatchNaturalStageAISuggestionDto,
} from './dto/natural-stage-monitor.dto';
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
    const { shopID, shopName, date, customCategory } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    // 验证日期格式（date 现在是必填参数）
    if (!date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'date 参数不能为空',
      });
    }

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
      const data = await this.productsService.getNaturalStageMonitorData(
        shopID,
        shopName,
        date,
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
}


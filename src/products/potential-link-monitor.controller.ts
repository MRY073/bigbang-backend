import { Controller, Get, Post, Query, Body, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { PotentialLinkMonitorDto, PotentialLinkAISuggestionDto } from './dto/potential-link-monitor.dto';
import { PotentialLinkMonitorChartDto } from './dto/monitor-chart.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('potential')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class PotentialLinkMonitorController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 潜力链接监控
   * GET /api/potential/link/monitor/list?shopID=店铺ID&shopName=店铺名称&date=2025-11-08
   */
  @Get('link/monitor/list')
  async getPotentialLinkMonitor(
    @Query() query: PotentialLinkMonitorDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const data = await this.productsService.getPotentialLinkMonitorData(
        shopID,
        shopName,
      );

      return res.status(HttpStatus.OK).json({
        code: 200,
        message: 'success',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: 500,
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 潜力链接监控AI建议
   * GET /api/potential/link/monitor/ai-suggestion?shopID=店铺ID&shopName=店铺名称&date=2025-11-08&productID=产品ID&productName=产品名称
   */
  @Get('link/monitor/ai-suggestion')
  async getPotentialLinkAISuggestion(
    @Query() query: PotentialLinkAISuggestionDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, date, productID, productName } = query;

    if (!shopID || !shopName || !date || !productID || !productName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: 'shopID、shopName、date、productID 和 productName 参数不能为空',
      });
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2025-11-08）',
      });
    }

    // 验证日期是否有效
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: 'date 参数不是有效的日期',
      });
    }

    try {
      const data = await this.productsService.getPotentialLinkAISuggestion(
        shopID,
        shopName,
        date,
        productID,
        productName,
      );

      return res.status(HttpStatus.OK).json({
        code: 200,
        message: 'success',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: 500,
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 潜力链接监控折线图数据
   * GET /api/potential/link/monitor/chart?shopID=店铺ID&shopName=店铺名称&productID=商品ID&startDate=2024-01-01&endDate=2024-01-31
   */
  @Get('link/monitor/chart')
  async getPotentialLinkMonitorChart(
    @Query() query: PotentialLinkMonitorChartDto,
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
      const data = await this.productsService.getPotentialLinkMonitorChartData(
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
   * 保存潜力链接监控分析
   * POST /api/potential/link/monitor/save-analysis
   */
  @Post('link/monitor/save-analysis')
  async savePotentialLinkMonitorAnalysis(
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
      await this.productsService.savePotentialLinkMonitorAnalysis(
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


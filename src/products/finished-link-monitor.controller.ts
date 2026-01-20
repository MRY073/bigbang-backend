import { Controller, Get, Post, Query, Body, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorDto } from './dto/finished-link-monitor.dto';
import { FinishedLinkMonitorChartDto } from './dto/monitor-chart.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('finished')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class FinishedLinkMonitorController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 成品链接监控
   * GET /api/finished/link/monitor/list?shopID=店铺ID&shopName=店铺名称&date=2024-01-15&customCategory=分类名称
   */
  @Get('link/monitor/list')
  async getFinishedLinkMonitor(
    @Query() query: FinishedLinkMonitorDto,
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
      const data = await this.productsService.getFinishedLinkMonitorData(
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
   * 成品链接监控折线图数据
   * GET /api/finished/link/monitor/chart?shopID=店铺ID&shopName=店铺名称&productID=商品ID&startDate=2024-01-01&endDate=2024-01-31
   */
  @Get('link/monitor/chart')
  async getFinishedLinkMonitorChart(
    @Query() query: FinishedLinkMonitorChartDto,
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
      const data = await this.productsService.getFinishedLinkMonitorChartData(
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
   * 保存成品链接监控分析
   * POST /api/finished/link/monitor/save-analysis
   */
  @Post('link/monitor/save-analysis')
  async saveFinishedLinkMonitorAnalysis(
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
      await this.productsService.saveFinishedLinkMonitorAnalysis(
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

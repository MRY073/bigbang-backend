import { Controller, Get, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdAnalysisService } from './ad-analysis.service';
import { AdTrendDto } from './dto/ad-trend.dto';
import { AdRatioDto } from './dto/ad-ratio.dto';
import { StageProductsDto } from './dto/stage-products.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('ad-analysis')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class AdAnalysisController {
  constructor(private readonly adAnalysisService: AdAnalysisService) {}

  /**
   * 30天广告占比趋势
   * GET /ad-analysis/ad-trend?shopID=店铺ID&shopName=店铺名称&customCategory=自定义分类（可选）
   */
  @Get('ad-trend')
  async getAdTrend(@Query() query: AdTrendDto, @Res() res: Response) {
    const { shopID, shopName, customCategory } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopID 参数不能为空',
        error: 'shopID 参数不能为空',
      });
    }

    if (!shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopName 参数不能为空',
        error: 'shopName 参数不能为空',
      });
    }

    // 验证自定义分类参数（如果提供，不能为空字符串）
    if (customCategory !== undefined && customCategory !== null && customCategory.trim() === '') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'customCategory 参数不能为空字符串',
        error: 'customCategory 参数不能为空字符串',
      });
    }

    try {
      const data = await this.adAnalysisService.getAdTrend30Days(
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
   * 指定日期广告占比
   * GET /ad-analysis/ad-ratio?shopID=店铺ID&date=日期&shopName=店铺名称&customCategory=自定义分类（可选）
   */
  @Get('ad-ratio')
  async getAdRatio(@Query() query: AdRatioDto, @Res() res: Response) {
    const { shopID, date, shopName, customCategory } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopID 参数不能为空',
        message: 'shopID 参数不能为空',
      });
    }

    if (!date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'date 参数不能为空',
        message: 'date 参数不能为空',
      });
    }

    if (!shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopName 参数不能为空',
        message: 'shopName 参数不能为空',
      });
    }

    // 验证日期格式：YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '日期格式错误',
        message: '日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期是否有效
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '日期格式错误',
        message: '日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证自定义分类参数（如果提供，不能为空字符串）
    if (customCategory !== undefined && customCategory !== null && customCategory.trim() === '') {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'customCategory 参数不能为空字符串',
        message: 'customCategory 参数不能为空字符串',
      });
    }

    try {
      const data = await this.adAnalysisService.getAdRatioByDate(
        shopID,
        date,
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
        error: error instanceof Error ? error.message : '未知错误',
        message: '查询失败',
      });
    }
  }

  /**
   * 阶段商品列表
   * GET /ad-analysis/stage-products?shopID=店铺ID&date=日期&stage=阶段&shopName=店铺名称
   */
  @Get('stage-products')
  async getStageProducts(
    @Query() query: StageProductsDto,
    @Res() res: Response,
  ) {
    const { shopID, date, stage, shopName } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopID 参数不能为空',
        message: 'shopID 参数不能为空',
      });
    }

    if (!date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'date 参数不能为空',
        message: 'date 参数不能为空',
      });
    }

    if (!stage) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'stage 参数不能为空',
        message: 'stage 参数不能为空',
      });
    }

    // 验证日期格式：YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '日期格式错误',
        message: '日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期是否有效
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '日期格式错误',
        message: '日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证阶段参数
    const validStages = [
      'product_stage',
      'testing_stage',
      'potential_stage',
      'abandoned_stage',
      'no_stage',
    ];
    if (!validStages.includes(stage)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '阶段参数无效',
        message:
          '阶段参数应为 product_stage, testing_stage, potential_stage, abandoned_stage, no_stage 之一',
      });
    }

    try {
      const data = await this.adAnalysisService.getStageProducts(
        shopID,
        date,
        stage,
        shopName,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '查询成功',
        data,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        message: '查询失败',
      });
    }
  }
}

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
   * 时间段广告占比
   * GET /ad-analysis/ad-ratio?shopID=店铺ID&startDate=开始日期&endDate=结束日期&shopName=店铺名称&customCategory=自定义分类（可选）
   * 向后兼容：如果提供了 date 参数，则同时作为 startDate 和 endDate
   */
  @Get('ad-ratio')
  async getAdRatio(@Query() query: AdRatioDto, @Res() res: Response) {
    const { shopID, startDate, endDate, date, shopName, customCategory } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopID 参数不能为空',
        message: 'shopID 参数不能为空',
      });
    }

    if (!shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopName 参数不能为空',
        message: 'shopName 参数不能为空',
      });
    }

    // 向后兼容：如果提供了 date 参数，则同时作为 startDate 和 endDate
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (date) {
      // 向后兼容模式
      finalStartDate = date;
      finalEndDate = date;
    }

    if (!finalStartDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'startDate 参数不能为空',
        message: 'startDate 参数不能为空（或使用 date 参数进行向后兼容）',
      });
    }

    if (!finalEndDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'endDate 参数不能为空',
        message: 'endDate 参数不能为空（或使用 date 参数进行向后兼容）',
      });
    }

    // 验证日期格式：YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(finalStartDate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '开始日期格式错误',
        message: '开始日期格式应为 YYYY-MM-DD',
      });
    }

    if (!dateRegex.test(finalEndDate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期格式错误',
        message: '结束日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期是否有效
    const startDateObj = new Date(finalStartDate);
    const endDateObj = new Date(finalEndDate);
    if (isNaN(startDateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '开始日期格式错误',
        message: '开始日期格式应为 YYYY-MM-DD',
      });
    }

    if (isNaN(endDateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期格式错误',
        message: '结束日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期范围
    if (endDateObj < startDateObj) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期不能早于开始日期',
        message: '结束日期不能早于开始日期',
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
        finalStartDate,
        finalEndDate,
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
   * 阶段商品列表（时间段版本）
   * GET /ad-analysis/stage-products?shopID=店铺ID&startDate=开始日期&endDate=结束日期&stage=阶段&shopName=店铺名称&customCategory=自定义分类&page=页码&pageSize=每页数量&sortBy=排序字段&sortOrder=排序顺序
   * 向后兼容：如果提供了 date 参数，则同时作为 startDate 和 endDate
   */
  @Get('stage-products')
  async getStageProducts(
    @Query() query: StageProductsDto,
    @Res() res: Response,
  ) {
    const {
      shopID,
      startDate,
      endDate,
      date,
      stage,
      shopName,
      customCategory,
      page,
      pageSize,
      sortBy,
      sortOrder,
    } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'shopID 参数不能为空',
        message: 'shopID 参数不能为空',
      });
    }

    if (!stage) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'stage 参数不能为空',
        message: 'stage 参数不能为空',
      });
    }

    // 向后兼容：如果提供了 date 参数，则同时作为 startDate 和 endDate
    let finalStartDate = startDate;
    let finalEndDate = endDate;

    if (date) {
      // 向后兼容模式
      finalStartDate = date;
      finalEndDate = date;
    }

    if (!finalStartDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'startDate 参数不能为空',
        message: 'startDate 参数不能为空（或使用 date 参数进行向后兼容）',
      });
    }

    if (!finalEndDate) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: 'endDate 参数不能为空',
        message: 'endDate 参数不能为空（或使用 date 参数进行向后兼容）',
      });
    }

    // 验证日期格式：YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(finalStartDate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '开始日期格式错误',
        message: '开始日期格式应为 YYYY-MM-DD',
      });
    }

    if (!dateRegex.test(finalEndDate)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期格式错误',
        message: '结束日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期是否有效
    const startDateObj = new Date(finalStartDate);
    const endDateObj = new Date(finalEndDate);
    if (isNaN(startDateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '开始日期格式错误',
        message: '开始日期格式应为 YYYY-MM-DD',
      });
    }

    if (isNaN(endDateObj.getTime())) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期格式错误',
        message: '结束日期格式应为 YYYY-MM-DD',
      });
    }

    // 验证日期范围
    if (endDateObj < startDateObj) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '结束日期不能早于开始日期',
        message: '结束日期不能早于开始日期',
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

    // 验证分页参数
    const validPageSizes = [10, 20, 50, 100];
    if (pageSize !== undefined) {
      const pageSizeNum = Number(pageSize);
      if (isNaN(pageSizeNum) || !validPageSizes.includes(pageSizeNum)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: '参数错误：pageSize 必须是 10, 20, 50, 100 之一',
          message: '参数验证失败',
        });
      }
    }

    if (page !== undefined) {
      const pageNum = Number(page);
      if (isNaN(pageNum) || pageNum < 1) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: '参数错误：page 必须是大于等于 1 的整数',
          message: '参数验证失败',
        });
      }
    }

    // 验证排序参数
    if (sortBy !== undefined) {
      const validSortBy = ['ad_spend', 'ad_sales', 'roi'];
      if (!validSortBy.includes(sortBy)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: '参数错误：sortBy 必须是 ad_spend, ad_sales, roi 之一',
          message: '参数验证失败',
        });
      }
    }

    if (sortOrder !== undefined) {
      const validSortOrder = ['asc', 'desc'];
      if (!validSortOrder.includes(sortOrder)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: '参数错误：sortOrder 必须是 asc, desc 之一',
          message: '参数验证失败',
        });
      }
    }

    try {
      const data = await this.adAnalysisService.getStageProducts(
        shopID,
        finalStartDate,
        finalEndDate,
        stage,
        shopName,
        customCategory,
        page !== undefined ? Number(page) : undefined,
        pageSize !== undefined ? Number(pageSize) : undefined,
        sortBy,
        sortOrder,
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
        message: '查询失败，请稍后重试',
      });
    }
  }
}

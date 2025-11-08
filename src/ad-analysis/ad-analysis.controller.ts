import { Controller, Get, Query, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AdAnalysisService } from './ad-analysis.service';
import { AdTrendDto } from './dto/ad-trend.dto';
import { AdRatioDto } from './dto/ad-ratio.dto';

@Controller('ad-analysis')
export class AdAnalysisController {
  constructor(private readonly adAnalysisService: AdAnalysisService) {}

  /**
   * 30天广告占比趋势
   * GET /ad-analysis/ad-trend?shopID=店铺ID
   */
  @Get('ad-trend')
  async getAdTrend(@Query() query: AdTrendDto, @Res() res: Response) {
    const { shopID } = query;

    if (!shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopID 参数不能为空',
      });
    }

    try {
      const data = await this.adAnalysisService.getAdTrend30Days(shopID);

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
   * GET /ad-analysis/ad-ratio?shopID=店铺ID&date=日期
   */
  @Get('ad-ratio')
  async getAdRatio(@Query() query: AdRatioDto, @Res() res: Response) {
    const { shopID, date } = query;

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

    try {
      const data = await this.adAnalysisService.getAdRatioByDate(shopID, date);

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

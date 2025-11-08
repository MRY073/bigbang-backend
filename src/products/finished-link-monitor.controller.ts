import { Controller, Get, Query, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorDto } from './dto/finished-link-monitor.dto';

@Controller('finished')
export class FinishedLinkMonitorController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 成品链接监控
   * GET /api/finished/link/monitor/list?shopID=店铺ID&shopName=店铺名称&date=2025-11-08
   */
  @Get('link/monitor/list')
  async getFinishedLinkMonitor(
    @Query() query: FinishedLinkMonitorDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, date } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    // 验证日期格式（如果提供了日期参数）
    if (date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2025-11-08）',
        });
      }
      // 验证日期是否有效
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: 'date 参数不是有效的日期',
        });
      }
    }

    try {
      const data = await this.productsService.getFinishedLinkMonitorData(
        shopID,
        shopName,
        date,
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
}

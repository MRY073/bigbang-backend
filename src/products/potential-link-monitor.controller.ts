import { Controller, Get, Query, HttpStatus, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { PotentialLinkMonitorDto, PotentialLinkAISuggestionDto } from './dto/potential-link-monitor.dto';
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
    const { shopID, shopName, date } = query;

    if (!shopID || !shopName || !date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        code: 400,
        message: 'shopID、shopName 和 date 参数不能为空',
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
      const data = await this.productsService.getPotentialLinkMonitorData(
        shopID,
        shopName,
        date,
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
}


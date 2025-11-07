import {
  Controller,
  Get,
  Put,
  Body,
  Query,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { TestingMonitorDto } from './dto/testing-monitor.dto';
import { AdTrendDto } from './dto/ad-trend.dto';
import { AdRatioDto } from './dto/ad-ratio.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 查询店铺商品列表
   * GET /products?shopID=店铺ID&shopName=店铺名称
   */
  @Get()
  async getProducts(@Query() query: QueryProductsDto, @Res() res: Response) {
    const { shopID, shopName } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const products = await this.productsService.getProductsByShop(
        shopID,
        shopName,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '查询成功',
        data: products,
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
   * 修改商品阶段时间段
   * PUT /products/stage
   */
  @Put('stage')
  async updateStage(@Body() body: UpdateStageDto, @Res() res: Response) {
    const { product_id, shopID, shopName, stage_type, start_time, end_time } =
      body;

    // 验证必需参数
    if (!product_id || !shopID || !shopName || !stage_type) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'product_id、shopID、shopName 和 stage_type 参数不能为空',
      });
    }

    // 验证阶段类型
    const validStageTypes = ['testing', 'potential', 'product', 'abandoned'];
    if (!validStageTypes.includes(stage_type)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `stage_type 必须是以下值之一：${validStageTypes.join(', ')}`,
      });
    }

    try {
      const result = await this.productsService.updateProductStage(
        product_id,
        shopID,
        shopName,
        stage_type,
        start_time,
        end_time,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error: unknown) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '更新失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 测款链接监控
   * GET /products/testing-monitor?shopID=店铺ID&shopName=店铺名称
   */
  @Get('testing-monitor')
  async getTestingMonitor(
    @Query() query: TestingMonitorDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName } = query;

    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const data = await this.productsService.getTestingMonitorData(
        shopID,
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
        message: '查询失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  /**
   * 30天广告占比趋势
   * GET /products/ad-trend?shop=商店ID
   */
  @Get('ad-trend')
  async getAdTrend(@Query() query: AdTrendDto, @Res() res: Response) {
    const { shop } = query;

    if (!shop) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shop 参数不能为空',
      });
    }

    try {
      const data = await this.productsService.getAdTrend30Days(shop);

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
   * GET /products/ad-ratio?shop=商店ID&date=日期
   */
  @Get('ad-ratio')
  async getAdRatio(@Query() query: AdRatioDto, @Res() res: Response) {
    const { shop, date } = query;

    if (!shop) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'shop 参数不能为空',
      });
    }

    if (!date) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'date 参数不能为空',
      });
    }

    try {
      const data = await this.productsService.getAdRatioByDate(shop, date);

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

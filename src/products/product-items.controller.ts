import {
  Controller,
  Get,
  Put,
  Delete,
  Query,
  Param,
  Body,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProductsService } from './products.service';
import { QueryProductItemsDto } from './dto/query-product-items.dto';
import { UpdateCustomCategoryDto } from './dto/update-custom-category.dto';
import { UpdateProductStatusDto } from './dto/update-product-status.dto';
import { UpdateCompetitorInfoDto } from './dto/update-competitor-info.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('product-items')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class ProductItemsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * 获取店铺自定义分类集合
   * GET /product-items/custom-categories?shopID=店铺ID
   */
  @Get('custom-categories')
  async getCustomCategories(
    @Query('shopID') shopID: string,
    @Res() res: Response,
  ) {
    const trimmedShopID = shopID?.trim();

    if (!trimmedShopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID 参数不能为空',
      });
    }

    try {
      // prettier-ignore
      const categories = await this.productsService.getCustomCategories(trimmedShopID);

      return res.status(HttpStatus.OK).json({
        success: true,
        data: categories,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('获取自定义分类失败:', message);

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message,
      });
    }
  }

  /**
   * 获取商品列表接口
   * GET /product-items?shopID=店铺ID&shopName=店铺名称&page=1&pageSize=20
   */
  @Get()
  async getProductItems(
    @Query() query: QueryProductItemsDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, page, pageSize, customCategory } = query;

    // 验证必需参数
    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const result: {
        data: Array<{
          id: number;
          product_id: string;
          product_name: string;
          product_image: string | null;
          custom_category_1: string | null;
          custom_category_2: string | null;
          custom_category_3: string | null;
          custom_category_4: string | null;
          prompt_note: string | null;
          competitor_link: string | null;
          competitor_daily_sales: string | null;
        }>;
        total: number;
      } = await this.productsService.getProductItems(
        shopID,
        shopName,
        page,
        pageSize,
        customCategory,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: `拉取成功，共 ${result.total} 条数据`,
        data: result.data,
        total: result.total,
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('获取商品列表失败:', safeMessage);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: safeMessage || '获取商品列表失败',
      });
    }
  }

  /**
   * 更新商品自定义分类接口
   * PUT /product-items/:id
   */
  @Put(':id')
  async updateProductItem(
    @Param('id') id: string,
    @Body() body: UpdateCustomCategoryDto,
    @Res() res: Response,
  ) {
    try {
      const updatedProduct: {
        id: number;
        product_id: string;
        product_name: string;
        product_image: string | null;
        custom_category_1: string | null;
        custom_category_2: string | null;
        custom_category_3: string | null;
        custom_category_4: string | null;
        prompt_note: string | null;
        competitor_link: string | null;
        competitor_daily_sales: string | null;
      } = await this.productsService.updateProductItemCustomCategory(id, body);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '保存成功',
        data: updatedProduct,
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('更新商品分类失败:', safeMessage);
      const errorMessage = safeMessage || '更新商品分类失败';

      // 如果是商品不存在的错误，返回404
      if (errorMessage.includes('商品不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: '商品不存在',
          message: '无法找到指定的商品',
        });
      }

      // 如果是验证错误（prompt_note 相关），返回400
      if (
        errorMessage.includes('prompt_note') ||
        errorMessage.includes('不能超过') ||
        errorMessage.includes('必须是字符串')
      ) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: '参数错误',
          message: errorMessage,
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: errorMessage,
      });
    }
  }

  /**
   * 删除商品接口
   * DELETE /product-items/:id
   */
  @Delete(':id')
  async deleteProductItem(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted: boolean = await this.productsService.deleteProductItem(id);

      if (!deleted) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: '商品不存在',
          message: '无法找到指定的商品',
        });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '删除成功',
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('删除商品失败:', safeMessage);
      const errorMessage = safeMessage || '删除商品失败';

      // 如果是商品不存在的错误，返回404
      if (errorMessage.includes('商品不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: '商品不存在',
          message: '无法找到指定的商品',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: errorMessage,
      });
    }
  }

  /**
   * 获取下架商品列表接口
   * GET /product-items/offline?shopID=店铺ID&shopName=店铺名称&page=1&pageSize=20
   */
  @Get('offline')
  async getOfflineProducts(
    @Query() query: QueryProductItemsDto,
    @Res() res: Response,
  ) {
    const { shopID, shopName, page, pageSize, customCategory } = query;

    // 验证必需参数
    if (!shopID || !shopName) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'shopID 和 shopName 参数不能为空',
      });
    }

    try {
      const result: {
        data: Array<{
          id: number;
          product_id: string;
          product_name: string;
          product_image: string | null;
          status: number | null;
          custom_category_1: string | null;
          custom_category_2: string | null;
          custom_category_3: string | null;
          custom_category_4: string | null;
          prompt_note: string | null;
          competitor_link: string | null;
          competitor_daily_sales: string | null;
        }>;
        total: number;
      } = await this.productsService.getOfflineProducts(
        shopID,
        shopName,
        page,
        pageSize,
        customCategory,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: `拉取成功，共 ${result.total} 条下架商品数据`,
        data: result.data,
        total: result.total,
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('获取下架商品列表失败:', safeMessage);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: safeMessage || '获取下架商品列表失败',
      });
    }
  }

  /**
   * 更新商品上下架状态接口
   * PUT /product-items/:id/status
   */
  @Put(':id/status')
  async updateProductStatus(
    @Param('id') id: string,
    @Body() body: UpdateProductStatusDto,
    @Res() res: Response,
  ) {
    const { status } = body;

    // 验证参数
    if (status !== 0 && status !== 1) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: '参数错误',
        message: 'status 必须是 0（上架）或 1（下架）',
      });
    }

    try {
      const updatedProduct: {
        id: number;
        product_id: string;
        product_name: string;
        product_image: string | null;
        status: number | null;
      } = await this.productsService.updateProductStatus(id, status);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: status === 1 ? '商品已下架' : '商品已上架',
        data: updatedProduct,
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('更新商品状态失败:', safeMessage);
      const errorMessage = safeMessage || '更新商品状态失败';

      // 如果是商品不存在的错误，返回404
      if (errorMessage.includes('商品不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: '商品不存在',
          message: '无法找到指定的商品',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: errorMessage,
      });
    }
  }

  /**
   * 更新商品竞争对手信息接口
   * PUT /product-items/:id/competitor-info
   */
  @Put(':id/competitor-info')
  async updateCompetitorInfo(
    @Param('id') id: string,
    @Body() body: UpdateCompetitorInfoDto,
    @Res() res: Response,
  ) {
    try {
      const updatedProduct: {
        id: number;
        product_id: string;
        product_name: string;
        product_image: string | null;
        competitor_link: string | null;
        competitor_daily_sales: string | null;
      } = await this.productsService.updateProductCompetitorInfo(id, body);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '竞争对手信息更新成功',
        data: updatedProduct,
      });
    } catch (error: unknown) {
      const safeMessage =
        error instanceof Error ? error.message : String(error);
      console.error('更新竞争对手信息失败:', safeMessage);
      const errorMessage = safeMessage || '更新竞争对手信息失败';

      // 如果是商品不存在的错误，返回404
      if (errorMessage.includes('商品不存在')) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: '商品不存在',
          message: '无法找到指定的商品',
        });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: '服务器错误',
        message: errorMessage,
      });
    }
  }
}

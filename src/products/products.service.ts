import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';

@Injectable()
export class ProductsService {
  constructor(private readonly mysqlService: MysqlService) {}

  /**
   * 查询店铺商品列表
   * @param shop 商店ID（店铺名称）
   * @returns 商品列表，包含产品ID、产品名称、产品主图、四个阶段的时间段
   */
  async getProductsByShop(shop: string): Promise<
    Array<{
      product_id: string;
      product_name: string;
      product_image: string | null;
      testing_stage: {
        start_time: string | null;
        end_time: string | null;
      };
      potential_stage: {
        start_time: string | null;
        end_time: string | null;
      };
      product_stage: {
        start_time: string | null;
        end_time: string | null;
      };
      abandoned_stage: {
        start_time: string | null;
        end_time: string | null;
      };
    }>
  > {
    const products = await this.mysqlService.query<{
      product_id: string;
      product_name: string;
      product_image: string | null;
      testing_stage_start: Date | null;
      testing_stage_end: Date | null;
      potential_stage_start: Date | null;
      potential_stage_end: Date | null;
      product_stage_start: Date | null;
      product_stage_end: Date | null;
      abandoned_stage_start: Date | null;
      abandoned_stage_end: Date | null;
    }>(
      `SELECT 
        product_id,
        product_name,
        product_image,
        testing_stage_start,
        testing_stage_end,
        potential_stage_start,
        potential_stage_end,
        product_stage_start,
        product_stage_end,
        abandoned_stage_start,
        abandoned_stage_end
      FROM product_items 
      WHERE shop_name = ? 
      ORDER BY id ASC`,
      [shop],
    );

    // 转换日期格式为 ISO 8601 字符串
    return products.map((product) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      product_image: product.product_image,
      testing_stage: {
        start_time: product.testing_stage_start
          ? new Date(product.testing_stage_start).toISOString()
          : null,
        end_time: product.testing_stage_end
          ? new Date(product.testing_stage_end).toISOString()
          : null,
      },
      potential_stage: {
        start_time: product.potential_stage_start
          ? new Date(product.potential_stage_start).toISOString()
          : null,
        end_time: product.potential_stage_end
          ? new Date(product.potential_stage_end).toISOString()
          : null,
      },
      product_stage: {
        start_time: product.product_stage_start
          ? new Date(product.product_stage_start).toISOString()
          : null,
        end_time: product.product_stage_end
          ? new Date(product.product_stage_end).toISOString()
          : null,
      },
      abandoned_stage: {
        start_time: product.abandoned_stage_start
          ? new Date(product.abandoned_stage_start).toISOString()
          : null,
        end_time: product.abandoned_stage_end
          ? new Date(product.abandoned_stage_end).toISOString()
          : null,
      },
    }));
  }

  /**
   * 修改商品阶段时间段
   * @param productId 产品ID
   * @param shop 商店ID（店铺名称）
   * @param stageType 阶段类型
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   */
  async updateProductStage(
    productId: string,
    shop: string,
    stageType: 'testing' | 'potential' | 'product' | 'abandoned',
    startTime?: string | null,
    endTime?: string | null,
  ): Promise<{ success: boolean; message: string }> {
    // 验证商品是否存在
    const existing = await this.mysqlService.queryOne<{ id: number }>(
      'SELECT id FROM product_items WHERE shop_name = ? AND product_id = ?',
      [shop, productId],
    );

    if (!existing) {
      throw new Error(`商品不存在：shop=${shop}, product_id=${productId}`);
    }

    // 根据阶段类型构建更新字段
    const stageFieldMap = {
      testing: {
        start: 'testing_stage_start',
        end: 'testing_stage_end',
      },
      potential: {
        start: 'potential_stage_start',
        end: 'potential_stage_end',
      },
      product: {
        start: 'product_stage_start',
        end: 'product_stage_end',
      },
      abandoned: {
        start: 'abandoned_stage_start',
        end: 'abandoned_stage_end',
      },
    };

    const fields = stageFieldMap[stageType];
    const updateData: Record<string, Date | null> = {};

    // 处理开始时间
    if (startTime === null || startTime === undefined || startTime === '') {
      updateData[fields.start] = null;
    } else {
      const startDate = new Date(startTime);
      if (isNaN(startDate.getTime())) {
        throw new Error(`开始时间格式错误：${startTime}`);
      }
      updateData[fields.start] = startDate;
    }

    // 处理结束时间
    if (endTime === null || endTime === undefined || endTime === '') {
      updateData[fields.end] = null;
    } else {
      const endDate = new Date(endTime);
      if (isNaN(endDate.getTime())) {
        throw new Error(`结束时间格式错误：${endTime}`);
      }
      updateData[fields.end] = endDate;
    }

    // 更新数据库
    await this.mysqlService.update('product_items', updateData, {
      shop_name: shop,
      product_id: productId,
    });

    return {
      success: true,
      message: `成功更新商品阶段时间段：${stageType}`,
    };
  }
}


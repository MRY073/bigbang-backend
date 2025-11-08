import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';

// ==================== 预警等级阈值配置 ====================
// 标准差系数阈值（标准差相对于平均值的比例）
const WARNING_LEVEL_THRESHOLDS = {
  严重: 0.5, // 标准差/平均值 >= 0.5 时，判定为"严重"
  一般: 0.3, // 标准差/平均值 >= 0.3 且 < 0.5 时，判定为"一般"
  轻微: 0.15, // 标准差/平均值 >= 0.15 且 < 0.3 时，判定为"轻微"
  正常: 0.0, // 标准差/平均值 < 0.15 时，判定为"正常"
};

// 需要评估的指标权重（可根据业务需求调整）
const METRIC_WEIGHTS = {
  visitors: 0.4, // 访客指标权重
  adCost: 0.3, // 广告花费指标权重
  sales: 0.3, // 销售额指标权重
};
// =========================================================

@Injectable()
export class ProductsService {
  constructor(private readonly mysqlService: MysqlService) {}

  /**
   * 查询店铺商品列表
   * @param shopID 店铺ID
   * @param shopName 店铺名称
   * @returns 商品列表，包含产品ID、产品名称、产品主图、四个阶段的时间段
   */
  async getProductsByShop(
    shopID: string,
    shopName: string,
  ): Promise<
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
      WHERE shop_id = ? 
      ORDER BY id ASC`,
      [shopID],
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
   * @param shopID 店铺ID
   * @param shopName 店铺名称
   * @param stageType 阶段类型
   * @param startTime 开始时间（可选）
   * @param endTime 结束时间（可选）
   */
  async updateProductStage(
    productId: string,
    shopID: string,
    shopName: string,
    stageType: 'testing' | 'potential' | 'product' | 'abandoned',
    startTime?: string | null,
    endTime?: string | null,
  ): Promise<{ success: boolean; message: string }> {
    // 验证商品是否存在
    const existing = await this.mysqlService.queryOne<{ id: number }>(
      'SELECT id FROM product_items WHERE shop_id = ? AND product_id = ?',
      [shopID, productId],
    );

    if (!existing) {
      throw new Error(`商品不存在：shop_id=${shopID}, product_id=${productId}`);
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
      shop_id: shopID,
      product_id: productId,
    });

    return {
      success: true,
      message: `成功更新商品阶段时间段：${stageType}`,
    };
  }

  /**
   * 测款链接监控
   * 根据商店信息筛选出当前商品阶段为测款阶段的商品，并统计相关数据
   * @param shopID 店铺ID
   * @param shopName 店铺名称
   * @returns 测款商品监控数据列表
   */
  async getTestingMonitorData(
    shopID: string,
    shopName: string,
  ): Promise<
    Array<{
      product_id: string;
      product_name: string;
      product_image: string | null;
      testing_stage_start: string; // 测款开始日期（ISO 8601 格式）
      total_clicks: number; // 测款开始以来的点击数合计
      total_visitors: number; // 测款开始以来的访客数合计
      total_orders: number; // 测款开始以来的出单数合计
    }>
  > {
    console.log('=== getTestingMonitorData 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的店铺名称:', shopName);

    const currentDate = new Date();
    console.log('当前时间:', currentDate.toISOString());

    // 1. 查询当前处于测款阶段的商品
    console.log('\n--- 第一步：查询当前处于测款阶段的商品 ---');
    console.log('查询条件:');
    console.log('  - shop_id =', shopID);
    console.log('  - testing_stage_start IS NOT NULL');
    console.log('  - testing_stage_start <=', currentDate.toISOString());
    console.log(
      '  - (testing_stage_end IS NULL OR testing_stage_end >=',
      currentDate.toISOString(),
      ')',
    );

    // 条件：shop_id = shopID 且 testing_stage_start 不为 null
    // 且当前时间在测款阶段时间范围内（如果 end 为 null，则只判断 start）
    const testingProducts = await this.mysqlService.query<{
      product_id: string;
      product_name: string;
      product_image: string | null;
      testing_stage_start: Date;
      testing_stage_end: Date | null;
    }>(
      `SELECT 
        product_id,
        product_name,
        product_image,
        testing_stage_start,
        testing_stage_end
      FROM product_items 
      WHERE shop_id = ? 
        AND testing_stage_start IS NOT NULL
        AND testing_stage_start <= ?
        AND (testing_stage_end IS NULL OR testing_stage_end >= ?)
      ORDER BY id ASC`,
      [shopID, currentDate, currentDate],
    );

    console.log('查询到的测款商品数量:', testingProducts?.length || 0);
    if (testingProducts && testingProducts.length > 0) {
      console.log('测款商品列表:');
      testingProducts.forEach((p, index) => {
        console.log(
          `  ${index + 1}. product_id: ${p.product_id}, product_name: ${p.product_name}`,
        );
        console.log(
          `     测款开始时间: ${String(p.testing_stage_start)}, 测款结束时间: ${p.testing_stage_end ? String(p.testing_stage_end) : '未设置'}`,
        );
      });
    }

    if (!testingProducts || testingProducts.length === 0) {
      console.log('⚠️ 未找到测款阶段的商品，返回空数组');
      console.log('=== getTestingMonitorData 函数执行完成（无数据）===\n');
      return [];
    }

    // 2. 对每个商品统计数据
    console.log('\n--- 第二步：对每个商品统计数据 ---');
    console.log(`开始处理 ${testingProducts.length} 个商品的统计数据`);

    const result = await Promise.all(
      testingProducts.map(async (product, index) => {
        console.log(
          `\n处理第 ${index + 1}/${testingProducts.length} 个商品: ${product.product_id}`,
        );
        const {
          product_id,
          product_name,
          product_image,
          testing_stage_start,
          testing_stage_end,
        } = product;

        console.log(`商品信息: ${product_name} (${product_id})`);

        // 转换开始时间为 Date 对象
        const startDate = new Date(testing_stage_start);
        const endDate = testing_stage_end ? new Date(testing_stage_end) : null;

        console.log(`测款开始时间: ${startDate.toISOString()}`);
        console.log(
          `测款结束时间: ${endDate ? endDate.toISOString() : '未设置（无结束时间）'}`,
        );

        // 格式化日期为 YYYY-MM-DD 格式（用于 SQL 查询）
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate ? endDate.toISOString().split('T')[0] : null;

        console.log(`用于查询的开始日期: ${startDateStr}`);
        console.log(`用于查询的结束日期: ${endDateStr || '无（查询到当前）'}`);

        // 初始化统计数据
        let totalClicks = 0;
        let totalVisitors = 0;
        let totalOrders = 0;

        try {
          // 3. 查询 ad_stats 表的点击数合计
          console.log(`\n  [${product_id}] 开始查询广告数据（点击数）...`);
          try {
            let adStatsQuery = `
              SELECT COALESCE(SUM(clicks), 0) as total_clicks
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ?
            `;
            const adStatsParams: any[] = [shopID, product_id, startDateStr];

            if (endDateStr) {
              adStatsQuery += ' AND date <= ?';
              adStatsParams.push(endDateStr);
            }

            console.log(`  [${product_id}] 广告数据查询 SQL:`, adStatsQuery);
            console.log(`  [${product_id}] 查询参数:`, adStatsParams);

            const adStatsResult = await this.mysqlService.queryOne<{
              total_clicks: number | null;
            }>(adStatsQuery, adStatsParams);

            console.log(`  [${product_id}] 广告数据查询结果:`, adStatsResult);

            if (adStatsResult && adStatsResult.total_clicks !== null) {
              totalClicks = Number(adStatsResult.total_clicks) || 0;
              console.log(
                `  [${product_id}] ✅ 点击数统计成功: ${totalClicks}`,
              );
            } else {
              console.log(
                `  [${product_id}] ⚠️ 广告数据查询结果为空，点击数设为 0`,
              );
            }
          } catch (error) {
            // 查询广告数据失败，设置为 0
            console.warn(`  [${product_id}] ❌ 查询广告数据失败:`, error);
            totalClicks = 0;
          }

          // 4. 查询 daily_product_stats 表的访客数和出单数合计
          console.log(
            `\n  [${product_id}] 开始查询每日数据（访客数和出单数）...`,
          );
          try {
            let dailyStatsQuery = `
              SELECT 
                COALESCE(SUM(visitors), 0) as total_visitors,
                COALESCE(SUM(ordered_items), 0) as total_orders
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ?
            `;
            const dailyStatsParams: any[] = [shopID, product_id, startDateStr];

            if (endDateStr) {
              dailyStatsQuery += ' AND date <= ?';
              dailyStatsParams.push(endDateStr);
            }

            console.log(`  [${product_id}] 每日数据查询 SQL:`, dailyStatsQuery);
            console.log(`  [${product_id}] 查询参数:`, dailyStatsParams);

            const dailyStatsResult = await this.mysqlService.queryOne<{
              total_visitors: number | null;
              total_orders: number | null;
            }>(dailyStatsQuery, dailyStatsParams);

            console.log(
              `  [${product_id}] 每日数据查询结果:`,
              dailyStatsResult,
            );

            if (dailyStatsResult) {
              totalVisitors = Number(dailyStatsResult.total_visitors) || 0;
              totalOrders = Number(dailyStatsResult.total_orders) || 0;
              console.log(
                `  [${product_id}] ✅ 访客数统计成功: ${totalVisitors}`,
              );
              console.log(
                `  [${product_id}] ✅ 出单数统计成功: ${totalOrders}`,
              );
            } else {
              console.log(
                `  [${product_id}] ⚠️ 每日数据查询结果为空，访客数和出单数设为 0`,
              );
            }
          } catch (error) {
            // 查询每日数据失败，设置为 0
            console.warn(`  [${product_id}] ❌ 查询每日数据失败:`, error);
            totalVisitors = 0;
            totalOrders = 0;
          }

          console.log(`\n  [${product_id}] 📊 统计数据汇总:`);
          console.log(`     - 点击数: ${totalClicks}`);
          console.log(`     - 访客数: ${totalVisitors}`);
          console.log(`     - 出单数: ${totalOrders}`);
        } catch (error) {
          // 整体查询失败，使用默认值 0
          console.error(`  [${product_id}] ❌ 统计商品数据失败:`, error);
        }

        const productResult = {
          product_id,
          product_name,
          product_image,
          testing_stage_start: startDate.toISOString(),
          total_clicks: totalClicks,
          total_visitors: totalVisitors,
          total_orders: totalOrders,
        };

        console.log(`  [${product_id}] ✅ 商品数据处理完成`);

        return productResult;
      }),
    );

    console.log('\n=== getTestingMonitorData 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 个商品`);
    console.log('最终返回结果:');
    result.forEach((item, index) => {
      console.log(
        `  ${index + 1}. ${item.product_name} (${item.product_id}): 点击数=${item.total_clicks}, 访客数=${item.total_visitors}, 出单数=${item.total_orders}`,
      );
    });
    console.log('==========================================\n');

    return result;
  }

  /**
   * 判断商品在指定日期属于哪个阶段
   * @param productId 商品ID
   * @param shopID 店铺ID
   * @param targetDate 目标日期
   * @returns 阶段类型：'testing' | 'potential' | 'product' | 'abandoned' | null
   */
  private async getProductStageByDate(
    productId: string,
    shopID: string,
    targetDate: Date,
  ): Promise<'testing' | 'potential' | 'product' | 'abandoned' | null> {
    try {
      const product = await this.mysqlService.queryOne<{
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
          testing_stage_start,
          testing_stage_end,
          potential_stage_start,
          potential_stage_end,
          product_stage_start,
          product_stage_end,
          abandoned_stage_start,
          abandoned_stage_end
        FROM product_items
        WHERE shop_id = ? AND product_id = ?`,
        [shopID, productId],
      );

      if (!product) {
        return null;
      }

      const dateStr = targetDate.toISOString().split('T')[0];

      // 判断是否在测款阶段
      if (product.testing_stage_start) {
        const start = new Date(product.testing_stage_start)
          .toISOString()
          .split('T')[0];
        const end = product.testing_stage_end
          ? new Date(product.testing_stage_end).toISOString().split('T')[0]
          : null;
        if (dateStr >= start && (!end || dateStr <= end)) {
          return 'testing';
        }
      }

      // 判断是否在潜力阶段
      if (product.potential_stage_start) {
        const start = new Date(product.potential_stage_start)
          .toISOString()
          .split('T')[0];
        const end = product.potential_stage_end
          ? new Date(product.potential_stage_end).toISOString().split('T')[0]
          : null;
        if (dateStr >= start && (!end || dateStr <= end)) {
          return 'potential';
        }
      }

      // 判断是否在成品阶段
      if (product.product_stage_start) {
        const start = new Date(product.product_stage_start)
          .toISOString()
          .split('T')[0];
        const end = product.product_stage_end
          ? new Date(product.product_stage_end).toISOString().split('T')[0]
          : null;
        if (dateStr >= start && (!end || dateStr <= end)) {
          return 'product';
        }
      }

      // 判断是否在放弃阶段
      if (product.abandoned_stage_start) {
        const start = new Date(product.abandoned_stage_start)
          .toISOString()
          .split('T')[0];
        const end = product.abandoned_stage_end
          ? new Date(product.abandoned_stage_end).toISOString().split('T')[0]
          : null;
        if (dateStr >= start && (!end || dateStr <= end)) {
          return 'abandoned';
        }
      }

      return null;
    } catch (error) {
      console.warn(
        `判断商品阶段失败 (shopID: ${shopID}, product_id: ${productId}, date: ${targetDate.toISOString()}):`,
        error,
      );
      return null;
    }
  }

  /**
   * 30天广告占比趋势
   * 计算近30天，每天的不同类型广告商品所属阶段的花费对比
   * @param shopID 店铺ID
   * @returns 30天的趋势数据
   */
  async getAdTrend30Days(shopID: string): Promise<
    Array<{
      date: string; // 日期 YYYY-MM-DD
      testing_stage_spend: number; // 测款阶段花费
      potential_stage_spend: number; // 潜力阶段花费
      product_stage_spend: number; // 成品阶段花费
      abandoned_stage_spend: number; // 放弃阶段花费
      no_stage_spend: number; // 无阶段花费
    }>
  > {
    console.log('=== getAdTrend30Days 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);

    // 计算近30天的日期范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // 近30天（包含今天）

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('查询日期范围:', startDateStr, '到', endDateStr);

    // 1. 查询近30天的广告数据
    console.log('\n--- 第一步：查询近30天的广告数据 ---');
    const adStats = await this.mysqlService.query<{
      product_id: string;
      date: Date;
      spend: number | null;
    }>(
      `SELECT 
        product_id,
        date,
        COALESCE(spend, 0) as spend
      FROM ad_stats
      WHERE shop_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC, product_id ASC`,
      [shopID, startDateStr, endDateStr],
    );

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数组');
      // 返回30天的空数据
      const emptyData: Array<{
        date: string;
        testing_stage_spend: number;
        potential_stage_spend: number;
        product_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
      }> = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        emptyData.push({
          date: date.toISOString().split('T')[0],
          testing_stage_spend: 0,
          potential_stage_spend: 0,
          product_stage_spend: 0,
          abandoned_stage_spend: 0,
          no_stage_spend: 0,
        });
      }
      return emptyData;
    }

    // 2. 生成30天的日期列表
    const dateMap = new Map<
      string,
      {
        testing_stage_spend: number;
        potential_stage_spend: number;
        product_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
      }
    >();

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        testing_stage_spend: 0,
        potential_stage_spend: 0,
        product_stage_spend: 0,
        abandoned_stage_spend: 0,
        no_stage_spend: 0,
      });
    }

    // 3. 对每条广告数据，判断商品阶段并累加花费
    console.log('\n--- 第二步：判断商品阶段并统计花费 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    for (const ad of adStats) {
      const dateStr =
        ad.date instanceof Date
          ? ad.date.toISOString().split('T')[0]
          : new Date(ad.date).toISOString().split('T')[0];
      const spend = Number(ad.spend) || 0;

      if (spend <= 0) continue; // 跳过花费为0或null的数据

      const stage = await this.getProductStageByDate(
        ad.product_id,
        shopID,
        new Date(dateStr),
      );

      const dayData = dateMap.get(dateStr);
      if (dayData) {
        if (stage === 'testing') {
          dayData.testing_stage_spend += spend;
        } else if (stage === 'potential') {
          dayData.potential_stage_spend += spend;
        } else if (stage === 'product') {
          dayData.product_stage_spend += spend;
        } else if (stage === 'abandoned') {
          dayData.abandoned_stage_spend += spend;
        } else {
          dayData.no_stage_spend += spend;
        }
      }
    }

    // 4. 转换为数组格式
    const result = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('\n=== getAdTrend30Days 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 天的数据`);
    console.log('最终返回结果（前5天示例）:');
    result.slice(0, 5).forEach((item) => {
      console.log(
        `  ${item.date}: 测款=${item.testing_stage_spend}, 潜力=${item.potential_stage_spend}, 成品=${item.product_stage_spend}, 放弃=${item.abandoned_stage_spend}, 无阶段=${item.no_stage_spend}`,
      );
    });
    console.log('==========================================\n');

    return result;
  }

  /**
   * 指定日期广告占比
   * 获取当天的不同阶段商品的广告花费
   * 只计算成品阶段商品的广告花费和产出，以及成品阶段合计的ROI
   * @param shopID 店铺ID
   * @param date 日期（YYYY-MM-DD 格式）
   * @returns 指定日期的广告占比数据
   */
  async getAdRatioByDate(
    shopID: string,
    date: string,
  ): Promise<{
    date: string;
    stages: {
      testing_stage: { spend: number };
      potential_stage: { spend: number };
      product_stage: {
        spend: number;
        sales_amount: number; // 产出（销售额）
        roi: number; // ROI（广告支出回报率）
      };
      abandoned_stage: { spend: number };
      no_stage: { spend: number };
    };
  }> {
    console.log('=== getAdRatioByDate 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的日期:', date);

    // 验证日期格式
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    console.log('解析后的日期:', dateStr);

    // 1. 查询指定日期的广告数据
    console.log('\n--- 第一步：查询指定日期的广告数据 ---');
    const adStats = await this.mysqlService.query<{
      product_id: string;
      spend: number | null;
      sales_amount: number | null;
      roas: number | null;
    }>(
      `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount,
        COALESCE(roas, 0) as roas
      FROM ad_stats
      WHERE shop_id = ? AND date = ?
      ORDER BY product_id ASC`,
      [shopID, dateStr],
    );

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    // 初始化各阶段数据
    const stageData = {
      testing_stage: { spend: 0 },
      potential_stage: { spend: 0 },
      product_stage: {
        spend: 0,
        sales_amount: 0,
        roi: 0,
      },
      abandoned_stage: { spend: 0 },
      no_stage: { spend: 0 },
    };

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数据');
      console.log('=== getAdRatioByDate 函数执行完成（无数据）===\n');
      return {
        date: dateStr,
        stages: stageData,
      };
    }

    // 2. 对每条广告数据，判断商品阶段并累加花费
    console.log('\n--- 第二步：判断商品阶段并统计花费 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    let productStageSpend = 0;
    let productStageSales = 0;
    let productStageWeightedRoi = 0; // 用于计算加权平均ROI

    for (const ad of adStats) {
      const spend = Number(ad.spend) || 0;
      if (spend <= 0) continue; // 跳过花费为0的数据

      const stage = await this.getProductStageByDate(
        ad.product_id,
        shopID,
        targetDate,
      );

      console.log(
        `商品 ${ad.product_id}: 阶段=${stage || '无'}, 花费=${spend}`,
      );

      if (stage === 'testing') {
        stageData.testing_stage.spend += spend;
      } else if (stage === 'potential') {
        stageData.potential_stage.spend += spend;
      } else if (stage === 'product') {
        stageData.product_stage.spend += spend;
        const sales = Number(ad.sales_amount) || 0;
        const roas = Number(ad.roas) || 0;
        stageData.product_stage.sales_amount += sales;
        // 累加花费用于计算加权平均ROI
        productStageSpend += spend;
        productStageSales += sales;
        // 如果ROI存在，累加（按花费加权）
        if (roas > 0 && spend > 0) {
          productStageWeightedRoi += roas * spend;
        }
      } else if (stage === 'abandoned') {
        stageData.abandoned_stage.spend += spend;
      } else {
        stageData.no_stage.spend += spend;
      }
    }

    // 3. 计算成品阶段的合计ROI
    console.log('\n--- 第三步：计算成品阶段的合计ROI ---');
    if (productStageSpend > 0) {
      // 方法1：使用加权平均ROI
      if (productStageWeightedRoi > 0) {
        stageData.product_stage.roi =
          productStageWeightedRoi / productStageSpend;
      } else {
        // 方法2：如果没有ROI数据，使用销售额/花费计算
        stageData.product_stage.roi =
          productStageSales > 0 ? productStageSales / productStageSpend : 0;
      }
    } else {
      stageData.product_stage.roi = 0;
    }

    console.log('成品阶段统计:');
    console.log(`  花费: ${stageData.product_stage.spend}`);
    console.log(`  产出（销售额）: ${stageData.product_stage.sales_amount}`);
    console.log(`  ROI: ${stageData.product_stage.roi}`);

    console.log('\n=== getAdRatioByDate 函数执行完成 ===');
    console.log('最终返回结果:', {
      date: dateStr,
      stages: stageData,
    });
    console.log('==========================================\n');

    return {
      date: dateStr,
      stages: stageData,
    };
  }

  /**
   * 成品链接监控
   * 获取成品阶段商品的监控数据，包括访客、广告花费、销售额等指标的变化趋势和预警信息
   * @param shopID 店铺ID
   * @param shopName 店铺名称
   * @param date 日期（YYYY-MM-DD 格式，可选，默认为当前日期）
   * @returns 成品链接监控数据列表
   */
  async getFinishedLinkMonitorData(
    shopID: string,
    shopName: string,
    date?: string,
  ): Promise<
    Array<{
      id: string;
      name: string;
      image?: string | null;
      visitorsAvg: number[];
      visitorsStd: number[];
      adCostAvg: number[];
      adCostStd: number[];
      salesAvg: number[];
      salesStd: number[];
      warningLevel: '严重' | '一般' | '轻微' | '正常';
    }>
  > {
    console.log('=== getFinishedLinkMonitorData 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的店铺名称:', shopName);
    console.log('接收到的日期参数:', date || '未提供（使用当前日期）');

    // 使用传入的日期参数，如果未提供则使用当前日期
    let currentDate: Date;
    if (date) {
      // 解析日期字符串（格式：YYYY-MM-DD）
      const [year, month, day] = date.split('-').map(Number);
      currentDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    } else {
      currentDate = new Date();
    }
    console.log('使用的基准日期:', currentDate.toISOString());

    // 1. 查询当前处于成品阶段的商品
    console.log('\n--- 第一步：查询当前处于成品阶段的商品 ---');
    const finishedProducts = await this.mysqlService.query<{
      product_id: string;
      product_name: string;
      product_image: string | null;
    }>(
      `SELECT 
        product_id,
        product_name,
        product_image
      FROM product_items 
      WHERE shop_id = ? 
        AND product_stage_start IS NOT NULL
        AND product_stage_start <= ?
        AND (product_stage_end IS NULL OR product_stage_end >= ?)
      ORDER BY id ASC`,
      [shopID, currentDate, currentDate],
    );

    console.log('查询到的成品商品数量:', finishedProducts?.length || 0);

    if (!finishedProducts || finishedProducts.length === 0) {
      console.log('⚠️ 未找到成品阶段的商品，返回空数组');
      console.log('=== getFinishedLinkMonitorData 函数执行完成（无数据）===\n');
      return [];
    }

    // 2. 对每个商品计算5个时间维度的统计数据
    console.log('\n--- 第二步：对每个商品计算统计数据 ---');
    console.log(`开始处理 ${finishedProducts.length} 个商品的统计数据`);

    const timeDimensions = [30, 15, 7, 3, 1]; // 5个时间维度（天）

    const result = await Promise.all(
      finishedProducts.map(async (product) => {
        const { product_id, product_name, product_image } = product;

        console.log(`\n处理商品: ${product_id} (${product_name})`);

        // 初始化结果数组
        const visitorsAvg: number[] = [];
        const visitorsStd: number[] = [];
        const adCostAvg: number[] = [];
        const adCostStd: number[] = [];
        const salesAvg: number[] = [];
        const salesStd: number[] = [];

        // 对每个时间维度计算统计数据
        for (const days of timeDimensions) {
          const endDate = new Date(currentDate);
          const startDate = new Date(currentDate);
          startDate.setDate(endDate.getDate() - (days - 1));

          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];

          console.log(
            `  [${product_id}] 计算 ${days} 天数据 (${startDateStr} 到 ${endDateStr})`,
          );

          try {
            // 查询访客数统计数据（从 daily_product_stats 表）
            const visitorsStats = await this.mysqlService.queryOne<{
              avg_visitors: number | null;
              stddev_visitors: number | null;
            }>(
              `SELECT 
                AVG(visitors) as avg_visitors,
                STDDEV_POP(visitors) as stddev_visitors
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              GROUP BY product_id`,
              [shopID, product_id, startDateStr, endDateStr],
            );

            const visitorsAvgValue =
              visitorsStats && visitorsStats.avg_visitors !== null
                ? Number(visitorsStats.avg_visitors) || 0
                : 0;
            const visitorsStdValue =
              visitorsStats && visitorsStats.stddev_visitors !== null
                ? Number(visitorsStats.stddev_visitors) || 0
                : 0;

            visitorsAvg.push(visitorsAvgValue);
            visitorsStd.push(visitorsStdValue);

            // 查询广告花费统计数据（从 ad_stats 表）
            const adCostStats = await this.mysqlService.queryOne<{
              avg_spend: number | null;
              stddev_spend: number | null;
            }>(
              `SELECT 
                AVG(spend) as avg_spend,
                STDDEV_POP(spend) as stddev_spend
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              GROUP BY product_id`,
              [shopID, product_id, startDateStr, endDateStr],
            );

            const adCostAvgValue =
              adCostStats && adCostStats.avg_spend !== null
                ? Number(adCostStats.avg_spend) || 0
                : 0;
            const adCostStdValue =
              adCostStats && adCostStats.stddev_spend !== null
                ? Number(adCostStats.stddev_spend) || 0
                : 0;

            adCostAvg.push(adCostAvgValue);
            adCostStd.push(adCostStdValue);

            // 查询销售额原始数据（从 daily_product_stats 表的 confirmed_sales 字段）
            const salesData = await this.mysqlService.query<{
              confirmed_sales: number | null;
            }>(
              `SELECT confirmed_sales
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`,
              [shopID, product_id, startDateStr, endDateStr],
            );

            // 使用 JavaScript 计算平均值和标准差
            const salesValues = salesData
              .map((row) => row.confirmed_sales)
              .filter((value) => value !== null && value !== undefined)
              .map((value) => Number(value) || 0);

            let salesAvgValue = 0;
            let salesStdValue = 0;

            if (salesValues.length > 0) {
              // 计算平均值
              const sum = salesValues.reduce((acc, val) => acc + val, 0);
              salesAvgValue = sum / salesValues.length;

              // 计算标准差
              if (salesValues.length > 1) {
                const variance =
                  salesValues.reduce(
                    (acc, val) => acc + Math.pow(val - salesAvgValue, 2),
                    0,
                  ) / salesValues.length;
                salesStdValue = Math.sqrt(variance);
              } else {
                salesStdValue = 0;
              }
            }

            salesAvg.push(salesAvgValue);
            salesStd.push(salesStdValue);

            console.log(
              `    [${product_id}] ${days}天: 访客(avg=${visitorsAvgValue.toFixed(2)}, std=${visitorsStdValue.toFixed(2)}), 广告花费(avg=${adCostAvgValue.toFixed(2)}, std=${adCostStdValue.toFixed(2)}), 销售额(avg=${salesAvgValue.toFixed(2)}, std=${salesStdValue.toFixed(2)})`,
            );
          } catch (error) {
            console.warn(`    [${product_id}] 计算 ${days} 天数据失败:`, error);
            // 发生错误时，设置为0
            visitorsAvg.push(0);
            visitorsStd.push(0);
            adCostAvg.push(0);
            adCostStd.push(0);
            salesAvg.push(0);
            salesStd.push(0);
          }
        }

        // 3. 计算预警等级
        const warningLevel = this.calculateWarningLevel(
          visitorsAvg,
          visitorsStd,
          adCostAvg,
          adCostStd,
          salesAvg,
          salesStd,
        );

        console.log(`  [${product_id}] 预警等级: ${warningLevel}`);

        return {
          id: product_id,
          name: product_name,
          image: product_image,
          visitorsAvg,
          visitorsStd,
          adCostAvg,
          adCostStd,
          salesAvg,
          salesStd,
          warningLevel,
        };
      }),
    );

    console.log('\n=== getFinishedLinkMonitorData 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 个商品`);
    console.log('==========================================\n');

    return result;
  }

  /**
   * 计算预警等级
   * @param visitorsAvg 访客数平均值数组 [30日, 15日, 7日, 3日, 1日]
   * @param visitorsStd 访客数标准差数组 [30日, 15日, 7日, 3日, 1日]
   * @param adCostAvg 广告花费平均值数组 [30日, 15日, 7日, 3日, 1日]
   * @param adCostStd 广告花费标准差数组 [30日, 15日, 7日, 3日, 1日]
   * @param salesAvg 销售额平均值数组 [30日, 15日, 7日, 3日, 1日]
   * @param salesStd 销售额标准差数组 [30日, 15日, 7日, 3日, 1日]
   * @returns 预警等级
   */
  private calculateWarningLevel(
    visitorsAvg: number[],
    visitorsStd: number[],
    adCostAvg: number[],
    adCostStd: number[],
    salesAvg: number[],
    salesStd: number[],
  ): '严重' | '一般' | '轻微' | '正常' {
    // 获取最近的时间维度（1日和3日）的索引
    // 数组顺序：[30日, 15日, 7日, 3日, 1日]
    // 索引：    [0,    1,    2,   3,   4]
    const index1Day = 4; // 1日的索引
    const index3Day = 3; // 3日的索引

    // 计算1日和3日的变异系数（CV = 标准差/平均值）
    const calculateCV = (avg: number, std: number): number => {
      if (avg === 0 || avg < 0.001) {
        return std > 0.001 ? 1.0 : 0; // 如果平均值为0但标准差不为0，返回1.0
      }
      return std / avg;
    };

    // 1日的变异系数
    const cvVisitors1Day = calculateCV(
      visitorsAvg[index1Day],
      visitorsStd[index1Day],
    );
    const cvAdCost1Day = calculateCV(
      adCostAvg[index1Day],
      adCostStd[index1Day],
    );
    const cvSales1Day = calculateCV(salesAvg[index1Day], salesStd[index1Day]);

    // 3日的变异系数
    const cvVisitors3Day = calculateCV(
      visitorsAvg[index3Day],
      visitorsStd[index3Day],
    );
    const cvAdCost3Day = calculateCV(
      adCostAvg[index3Day],
      adCostStd[index3Day],
    );
    const cvSales3Day = calculateCV(salesAvg[index3Day], salesStd[index3Day]);

    // 计算加权分数
    const score1Day =
      cvVisitors1Day * METRIC_WEIGHTS.visitors +
      cvAdCost1Day * METRIC_WEIGHTS.adCost +
      cvSales1Day * METRIC_WEIGHTS.sales;

    const score3Day =
      cvVisitors3Day * METRIC_WEIGHTS.visitors +
      cvAdCost3Day * METRIC_WEIGHTS.adCost +
      cvSales3Day * METRIC_WEIGHTS.sales;

    // 计算综合预警分数（1日权重0.6，3日权重0.4）
    const compositeScore = score1Day * 0.6 + score3Day * 0.4;

    // 根据综合分数判断预警等级
    if (compositeScore >= WARNING_LEVEL_THRESHOLDS.严重) {
      return '严重';
    } else if (compositeScore >= WARNING_LEVEL_THRESHOLDS.一般) {
      return '一般';
    } else if (compositeScore >= WARNING_LEVEL_THRESHOLDS.轻微) {
      return '轻微';
    } else {
      return '正常';
    }
  }
}

import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';

@Injectable()
export class AdAnalysisService {
  constructor(private readonly mysqlService: MysqlService) {}

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
   * 计算近30天，每天的不同类型广告商品所属阶段的花费、销售额和ROI对比
   * @param shopID 店铺ID
   * @param shopName 店铺名称（用于日志记录）
   * @param customCategory 自定义分类筛选值（可选）
   * @returns 30天的趋势数据
   */
  async getAdTrend30Days(
    shopID: string,
    shopName?: string,
    customCategory?: string,
  ): Promise<
    Array<{
      date: string; // 日期 YYYY-MM-DD
      product_stage_spend?: number; // 成品阶段广告消耗
      testing_stage_spend?: number; // 测款阶段广告消耗
      potential_stage_spend?: number; // 潜力阶段广告消耗
      abandoned_stage_spend?: number; // 放弃阶段广告消耗
      no_stage_spend?: number; // 其他阶段广告消耗
      product_stage_sales?: number; // 成品阶段广告销售额
      testing_stage_sales?: number; // 测款阶段广告销售额
      potential_stage_sales?: number; // 潜力阶段广告销售额
      abandoned_stage_sales?: number; // 放弃阶段广告销售额
      no_stage_sales?: number; // 其他阶段广告销售额
      product_stage_roi?: number; // 成品阶段 ROI
      testing_stage_roi?: number; // 测款阶段 ROI
      potential_stage_roi?: number; // 潜力阶段 ROI
      abandoned_stage_roi?: number; // 放弃阶段 ROI
      no_stage_roi?: number; // 其他阶段 ROI
    }>
  > {
    console.log('=== getAdTrend30Days 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    if (shopName) {
      console.log('接收到的店铺名称:', shopName);
    }
    if (customCategory) {
      console.log('接收到的自定义分类:', customCategory);
    }

    // 计算近30天的日期范围
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 29); // 近30天（包含今天）

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('查询日期范围:', startDateStr, '到', endDateStr);

    // 1. 如果提供了自定义分类，先查询符合条件的商品ID
    let filteredProductIds: string[] | null = null;
    if (customCategory && customCategory.trim()) {
      console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
      const trimmedCategory = customCategory.trim();
      const products = await this.mysqlService.query<{
        product_id: string;
      }>(
        `SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`,
        [shopID, trimmedCategory, trimmedCategory, trimmedCategory, trimmedCategory],
      );
      filteredProductIds = products.map((p) => p.product_id);
      console.log(`符合自定义分类的商品数量: ${filteredProductIds.length}`);
    }

    // 2. 查询近30天的广告数据（包含花费和销售额）
    console.log('\n--- 第二步：查询近30天的广告数据 ---');
    let adStatsQuery = `SELECT 
        product_id,
        date,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date >= ? AND date <= ?`;
    const queryParams: Array<string | string[]> = [shopID, startDateStr, endDateStr];

    if (filteredProductIds !== null && filteredProductIds.length > 0) {
      adStatsQuery += ` AND product_id IN (${filteredProductIds.map(() => '?').join(',')})`;
      queryParams.push(...filteredProductIds);
    } else if (filteredProductIds !== null && filteredProductIds.length === 0) {
      // 如果自定义分类筛选后没有符合条件的商品，返回30天的空数据
      console.log('⚠️ 自定义分类筛选后没有符合条件的商品，返回空数据');
      const emptyData: Array<{
        date: string;
        product_stage_spend: number;
        testing_stage_spend: number;
        potential_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_sales: number;
        testing_stage_sales: number;
        potential_stage_sales: number;
        abandoned_stage_sales: number;
        no_stage_sales: number;
        product_stage_roi: number;
        testing_stage_roi: number;
        potential_stage_roi: number;
        abandoned_stage_roi: number;
        no_stage_roi: number;
      }> = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        emptyData.push({
          date: date.toISOString().split('T')[0],
          product_stage_spend: 0,
          testing_stage_spend: 0,
          potential_stage_spend: 0,
          abandoned_stage_spend: 0,
          no_stage_spend: 0,
          product_stage_sales: 0,
          testing_stage_sales: 0,
          potential_stage_sales: 0,
          abandoned_stage_sales: 0,
          no_stage_sales: 0,
          product_stage_roi: 0,
          testing_stage_roi: 0,
          potential_stage_roi: 0,
          abandoned_stage_roi: 0,
          no_stage_roi: 0,
        });
      }
      return emptyData;
    }

    adStatsQuery += ' ORDER BY date ASC, product_id ASC';

    const adStats = await this.mysqlService.query<{
      product_id: string;
      date: Date;
      spend: number | null;
      sales_amount: number | null;
    }>(adStatsQuery, queryParams);

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    // 3. 生成30天的日期列表
    const dateMap = new Map<
      string,
      {
        product_stage_spend: number;
        testing_stage_spend: number;
        potential_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_sales: number;
        testing_stage_sales: number;
        potential_stage_sales: number;
        abandoned_stage_sales: number;
        no_stage_sales: number;
      }
    >();

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, {
        product_stage_spend: 0,
        testing_stage_spend: 0,
        potential_stage_spend: 0,
        abandoned_stage_spend: 0,
        no_stage_spend: 0,
        product_stage_sales: 0,
        testing_stage_sales: 0,
        potential_stage_sales: 0,
        abandoned_stage_sales: 0,
        no_stage_sales: 0,
      });
    }

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数组');
      // 返回30天的空数据
      const emptyData: Array<{
        date: string;
        product_stage_spend: number;
        testing_stage_spend: number;
        potential_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_sales: number;
        testing_stage_sales: number;
        potential_stage_sales: number;
        abandoned_stage_sales: number;
        no_stage_sales: number;
        product_stage_roi: number;
        testing_stage_roi: number;
        potential_stage_roi: number;
        abandoned_stage_roi: number;
        no_stage_roi: number;
      }> = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        emptyData.push({
          date: date.toISOString().split('T')[0],
          product_stage_spend: 0,
          testing_stage_spend: 0,
          potential_stage_spend: 0,
          abandoned_stage_spend: 0,
          no_stage_spend: 0,
          product_stage_sales: 0,
          testing_stage_sales: 0,
          potential_stage_sales: 0,
          abandoned_stage_sales: 0,
          no_stage_sales: 0,
          product_stage_roi: 0,
          testing_stage_roi: 0,
          potential_stage_roi: 0,
          abandoned_stage_roi: 0,
          no_stage_roi: 0,
        });
      }
      return emptyData;
    }

    // 4. 对每条广告数据，判断商品阶段并累加花费和销售额
    console.log('\n--- 第三步：判断商品阶段并统计花费和销售额 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    for (const ad of adStats) {
      const dateStr =
        ad.date instanceof Date
          ? ad.date.toISOString().split('T')[0]
          : new Date(ad.date).toISOString().split('T')[0];
      const spend = Number(ad.spend) || 0;
      const sales = Number(ad.sales_amount) || 0;

      const stage = await this.getProductStageByDate(
        ad.product_id,
        shopID,
        new Date(dateStr),
      );

      const dayData = dateMap.get(dateStr);
      if (dayData) {
        if (stage === 'testing') {
          dayData.testing_stage_spend += spend;
          dayData.testing_stage_sales += sales;
        } else if (stage === 'potential') {
          dayData.potential_stage_spend += spend;
          dayData.potential_stage_sales += sales;
        } else if (stage === 'product') {
          dayData.product_stage_spend += spend;
          dayData.product_stage_sales += sales;
        } else if (stage === 'abandoned') {
          dayData.abandoned_stage_spend += spend;
          dayData.abandoned_stage_sales += sales;
        } else {
          dayData.no_stage_spend += spend;
          dayData.no_stage_sales += sales;
        }
      }
    }

    // 5. 计算每日各阶段的ROI并转换为数组格式
    const result = Array.from(dateMap.entries())
      .map(([date, data]) => {
        // 计算各阶段的ROI：销售额 / 广告消耗
        const calculateRoi = (spend: number, sales: number): number => {
          if (spend > 0) {
            return Math.round((sales / spend) * 100) / 100;
          }
          return 0;
        };

        return {
          date,
          product_stage_spend: Math.round(data.product_stage_spend * 100) / 100,
          testing_stage_spend: Math.round(data.testing_stage_spend * 100) / 100,
          potential_stage_spend:
            Math.round(data.potential_stage_spend * 100) / 100,
          abandoned_stage_spend:
            Math.round(data.abandoned_stage_spend * 100) / 100,
          no_stage_spend: Math.round(data.no_stage_spend * 100) / 100,
          product_stage_sales: Math.round(data.product_stage_sales * 100) / 100,
          testing_stage_sales: Math.round(data.testing_stage_sales * 100) / 100,
          potential_stage_sales:
            Math.round(data.potential_stage_sales * 100) / 100,
          abandoned_stage_sales:
            Math.round(data.abandoned_stage_sales * 100) / 100,
          no_stage_sales: Math.round(data.no_stage_sales * 100) / 100,
          product_stage_roi: calculateRoi(
            data.product_stage_spend,
            data.product_stage_sales,
          ),
          testing_stage_roi: calculateRoi(
            data.testing_stage_spend,
            data.testing_stage_sales,
          ),
          potential_stage_roi: calculateRoi(
            data.potential_stage_spend,
            data.potential_stage_sales,
          ),
          abandoned_stage_roi: calculateRoi(
            data.abandoned_stage_spend,
            data.abandoned_stage_sales,
          ),
          no_stage_roi: calculateRoi(data.no_stage_spend, data.no_stage_sales),
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('\n=== getAdTrend30Days 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 天的数据`);
    console.log('最终返回结果（前5天示例）:');
    result.slice(0, 5).forEach((item) => {
      console.log(
        `  ${item.date}: 成品(花费=${item.product_stage_spend}, 销售额=${item.product_stage_sales}, ROI=${item.product_stage_roi}), 测款(花费=${item.testing_stage_spend}, 销售额=${item.testing_stage_sales}, ROI=${item.testing_stage_roi}), 潜力(花费=${item.potential_stage_spend}, 销售额=${item.potential_stage_sales}, ROI=${item.potential_stage_roi}), 放弃(花费=${item.abandoned_stage_spend}, 销售额=${item.abandoned_stage_sales}, ROI=${item.abandoned_stage_roi}), 无阶段(花费=${item.no_stage_spend}, 销售额=${item.no_stage_sales}, ROI=${item.no_stage_roi})`,
      );
    });
    console.log('==========================================\n');

    return result;
  }

  /**
   * 指定日期广告占比
   * 获取当天的不同阶段商品的广告花费、销售额和ROI
   * @param shopID 店铺ID
   * @param date 日期（YYYY-MM-DD 格式）
   * @param shopName 店铺名称（用于日志记录）
   * @param customCategory 自定义分类筛选值（可选）
   * @returns 指定日期的广告占比数据
   */
  async getAdRatioByDate(
    shopID: string,
    date: string,
    shopName?: string,
    customCategory?: string,
  ): Promise<{
    stages: {
      product_stage?: {
        spend: number;
        sales: number;
        roi: number;
      };
      testing_stage?: {
        spend: number;
        sales: number;
        roi: number;
      };
      potential_stage?: {
        spend: number;
        sales: number;
        roi: number;
      };
      abandoned_stage?: {
        spend: number;
        sales: number;
        roi: number;
      };
      no_stage?: {
        spend: number;
        sales: number;
        roi: number;
      };
    };
  }> {
    console.log('=== getAdRatioByDate 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的日期:', date);
    if (shopName) {
      console.log('接收到的店铺名称:', shopName);
    }
    if (customCategory) {
      console.log('接收到的自定义分类:', customCategory);
    }

    // 验证日期格式
    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    console.log('解析后的日期:', dateStr);

    // 1. 如果提供了自定义分类，先查询符合条件的商品ID
    let filteredProductIds: string[] | null = null;
    if (customCategory && customCategory.trim()) {
      console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
      const trimmedCategory = customCategory.trim();
      const products = await this.mysqlService.query<{
        product_id: string;
      }>(
        `SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`,
        [shopID, trimmedCategory, trimmedCategory, trimmedCategory, trimmedCategory],
      );
      filteredProductIds = products.map((p) => p.product_id);
      console.log(`符合自定义分类的商品数量: ${filteredProductIds.length}`);
    }

    // 2. 查询指定日期的广告数据
    console.log('\n--- 第二步：查询指定日期的广告数据 ---');
    let adStatsQuery = `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ?`;
    const queryParams: Array<string | string[]> = [shopID, dateStr];

    if (filteredProductIds !== null && filteredProductIds.length > 0) {
      adStatsQuery += ` AND product_id IN (${filteredProductIds.map(() => '?').join(',')})`;
      queryParams.push(...filteredProductIds);
    } else if (filteredProductIds !== null && filteredProductIds.length === 0) {
      // 如果自定义分类筛选后没有符合条件的商品，返回空数据
      console.log('⚠️ 自定义分类筛选后没有符合条件的商品，返回空数据');
      return {
        stages: {
          product_stage: { spend: 0, sales: 0, roi: 0 },
          testing_stage: { spend: 0, sales: 0, roi: 0 },
          potential_stage: { spend: 0, sales: 0, roi: 0 },
          abandoned_stage: { spend: 0, sales: 0, roi: 0 },
          no_stage: { spend: 0, sales: 0, roi: 0 },
        },
      };
    }

    adStatsQuery += ' ORDER BY product_id ASC';

    const adStats = await this.mysqlService.query<{
      product_id: string;
      spend: number | null;
      sales_amount: number | null;
    }>(adStatsQuery, queryParams);

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    // 初始化各阶段数据
    const stageData = {
      product_stage: { spend: 0, sales: 0, roi: 0 },
      testing_stage: { spend: 0, sales: 0, roi: 0 },
      potential_stage: { spend: 0, sales: 0, roi: 0 },
      abandoned_stage: { spend: 0, sales: 0, roi: 0 },
      no_stage: { spend: 0, sales: 0, roi: 0 },
    };

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数据');
      console.log('=== getAdRatioByDate 函数执行完成（无数据）===\n');
      return {
        stages: stageData,
      };
    }

    // 3. 对每条广告数据，判断商品阶段并累加花费和销售额
    console.log('\n--- 第三步：判断商品阶段并统计花费和销售额 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    for (const ad of adStats) {
      const spend = Number(ad.spend) || 0;
      const sales = Number(ad.sales_amount) || 0;

      const stage = await this.getProductStageByDate(
        ad.product_id,
        shopID,
        targetDate,
      );

      console.log(
        `商品 ${ad.product_id}: 阶段=${stage || '无'}, 花费=${spend}, 销售额=${sales}`,
      );

      if (stage === 'testing') {
        stageData.testing_stage.spend += spend;
        stageData.testing_stage.sales += sales;
      } else if (stage === 'potential') {
        stageData.potential_stage.spend += spend;
        stageData.potential_stage.sales += sales;
      } else if (stage === 'product') {
        stageData.product_stage.spend += spend;
        stageData.product_stage.sales += sales;
      } else if (stage === 'abandoned') {
        stageData.abandoned_stage.spend += spend;
        stageData.abandoned_stage.sales += sales;
      } else {
        stageData.no_stage.spend += spend;
        stageData.no_stage.sales += sales;
      }
    }

    // 4. 计算各阶段的ROI：ROI = 销售额 / 广告消耗
    console.log('\n--- 第四步：计算各阶段的ROI ---');
    const stages = ['product_stage', 'testing_stage', 'potential_stage', 'abandoned_stage', 'no_stage'] as const;
    for (const stageKey of stages) {
      const stage = stageData[stageKey];
      if (stage.spend > 0) {
        stage.roi = stage.sales / stage.spend;
      } else {
        stage.roi = 0;
      }
      // 保留2位小数
      stage.spend = Math.round(stage.spend * 100) / 100;
      stage.sales = Math.round(stage.sales * 100) / 100;
      stage.roi = Math.round(stage.roi * 100) / 100;
    }

    // 5. 构建返回结果（只返回有数据的阶段）
    const result: {
      stages: {
        product_stage?: { spend: number; sales: number; roi: number };
        testing_stage?: { spend: number; sales: number; roi: number };
        potential_stage?: { spend: number; sales: number; roi: number };
        abandoned_stage?: { spend: number; sales: number; roi: number };
        no_stage?: { spend: number; sales: number; roi: number };
      };
    } = {
      stages: {},
    };

    // 即使数据为0，也返回所有阶段（根据需求文档）
    result.stages = {
      product_stage: stageData.product_stage,
      testing_stage: stageData.testing_stage,
      potential_stage: stageData.potential_stage,
      abandoned_stage: stageData.abandoned_stage,
      no_stage: stageData.no_stage,
    };

    console.log('\n=== getAdRatioByDate 函数执行完成 ===');
    console.log('最终返回结果:', result);
    console.log('==========================================\n');

    return result;
  }

  /**
   * 获取指定日期、指定阶段、指定店铺的商品列表
   * 只返回有广告花费的商品
   * @param shopID 店铺ID
   * @param date 日期（YYYY-MM-DD 格式）
   * @param stage 阶段标识：product_stage, testing_stage, potential_stage, abandoned_stage, no_stage
   * @param shopName 店铺名称（可选，用于日志记录）
   * @returns 商品列表，包含商品ID、标题、主图、广告花费、广告销售额、ROI等信息
   */
  async getStageProducts(
    shopID: string,
    date: string,
    stage: string,
    shopName?: string,
    customCategory?: string,
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'ad_spend',
    sortOrder: string = 'desc',
  ): Promise<{
    items: Array<{
      product_id: string;
      title: string;
      main_image: string;
      ad_spend: number;
      ad_sales: number;
      roi: number;
    }>;
    total: number;
    page: number;
    pageSize: number;
  }> {
    console.log('=== getStageProducts 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的日期:', date);
    console.log('接收到的阶段:', stage);
    if (shopName) {
      console.log('接收到的店铺名称:', shopName);
    }
    if (customCategory) {
      console.log('接收到的自定义分类:', customCategory);
    }
    console.log('接收到的分页参数: page=', page, ', pageSize=', pageSize);
    console.log('接收到的排序参数: sortBy=', sortBy, ', sortOrder=', sortOrder);

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    console.log('解析后的日期:', dateStr);

    // 验证阶段参数
    const validStages = [
      'product_stage',
      'testing_stage',
      'potential_stage',
      'abandoned_stage',
      'no_stage',
    ];
    if (!validStages.includes(stage)) {
      throw new Error(
        `阶段参数无效：${stage}，应为 product_stage, testing_stage, potential_stage, abandoned_stage, no_stage 之一`,
      );
    }

    // 验证和规范化分页参数
    const validPageSizes = [10, 20, 50, 100];
    if (!validPageSizes.includes(pageSize)) {
      console.log(`⚠️ pageSize ${pageSize} 不合法，使用默认值 20`);
      pageSize = 20;
    }
    if (page < 1) {
      console.log(`⚠️ page ${page} 小于1，使用默认值 1`);
      page = 1;
    }

    // 验证和规范化排序参数
    const validSortBy = ['ad_spend', 'ad_sales', 'roi'];
    if (!validSortBy.includes(sortBy)) {
      console.log(`⚠️ sortBy ${sortBy} 不合法，使用默认值 ad_spend`);
      sortBy = 'ad_spend';
    }
    const validSortOrder = ['asc', 'desc'];
    if (!validSortOrder.includes(sortOrder)) {
      console.log(`⚠️ sortOrder ${sortOrder} 不合法，使用默认值 desc`);
      sortOrder = 'desc';
    }

    // 1. 如果提供了自定义分类，先查询符合自定义分类的商品ID
    let filteredProductIds: string[] | null = null;
    if (customCategory && customCategory.trim()) {
      console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
      const trimmedCategory = customCategory.trim();
      const products = await this.mysqlService.query<{
        product_id: string;
      }>(
        `SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`,
        [
          shopID,
          trimmedCategory,
          trimmedCategory,
          trimmedCategory,
          trimmedCategory,
        ],
      );
      filteredProductIds = products.map((p) => p.product_id);
      console.log(`符合自定义分类的商品数量: ${filteredProductIds.length}`);
      if (filteredProductIds.length === 0) {
        console.log('⚠️ 未找到符合自定义分类的商品，返回空结果');
        return {
          items: [],
          total: 0,
          page,
          pageSize,
        };
      }
    }

    // 2. 查询指定日期、指定店铺的广告数据（只查询有花费的数据）
    console.log('\n--- 第二步：查询指定日期的广告数据 ---');
    let adStatsQuery = `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ? AND COALESCE(spend, 0) > 0`;
    const adStatsParams: Array<string | string[]> = [shopID, dateStr];

    if (filteredProductIds !== null && filteredProductIds.length > 0) {
      adStatsQuery += ` AND product_id IN (${filteredProductIds
        .map(() => '?')
        .join(',')})`;
      adStatsParams.push(...filteredProductIds);
    }

    adStatsQuery += ' ORDER BY product_id ASC';

    const adStats = await this.mysqlService.query<{
      product_id: string;
      spend: number | null;
      sales_amount: number | null;
    }>(adStatsQuery, adStatsParams);

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空结果');
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }

    // 3. 对每条广告数据，判断商品阶段并筛选出符合指定阶段的商品
    console.log('\n--- 第三步：判断商品阶段并筛选符合条件的商品 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    const stageMap = new Map<
      string,
      {
        product_id: string;
        ad_spend: number;
        ad_sales: number;
      }
    >();

    // 阶段映射：将接口参数映射到内部阶段标识
    const stageMapping: Record<
      string,
      'testing' | 'potential' | 'product' | 'abandoned' | null
    > = {
      testing_stage: 'testing',
      potential_stage: 'potential',
      product_stage: 'product',
      abandoned_stage: 'abandoned',
      no_stage: null,
    };

    const targetStage = stageMapping[stage];

    for (const ad of adStats) {
      const spend = Number(ad.spend) || 0;
      const sales = Number(ad.sales_amount) || 0;

      if (spend <= 0) continue; // 跳过花费为0的数据（理论上不应该出现，因为SQL已过滤）

      const productStage = await this.getProductStageByDate(
        ad.product_id,
        shopID,
        targetDate,
      );

      // 判断是否符合指定阶段
      if (stage === 'no_stage') {
        // no_stage：商品没有阶段（返回 null）
        if (productStage !== null) {
          continue; // 不符合条件，跳过
        }
      } else {
        // 其他阶段：商品阶段必须匹配
        if (productStage !== targetStage) {
          continue; // 不符合条件，跳过
        }
      }

      // 累加同一商品的花费和销售额（如果同一天有多个广告记录）
      const existing = stageMap.get(ad.product_id);
      if (existing) {
        existing.ad_spend += spend;
        existing.ad_sales += sales;
      } else {
        stageMap.set(ad.product_id, {
          product_id: ad.product_id,
          ad_spend: spend,
          ad_sales: sales,
        });
      }
    }

    console.log(`筛选后符合条件的商品数量: ${stageMap.size}`);

    if (stageMap.size === 0) {
      console.log('⚠️ 未找到符合条件的商品，返回空结果');
      return {
        items: [],
        total: 0,
        page,
        pageSize,
      };
    }

    // 4. 查询商品基本信息（product_id, product_name, product_image）
    console.log('\n--- 第四步：查询商品基本信息 ---');
    const productIds = Array.from(stageMap.keys());
    console.log(`需要查询的商品ID数量: ${productIds.length}`);

    const products = await this.mysqlService.query<{
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
        AND product_id IN (${productIds.map(() => '?').join(',')})
        AND (status IS NULL OR status = 0)
      ORDER BY product_id ASC`,
      [shopID, ...productIds],
    );

    console.log(`查询到的商品信息条数: ${products?.length || 0}`);

    // 5. 合并数据并计算 ROI
    console.log('\n--- 第五步：合并数据并计算 ROI ---');
    const result: Array<{
      product_id: string;
      title: string;
      main_image: string;
      ad_spend: number;
      ad_sales: number;
      roi: number;
    }> = [];

    for (const product of products || []) {
      const adData = stageMap.get(product.product_id);
      if (!adData) {
        continue; // 理论上不应该出现，但为了安全起见跳过
      }

      // 计算 ROI：ROI = 广告销售额 / 广告花费
      let roi = 0;
      if (adData.ad_spend > 0) {
        roi = adData.ad_sales / adData.ad_spend;
      }

      // 保留2位小数
      const adSpend = Math.round(adData.ad_spend * 100) / 100;
      const adSales = Math.round(adData.ad_sales * 100) / 100;
      roi = Math.round(roi * 100) / 100;

      result.push({
        product_id: product.product_id,
        title: product.product_name || '',
        main_image: product.product_image || '',
        ad_spend: adSpend,
        ad_sales: adSales,
        roi: roi,
      });
    }

    // 6. 排序
    console.log('\n--- 第六步：排序数据 ---');
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'ad_spend') {
        comparison = a.ad_spend - b.ad_spend;
      } else if (sortBy === 'ad_sales') {
        comparison = a.ad_sales - b.ad_sales;
      } else if (sortBy === 'roi') {
        comparison = a.roi - b.roi;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 7. 分页
    console.log('\n--- 第七步：分页处理 ---');
    const total = result.length;
    const offset = (page - 1) * pageSize;
    const paginatedItems = result.slice(offset, offset + pageSize);

    console.log(`总记录数: ${total}`);
    console.log(`当前页: ${page}, 每页数量: ${pageSize}`);
    console.log(`返回记录数: ${paginatedItems.length}`);
    if (paginatedItems.length > 0) {
      console.log('前3个商品示例:');
      paginatedItems.slice(0, 3).forEach((item) => {
        console.log(
          `  ${item.product_id}: ${item.title}, 花费=${item.ad_spend}, 销售额=${item.ad_sales}, ROI=${item.roi}`,
        );
      });
    }

    console.log('\n=== getStageProducts 函数执行完成 ===');
    console.log('==========================================\n');

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
    };
  }
}

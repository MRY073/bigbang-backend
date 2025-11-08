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
      product_stage_roi: number; // 成品阶段 ROI
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

    // 1. 查询近30天的广告数据（包含花费和销售额）
    console.log('\n--- 第一步：查询近30天的广告数据 ---');
    const adStats = await this.mysqlService.query<{
      product_id: string;
      date: Date;
      spend: number | null;
      sales_amount: number | null;
    }>(
      `SELECT 
        product_id,
        date,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC, product_id ASC`,
      [shopID, startDateStr, endDateStr],
    );

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    // 2. 生成30天的日期列表
    const dateMap = new Map<
      string,
      {
        testing_stage_spend: number;
        potential_stage_spend: number;
        product_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_sales: number; // 成品阶段销售额（用于计算ROI）
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
        product_stage_sales: 0,
      });
    }

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数组');
      // 返回30天的空数据（包含 product_stage_roi = 0）
      const emptyData: Array<{
        date: string;
        testing_stage_spend: number;
        potential_stage_spend: number;
        product_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_roi: number;
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
          product_stage_roi: 0,
        });
      }
      return emptyData;
    }

    // 3. 对每条广告数据，判断商品阶段并累加花费和销售额
    console.log('\n--- 第二步：判断商品阶段并统计花费和销售额 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

    for (const ad of adStats) {
      const dateStr =
        ad.date instanceof Date
          ? ad.date.toISOString().split('T')[0]
          : new Date(ad.date).toISOString().split('T')[0];
      const spend = Number(ad.spend) || 0;
      const sales = Number(ad.sales_amount) || 0;

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
          dayData.product_stage_sales += sales; // 累加成品阶段销售额
        } else if (stage === 'abandoned') {
          dayData.abandoned_stage_spend += spend;
        } else {
          dayData.no_stage_spend += spend;
        }
      }
    }

    // 4. 计算每日成品阶段 ROI 并转换为数组格式
    const result = Array.from(dateMap.entries())
      .map(([date, data]) => {
        // 计算 ROI：销售额 / 广告消耗
        let productStageRoi = 0;
        if (data.product_stage_spend > 0) {
          productStageRoi = data.product_stage_sales / data.product_stage_spend;
        }
        // 保留2位小数
        productStageRoi = Math.round(productStageRoi * 100) / 100;

        return {
          date,
          testing_stage_spend: Math.round(data.testing_stage_spend * 100) / 100,
          potential_stage_spend:
            Math.round(data.potential_stage_spend * 100) / 100,
          product_stage_spend: Math.round(data.product_stage_spend * 100) / 100,
          abandoned_stage_spend:
            Math.round(data.abandoned_stage_spend * 100) / 100,
          no_stage_spend: Math.round(data.no_stage_spend * 100) / 100,
          product_stage_roi: productStageRoi,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    console.log('\n=== getAdTrend30Days 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 天的数据`);
    console.log('最终返回结果（前5天示例）:');
    result.slice(0, 5).forEach((item) => {
      console.log(
        `  ${item.date}: 测款=${item.testing_stage_spend}, 潜力=${item.potential_stage_spend}, 成品=${item.product_stage_spend}, 放弃=${item.abandoned_stage_spend}, 无阶段=${item.no_stage_spend}, ROI=${item.product_stage_roi}`,
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

    // 2. 对每条广告数据，判断商品阶段并累加花费和销售额
    console.log('\n--- 第二步：判断商品阶段并统计花费和销售额 ---');
    console.log(`开始处理 ${adStats.length} 条广告数据`);

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
        stageData.product_stage.sales_amount += sales;
      } else if (stage === 'abandoned') {
        stageData.abandoned_stage.spend += spend;
      } else {
        stageData.no_stage.spend += spend;
      }
    }

    // 3. 计算成品阶段的合计ROI：ROI = 销售额 / 广告消耗
    console.log('\n--- 第三步：计算成品阶段的合计ROI ---');
    if (stageData.product_stage.spend > 0) {
      stageData.product_stage.roi =
        stageData.product_stage.sales_amount / stageData.product_stage.spend;
    } else {
      stageData.product_stage.roi = 0;
    }

    // 4. 保留2位小数
    stageData.testing_stage.spend =
      Math.round(stageData.testing_stage.spend * 100) / 100;
    stageData.potential_stage.spend =
      Math.round(stageData.potential_stage.spend * 100) / 100;
    stageData.product_stage.spend =
      Math.round(stageData.product_stage.spend * 100) / 100;
    stageData.product_stage.sales_amount =
      Math.round(stageData.product_stage.sales_amount * 100) / 100;
    stageData.product_stage.roi =
      Math.round(stageData.product_stage.roi * 100) / 100;
    stageData.abandoned_stage.spend =
      Math.round(stageData.abandoned_stage.spend * 100) / 100;
    stageData.no_stage.spend = Math.round(stageData.no_stage.spend * 100) / 100;

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
  ): Promise<
    Array<{
      product_id: string;
      title: string;
      main_image: string;
      ad_spend: number;
      ad_sales: number;
      roi: number;
    }>
  > {
    console.log('=== getStageProducts 函数开始执行 ===');
    console.log('接收到的店铺ID:', shopID);
    console.log('接收到的日期:', date);
    console.log('接收到的阶段:', stage);
    if (shopName) {
      console.log('接收到的店铺名称:', shopName);
    }

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

    // 1. 查询指定日期、指定店铺的广告数据（只查询有花费的数据）
    console.log('\n--- 第一步：查询指定日期的广告数据 ---');
    const adStats = await this.mysqlService.query<{
      product_id: string;
      spend: number | null;
      sales_amount: number | null;
    }>(
      `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ? AND COALESCE(spend, 0) > 0
      ORDER BY product_id ASC`,
      [shopID, dateStr],
    );

    console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);

    if (!adStats || adStats.length === 0) {
      console.log('⚠️ 未找到广告数据，返回空数组');
      console.log('=== getStageProducts 函数执行完成（无数据）===\n');
      return [];
    }

    // 2. 对每条广告数据，判断商品阶段并筛选出符合指定阶段的商品
    console.log('\n--- 第二步：判断商品阶段并筛选符合条件的商品 ---');
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
      console.log('⚠️ 未找到符合条件的商品，返回空数组');
      console.log('=== getStageProducts 函数执行完成（无数据）===\n');
      return [];
    }

    // 3. 查询商品基本信息（product_id, product_name, product_image）
    console.log('\n--- 第三步：查询商品基本信息 ---');
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
      WHERE shop_id = ? AND product_id IN (${productIds.map(() => '?').join(',')})
      ORDER BY product_id ASC`,
      [shopID, ...productIds],
    );

    console.log(`查询到的商品信息条数: ${products?.length || 0}`);

    // 4. 合并数据并计算 ROI
    console.log('\n--- 第四步：合并数据并计算 ROI ---');
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

    // 5. 按广告花费降序排列
    result.sort((a, b) => b.ad_spend - a.ad_spend);

    console.log(`最终返回商品数量: ${result.length}`);
    if (result.length > 0) {
      console.log('前3个商品示例:');
      result.slice(0, 3).forEach((item) => {
        console.log(
          `  ${item.product_id}: ${item.title}, 花费=${item.ad_spend}, 销售额=${item.ad_sales}, ROI=${item.roi}`,
        );
      });
    }

    console.log('\n=== getStageProducts 函数执行完成 ===');
    console.log('==========================================\n');

    return result;
  }
}

import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';
import { calculateShortTermVolatilityVsLongTermBaseline } from '../utils/statistics';

// ==================== 预警等级阈值配置 ====================
// 变化指数阈值
const CHANGE_INDEX_THRESHOLDS = {
  极小: 10, // 0 ~ 10: 基本稳定，几乎无波动
  轻微: 30, // 10 ~ 30: 轻微波动，不影响判断
  一般: 60, // 30 ~ 60: 中等波动，值得关注
  明显: 80, // 60 ~ 80: 波动较大，需要关注趋势
  剧烈: 100, // 80 ~ 100: 波动非常大，风险高或异常明显
};

// 预警等级映射（基于变化指数）- 保留用于未来扩展
// const WARNING_LEVEL_MAP = {
//   极小: '正常',
//   轻微: '轻微',
//   一般: '一般',
//   明显: '严重',
//   剧烈: '严重',
// };

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
   * 计算变化指数
   * @param values 按日期排序的数值数组（从早到晚）
   * @returns 变化指数信息
   */
  private calculateChangeIndex(values: number[]): {
    direction: '+' | '-';
    strength: number;
    level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
  } {
    // 如果数据少于2个，无法计算变化
    if (values.length < 2) {
      return {
        direction: '+',
        strength: 0,
        level: '极小',
      };
    }

    // 过滤掉无效值（0或负数可能表示无数据）
    const validValues = values.filter((v) => v > 0);
    if (validValues.length < 2) {
      return {
        direction: '+',
        strength: 0,
        level: '极小',
      };
    }

    // 计算每日增幅 ri = (今天值 - 前一天值) / 前一天值
    const dailyRates: number[] = [];
    for (let i = 1; i < validValues.length; i++) {
      const prevValue = validValues[i - 1];
      const currValue = validValues[i];
      if (prevValue > 0) {
        const rate = (currValue - prevValue) / prevValue;
        dailyRates.push(rate);
      }
    }

    if (dailyRates.length === 0) {
      return {
        direction: '+',
        strength: 0,
        level: '极小',
      };
    }

    // 计算平均变化率（趋势方向）
    const meanRate =
      dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length;
    const direction: '+' | '-' = meanRate >= 0 ? '+' : '-';

    // 计算变化强度（波动剧烈程度）
    const maxRate = Math.max(...dailyRates);
    const minRate = Math.min(...dailyRates);
    const maxAmplitude = maxRate - minRate;
    const changeIndex = Math.min(maxAmplitude * 100, 100);

    // 确定变化等级
    let level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    if (changeIndex < CHANGE_INDEX_THRESHOLDS.极小) {
      level = '极小';
    } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.轻微) {
      level = '轻微';
    } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.一般) {
      level = '一般';
    } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.明显) {
      level = '明显';
    } else {
      level = '剧烈';
    }

    return {
      direction,
      strength: Math.round(changeIndex * 100) / 100, // 保留2位小数
      level,
    };
  }

  /**
   * 计算短期波动相对长期基准指标（使用60天数据）
   * @param values 按日期排序的数值数组（从早到晚）
   * @returns 每个滑动窗口的波动率信息数组
   */
  private calculateSlidingVolatility(values: number[]): Array<{
    window: number;
    direction: '+' | '-';
    strength: number;
    level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
  }> {
    const windows = [1, 3, 7, 15, 30]; // 滑动窗口天数
    const longWindow = 60; // 长期基准窗口（固定60天，数据不足时取最长可用数据）
    const result: Array<{
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    }> = [];

    // 过滤掉无效值（0或负数可能表示无数据）
    const validValues = values.filter((v) => v > 0);

    // 如果有效数据少于2个，所有窗口都返回默认值
    if (validValues.length < 2) {
      return windows.map((window) => ({
        window,
        direction: '+' as const,
        strength: 0,
        level: '极小' as const,
      }));
    }

    // 对每个滑动窗口计算波动率
    for (const shortWindow of windows) {
      // 确定实际使用的短期窗口
      const actualShortWindow = Math.min(shortWindow, validValues.length);

      // 如果短期窗口大于等于数据量，使用所有数据
      if (actualShortWindow >= validValues.length) {
        // 数据不足，返回默认值
        result.push({
          window: shortWindow,
          direction: '+' as const,
          strength: 0,
          level: '极小' as const,
        });
        continue;
      }

      // 确定长期窗口：固定60天，数据不足时取最长可用数据
      // 优先使用60天，如果数据不足60天，则使用所有可用数据
      let actualLongWindow: number;
      if (validValues.length >= longWindow) {
        // 数据足够，使用固定60天
        actualLongWindow = longWindow;
      } else {
        // 数据不足60天，使用所有可用数据作为长期基准
        actualLongWindow = validValues.length;
      }

      // 如果长期窗口小于等于短期窗口，无法计算比值，返回默认值
      if (actualLongWindow <= actualShortWindow) {
        result.push({
          window: shortWindow,
          direction: '+' as const,
          strength: 0,
          level: '极小' as const,
        });
        continue;
      }

      // 计算短期波动相对长期基准的比值
      const volatilityRatios = calculateShortTermVolatilityVsLongTermBaseline(
        validValues,
        actualShortWindow,
        actualLongWindow,
        true, // 使用样本标准差
      );

      // 获取最后一个比值（最新时间点的比值）
      const lastRatio = volatilityRatios[volatilityRatios.length - 1];

      // 如果比值为 null，返回默认值
      if (lastRatio === null) {
        result.push({
          window: shortWindow,
          direction: '+' as const,
          strength: 0,
          level: '极小' as const,
        });
        continue;
      }

      // 计算方向：通过比较短期均值和长期均值来判断
      const shortMean =
        validValues
          .slice(validValues.length - actualShortWindow)
          .reduce((sum, val) => sum + val, 0) / actualShortWindow;
      const longMean =
        validValues
          .slice(validValues.length - actualLongWindow)
          .reduce((sum, val) => sum + val, 0) / actualLongWindow;

      // 方向：短期均值相对于长期均值的变化
      const direction: '+' | '-' = shortMean >= longMean ? '+' : '-';

      // 计算强度：基于波动率比值
      // 比值 > 1 表示短期波动大于长期波动（异常波动）
      // 比值 < 1 表示短期波动小于长期波动（相对稳定）
      // 将比值映射到 0~100 范围
      // 公式：strength = min((ratio - 1) * 50 + 50, 100)，但需要处理 ratio < 1 的情况
      // 更合理的映射：ratio 在 0~2 之间，映射到 0~100
      // 当 ratio = 1 时，strength = 50（中等）
      // 当 ratio = 2 时，strength = 100（剧烈）
      // 当 ratio = 0 时，strength = 0（极小）
      let strength: number;
      if (lastRatio <= 0) {
        strength = 0;
      } else if (lastRatio >= 2) {
        strength = 100;
      } else {
        // 线性映射：ratio 0~2 映射到 strength 0~100
        // 当 ratio = 1 时，strength = 50
        strength = Math.min((lastRatio / 2) * 100, 100);
      }

      // 如果比值接近1（0.8-1.2），表示波动正常，降低强度
      if (lastRatio >= 0.8 && lastRatio <= 1.2) {
        strength = Math.max(0, strength - 20); // 降低20点
      }

      // 确定变化等级
      let level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
      if (strength < CHANGE_INDEX_THRESHOLDS.极小) {
        level = '极小';
      } else if (strength < CHANGE_INDEX_THRESHOLDS.轻微) {
        level = '轻微';
      } else if (strength < CHANGE_INDEX_THRESHOLDS.一般) {
        level = '一般';
      } else if (strength < CHANGE_INDEX_THRESHOLDS.明显) {
        level = '明显';
      } else {
        level = '剧烈';
      }

      result.push({
        window: shortWindow,
        direction,
        strength: Math.round(strength * 100) / 100, // 保留2位小数
        level,
      });
    }

    return result;
  }

  /**
   * 生成警告提示语
   * @param metricName 指标名称
   * @param changeIndex 变化指数信息
   * @returns 警告提示语
   */
  private generateWarningMessage(
    metricName: string,
    changeIndex: {
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
  ): string {
    const { direction, strength, level } = changeIndex;
    const directionText = direction === '+' ? '上升' : '下降';
    const levelText = {
      极小: '基本稳定',
      轻微: '轻微波动',
      一般: '中等波动',
      明显: '波动较大',
      剧烈: '波动剧烈',
    }[level];

    if (level === '极小' || level === '轻微') {
      return `${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%`;
    } else if (level === '一般') {
      return `⚠️ ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，值得关注`;
    } else if (level === '明显') {
      return `🔶 ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，需要关注趋势变化`;
    } else {
      return `🔴 ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，风险较高，建议及时处理`;
    }
  }

  /**
   * 查询店铺商品列表
   * @param shopID 店铺ID
   * @param shopName 店铺名称
   * @returns 商品列表，包含产品ID、产品名称、产品主图、四个阶段的时间段
   */
  async getProductsByShop(
    shopID: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shopName: string, // 保留参数以兼容现有接口，暂未使用
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
      visitorsVolatilityBaseline: Array<{
        window: number;
        direction: '+' | '-';
        strength: number;
        level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
      }>;
      adCostAvg: number[];
      adCostVolatilityBaseline: Array<{
        window: number;
        direction: '+' | '-';
        strength: number;
        level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
      }>;
      salesAvg: number[];
      salesVolatilityBaseline: Array<{
        window: number;
        direction: '+' | '-';
        strength: number;
        level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
      }>;
      warningLevel: '严重' | '一般' | '轻微' | '正常';
      warningMessages: string[];
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
        const adCostAvg: number[] = [];
        const salesAvg: number[] = [];

        // 查询60天的完整数据用于计算短期波动相对长期基准指标（长期基准为60天）
        const endDate60 = new Date(currentDate);
        const startDate60 = new Date(currentDate);
        startDate60.setDate(endDate60.getDate() - 59); // 60天数据
        const startDate60Str = startDate60.toISOString().split('T')[0];
        const endDate60Str = endDate60.toISOString().split('T')[0];

        // 查询60天的访客数原始数据
        const visitorsData60 = await this.mysqlService.query<{
          visitors: number | null;
        }>(
          `SELECT visitors
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`,
          [shopID, product_id, startDate60Str, endDate60Str],
        );
        const visitorsValues60 = visitorsData60
          .map((row) => row.visitors)
          .filter((value) => value !== null && value !== undefined)
          .map((value) => Number(value) || 0);

        // 查询60天的广告花费原始数据
        const adCostData60 = await this.mysqlService.query<{
          spend: number | null;
        }>(
          `SELECT spend
          FROM ad_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`,
          [shopID, product_id, startDate60Str, endDate60Str],
        );
        const adCostValues60 = adCostData60
          .map((row) => row.spend)
          .filter((value) => value !== null && value !== undefined)
          .map((value) => Number(value) || 0);

        // 查询60天的销售额原始数据
        const salesData60 = await this.mysqlService.query<{
          confirmed_sales: number | null;
        }>(
          `SELECT confirmed_sales
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`,
          [shopID, product_id, startDate60Str, endDate60Str],
        );
        const salesValues60 = salesData60
          .map((row) => row.confirmed_sales)
          .filter((value) => value !== null && value !== undefined)
          .map((value) => Number(value) || 0);

        // 计算短期波动相对长期基准指标（使用60天数据）
        const visitorsVolatilityBaseline =
          this.calculateSlidingVolatility(visitorsValues60);
        const adCostVolatilityBaseline =
          this.calculateSlidingVolatility(adCostValues60);
        const salesVolatilityBaseline =
          this.calculateSlidingVolatility(salesValues60);

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
            // 查询访客数原始数据（从 daily_product_stats 表）
            const visitorsData = await this.mysqlService.query<{
              visitors: number | null;
            }>(
              `SELECT visitors
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`,
              [shopID, product_id, startDateStr, endDateStr],
            );

            const visitorsValues = visitorsData
              .map((row) => row.visitors)
              .filter((value) => value !== null && value !== undefined)
              .map((value) => Number(value) || 0);

            let visitorsAvgValue = 0;
            if (visitorsValues.length > 0) {
              const sum = visitorsValues.reduce((acc, val) => acc + val, 0);
              visitorsAvgValue = sum / visitorsValues.length;
            }

            visitorsAvg.push(visitorsAvgValue);

            // 查询广告花费原始数据（从 ad_stats 表）
            const adCostData = await this.mysqlService.query<{
              spend: number | null;
            }>(
              `SELECT spend
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`,
              [shopID, product_id, startDateStr, endDateStr],
            );

            const adCostValues = adCostData
              .map((row) => row.spend)
              .filter((value) => value !== null && value !== undefined)
              .map((value) => Number(value) || 0);

            let adCostAvgValue = 0;
            if (adCostValues.length > 0) {
              const sum = adCostValues.reduce((acc, val) => acc + val, 0);
              adCostAvgValue = sum / adCostValues.length;
            }

            adCostAvg.push(adCostAvgValue);

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

            const salesValues = salesData
              .map((row) => row.confirmed_sales)
              .filter((value) => value !== null && value !== undefined)
              .map((value) => Number(value) || 0);

            let salesAvgValue = 0;
            if (salesValues.length > 0) {
              const sum = salesValues.reduce((acc, val) => acc + val, 0);
              salesAvgValue = sum / salesValues.length;
            }

            salesAvg.push(salesAvgValue);

            console.log(
              `    [${product_id}] ${days}天: 访客(avg=${visitorsAvgValue.toFixed(2)}), 广告花费(avg=${adCostAvgValue.toFixed(2)}), 销售额(avg=${salesAvgValue.toFixed(2)})`,
            );
          } catch (error) {
            console.warn(`    [${product_id}] 计算 ${days} 天数据失败:`, error);
            // 发生错误时，设置为默认值
            visitorsAvg.push(0);
            adCostAvg.push(0);
            salesAvg.push(0);
          }
        }

        // 3. 基于短期波动相对长期基准指标计算预警等级和生成警告信息
        // TODO: 警告提示语和警告等级功能暂时禁用，后期需要加上
        // 使用1天和3天窗口的波动率来判断预警等级
        // const visitors1DayVolatility = visitorsVolatilityBaseline.find(
        //   (v) => v.window === 1,
        // );
        // const visitors3DayVolatility = visitorsVolatilityBaseline.find(
        //   (v) => v.window === 3,
        // );
        // const adCost1DayVolatility = adCostVolatilityBaseline.find(
        //   (v) => v.window === 1,
        // );
        // const adCost3DayVolatility = adCostVolatilityBaseline.find(
        //   (v) => v.window === 3,
        // );
        // const sales1DayVolatility = salesVolatilityBaseline.find(
        //   (v) => v.window === 1,
        // );
        // const sales3DayVolatility = salesVolatilityBaseline.find(
        //   (v) => v.window === 3,
        // );

        // 计算预警等级（基于波动率）
        // const warningLevel = this.calculateWarningLevelFromVolatility(
        //   visitors1DayVolatility,
        //   visitors3DayVolatility,
        //   adCost1DayVolatility,
        //   adCost3DayVolatility,
        //   sales1DayVolatility,
        //   sales3DayVolatility,
        // );

        // 生成警告提示语
        // const warningMessages: string[] = [];

        // 检查1天窗口的波动率，生成警告信息
        // if (
        //   visitors1DayVolatility &&
        //   (visitors1DayVolatility.level === '明显' ||
        //     visitors1DayVolatility.level === '剧烈')
        // ) {
        //   warningMessages.push(
        //     this.generateWarningMessage('访客数', visitors1DayVolatility),
        //   );
        // }
        // if (
        //   adCost1DayVolatility &&
        //   (adCost1DayVolatility.level === '明显' ||
        //     adCost1DayVolatility.level === '剧烈')
        // ) {
        //   warningMessages.push(
        //     this.generateWarningMessage('广告花费', adCost1DayVolatility),
        //   );
        // }
        // if (
        //   sales1DayVolatility &&
        //   (sales1DayVolatility.level === '明显' ||
        //     sales1DayVolatility.level === '剧烈')
        // ) {
        //   warningMessages.push(
        //     this.generateWarningMessage('销售额', sales1DayVolatility),
        //   );
        // }

        // 如果1天窗口没有明显波动，检查3天窗口
        // if (warningMessages.length === 0) {
        //   if (
        //     visitors3DayVolatility &&
        //     (visitors3DayVolatility.level === '一般' ||
        //       visitors3DayVolatility.level === '明显' ||
        //       visitors3DayVolatility.level === '剧烈')
        //   ) {
        //     warningMessages.push(
        //       this.generateWarningMessage('访客数', visitors3DayVolatility),
        //     );
        //   }
        //   if (
        //     adCost3DayVolatility &&
        //     (adCost3DayVolatility.level === '一般' ||
        //       adCost3DayVolatility.level === '明显' ||
        //       adCost3DayVolatility.level === '剧烈')
        //   ) {
        //     warningMessages.push(
        //       this.generateWarningMessage('广告花费', adCost3DayVolatility),
        //     );
        //   }
        //   if (
        //     sales3DayVolatility &&
        //     (sales3DayVolatility.level === '一般' ||
        //       sales3DayVolatility.level === '明显' ||
        //       sales3DayVolatility.level === '剧烈')
        //   ) {
        //     warningMessages.push(
        //       this.generateWarningMessage('销售额', sales3DayVolatility),
        //     );
        //   }
        // }

        // 暂时固定设置为空和轻微
        const warningLevel: '严重' | '一般' | '轻微' | '正常' = '轻微';
        const warningMessages: string[] = [];

        console.log(`  [${product_id}] 预警等级: ${warningLevel}`);
        if (warningMessages.length > 0) {
          console.log(`  [${product_id}] 警告信息:`, warningMessages);
        }

        return {
          id: product_id,
          name: product_name,
          image: product_image,
          visitorsAvg,
          visitorsVolatilityBaseline,
          adCostAvg,
          adCostVolatilityBaseline,
          salesAvg,
          salesVolatilityBaseline,
          warningLevel,
          warningMessages,
        };
      }),
    );

    // 按照销售额从大到小排序（使用30天平均值作为排序依据）
    result.sort((a, b) => {
      const salesA = a.salesAvg[0] || 0; // 30天销售额平均值
      const salesB = b.salesAvg[0] || 0; // 30天销售额平均值
      return salesB - salesA; // 从大到小排序
    });

    console.log('\n=== getFinishedLinkMonitorData 函数执行完成 ===');
    console.log(`总共处理了 ${result.length} 个商品`);
    console.log('==========================================\n');

    return result;
  }

  /**
   * 基于滑动窗口波动率计算预警等级
   * @param visitors1Day 访客数1天窗口波动率
   * @param visitors3Day 访客数3天窗口波动率
   * @param adCost1Day 广告花费1天窗口波动率
   * @param adCost3Day 广告花费3天窗口波动率
   * @param sales1Day 销售额1天窗口波动率
   * @param sales3Day 销售额3天窗口波动率
   * @returns 预警等级
   */
  private calculateWarningLevelFromVolatility(
    visitors1Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
    visitors3Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
    adCost1Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
    adCost3Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
    sales1Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
    sales3Day?: {
      window: number;
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    },
  ): '严重' | '一般' | '轻微' | '正常' {
    // 将变化等级转换为数值分数（用于加权计算）
    const levelToScore = (
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈',
    ): number => {
      switch (level) {
        case '极小':
          return 0;
        case '轻微':
          return 0.2;
        case '一般':
          return 0.5;
        case '明显':
          return 0.8;
        case '剧烈':
          return 1.0;
        default:
          return 0;
      }
    };

    // 1日的变化指数分数
    const scoreVisitors1Day = visitors1Day
      ? levelToScore(visitors1Day.level)
      : 0;
    const scoreAdCost1Day = adCost1Day ? levelToScore(adCost1Day.level) : 0;
    const scoreSales1Day = sales1Day ? levelToScore(sales1Day.level) : 0;

    // 3日的变化指数分数
    const scoreVisitors3Day = visitors3Day
      ? levelToScore(visitors3Day.level)
      : 0;
    const scoreAdCost3Day = adCost3Day ? levelToScore(adCost3Day.level) : 0;
    const scoreSales3Day = sales3Day ? levelToScore(sales3Day.level) : 0;

    // 计算加权分数
    const score1Day =
      scoreVisitors1Day * METRIC_WEIGHTS.visitors +
      scoreAdCost1Day * METRIC_WEIGHTS.adCost +
      scoreSales1Day * METRIC_WEIGHTS.sales;

    const score3Day =
      scoreVisitors3Day * METRIC_WEIGHTS.visitors +
      scoreAdCost3Day * METRIC_WEIGHTS.adCost +
      scoreSales3Day * METRIC_WEIGHTS.sales;

    // 计算综合预警分数（1日权重0.6，3日权重0.4）
    const compositeScore = score1Day * 0.6 + score3Day * 0.4;

    // 根据综合分数判断预警等级
    if (compositeScore >= 0.8) {
      return '严重';
    } else if (compositeScore >= 0.5) {
      return '一般';
    } else if (compositeScore >= 0.2) {
      return '轻微';
    } else {
      return '正常';
    }
  }

  /**
   * 计算预警等级（保留旧方法，用于兼容）
   * @param visitorsChangeIndex 访客数变化指数数组 [30日, 15日, 7日, 3日, 1日]
   * @param adCostChangeIndex 广告花费变化指数数组 [30日, 15日, 7日, 3日, 1日]
   * @param salesChangeIndex 销售额变化指数数组 [30日, 15日, 7日, 3日, 1日]
   * @returns 预警等级
   */
  private calculateWarningLevel(
    visitorsChangeIndex: Array<{
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    }>,
    adCostChangeIndex: Array<{
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    }>,
    salesChangeIndex: Array<{
      direction: '+' | '-';
      strength: number;
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
    }>,
  ): '严重' | '一般' | '轻微' | '正常' {
    // 获取最近的时间维度（1日和3日）的索引
    // 数组顺序：[30日, 15日, 7日, 3日, 1日]
    // 索引：    [0,    1,    2,   3,   4]
    const index1Day = 4; // 1日的索引
    const index3Day = 3; // 3日的索引

    // 将变化等级转换为数值分数（用于加权计算）
    const levelToScore = (
      level: '极小' | '轻微' | '一般' | '明显' | '剧烈',
    ): number => {
      switch (level) {
        case '极小':
          return 0;
        case '轻微':
          return 0.2;
        case '一般':
          return 0.5;
        case '明显':
          return 0.8;
        case '剧烈':
          return 1.0;
        default:
          return 0;
      }
    };

    // 1日的变化指数分数
    const scoreVisitors1Day = levelToScore(
      visitorsChangeIndex[index1Day].level,
    );
    const scoreAdCost1Day = levelToScore(adCostChangeIndex[index1Day].level);
    const scoreSales1Day = levelToScore(salesChangeIndex[index1Day].level);

    // 3日的变化指数分数
    const scoreVisitors3Day = levelToScore(
      visitorsChangeIndex[index3Day].level,
    );
    const scoreAdCost3Day = levelToScore(adCostChangeIndex[index3Day].level);
    const scoreSales3Day = levelToScore(salesChangeIndex[index3Day].level);

    // 计算加权分数
    const score1Day =
      scoreVisitors1Day * METRIC_WEIGHTS.visitors +
      scoreAdCost1Day * METRIC_WEIGHTS.adCost +
      scoreSales1Day * METRIC_WEIGHTS.sales;

    const score3Day =
      scoreVisitors3Day * METRIC_WEIGHTS.visitors +
      scoreAdCost3Day * METRIC_WEIGHTS.adCost +
      scoreSales3Day * METRIC_WEIGHTS.sales;

    // 计算综合预警分数（1日权重0.6，3日权重0.4）
    const compositeScore = score1Day * 0.6 + score3Day * 0.4;

    // 根据综合分数判断预警等级
    if (compositeScore >= 0.8) {
      return '严重';
    } else if (compositeScore >= 0.5) {
      return '一般';
    } else if (compositeScore >= 0.2) {
      return '轻微';
    } else {
      return '正常';
    }
  }
}

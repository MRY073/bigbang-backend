"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mysql_service_1 = require("../database/mysql.service");
const statistics_1 = require("../utils/statistics");
const CHANGE_INDEX_THRESHOLDS = {
    极小: 10,
    轻微: 30,
    一般: 60,
    明显: 80,
    剧烈: 100,
};
const METRIC_WEIGHTS = {
    visitors: 0.4,
    adCost: 0.3,
    sales: 0.3,
};
const WARNING_LEVEL_THRESHOLDS = {
    严重: 0.5,
    一般: 0.3,
    轻微: 0.15,
    正常: 0.0,
};
const METRIC_WEIGHTS_POTENTIAL = {
    visitors: 0.4,
    adCost: 0.3,
    sales: 0.3,
};
let ProductsService = class ProductsService {
    mysqlService;
    constructor(mysqlService) {
        this.mysqlService = mysqlService;
    }
    calculateChangeIndex(values) {
        if (values.length < 2) {
            return {
                direction: '+',
                strength: 0,
                level: '极小',
            };
        }
        const validValues = values.filter((v) => v > 0);
        if (validValues.length < 2) {
            return {
                direction: '+',
                strength: 0,
                level: '极小',
            };
        }
        const dailyRates = [];
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
        const meanRate = dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length;
        const direction = meanRate >= 0 ? '+' : '-';
        const maxRate = Math.max(...dailyRates);
        const minRate = Math.min(...dailyRates);
        const maxAmplitude = maxRate - minRate;
        const changeIndex = Math.min(maxAmplitude * 100, 100);
        let level;
        if (changeIndex < CHANGE_INDEX_THRESHOLDS.极小) {
            level = '极小';
        }
        else if (changeIndex < CHANGE_INDEX_THRESHOLDS.轻微) {
            level = '轻微';
        }
        else if (changeIndex < CHANGE_INDEX_THRESHOLDS.一般) {
            level = '一般';
        }
        else if (changeIndex < CHANGE_INDEX_THRESHOLDS.明显) {
            level = '明显';
        }
        else {
            level = '剧烈';
        }
        return {
            direction,
            strength: Math.round(changeIndex * 100) / 100,
            level,
        };
    }
    calculateSlidingVolatility(values) {
        const windows = [1, 3, 7, 15, 30];
        const longWindow = 60;
        const result = [];
        const validValues = values.filter((v) => v > 0);
        if (validValues.length < 2) {
            return windows.map((window) => ({
                window,
                direction: '+',
                strength: 0,
                level: '极小',
            }));
        }
        for (const shortWindow of windows) {
            const actualShortWindow = Math.min(shortWindow, validValues.length);
            if (actualShortWindow >= validValues.length) {
                result.push({
                    window: shortWindow,
                    direction: '+',
                    strength: 0,
                    level: '极小',
                });
                continue;
            }
            let actualLongWindow;
            if (validValues.length >= longWindow) {
                actualLongWindow = longWindow;
            }
            else {
                actualLongWindow = validValues.length;
            }
            if (actualLongWindow <= actualShortWindow) {
                result.push({
                    window: shortWindow,
                    direction: '+',
                    strength: 0,
                    level: '极小',
                });
                continue;
            }
            const volatilityRatios = (0, statistics_1.calculateShortTermVolatilityVsLongTermBaseline)(validValues, actualShortWindow, actualLongWindow, true);
            const lastRatio = volatilityRatios[volatilityRatios.length - 1];
            if (lastRatio === null) {
                result.push({
                    window: shortWindow,
                    direction: '+',
                    strength: 0,
                    level: '极小',
                });
                continue;
            }
            const shortMean = validValues
                .slice(validValues.length - actualShortWindow)
                .reduce((sum, val) => sum + val, 0) / actualShortWindow;
            const longMean = validValues
                .slice(validValues.length - actualLongWindow)
                .reduce((sum, val) => sum + val, 0) / actualLongWindow;
            const direction = shortMean >= longMean ? '+' : '-';
            let strength;
            if (lastRatio <= 0) {
                strength = 0;
            }
            else if (lastRatio >= 2) {
                strength = 100;
            }
            else {
                strength = Math.min((lastRatio / 2) * 100, 100);
            }
            if (lastRatio >= 0.8 && lastRatio <= 1.2) {
                strength = Math.max(0, strength - 20);
            }
            let level;
            if (strength < CHANGE_INDEX_THRESHOLDS.极小) {
                level = '极小';
            }
            else if (strength < CHANGE_INDEX_THRESHOLDS.轻微) {
                level = '轻微';
            }
            else if (strength < CHANGE_INDEX_THRESHOLDS.一般) {
                level = '一般';
            }
            else if (strength < CHANGE_INDEX_THRESHOLDS.明显) {
                level = '明显';
            }
            else {
                level = '剧烈';
            }
            result.push({
                window: shortWindow,
                direction,
                strength: Math.round(strength * 100) / 100,
                level,
            });
        }
        return result;
    }
    generateWarningMessage(metricName, changeIndex) {
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
        }
        else if (level === '一般') {
            return `⚠️ ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，值得关注`;
        }
        else if (level === '明显') {
            return `🔶 ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，需要关注趋势变化`;
        }
        else {
            return `🔴 ${metricName}${levelText}，趋势${directionText}，变化强度${strength.toFixed(2)}%，风险较高，建议及时处理`;
        }
    }
    async getProductsByShop(shopID, shopName, customCategory) {
        let whereClause = 'WHERE shop_id = ?';
        const queryParams = [shopID];
        if (customCategory && customCategory.trim()) {
            const trimmedCategory = customCategory.trim();
            whereClause += ` AND (
        (custom_category_1 IS NOT NULL AND LOWER(custom_category_1) LIKE ?) OR
        (custom_category_2 IS NOT NULL AND LOWER(custom_category_2) LIKE ?) OR
        (custom_category_3 IS NOT NULL AND LOWER(custom_category_3) LIKE ?) OR
        (custom_category_4 IS NOT NULL AND LOWER(custom_category_4) LIKE ?)
      )`;
            const categoryPattern = `%${trimmedCategory.toLowerCase()}%`;
            queryParams.push(categoryPattern, categoryPattern, categoryPattern, categoryPattern);
        }
        const products = await this.mysqlService.query(`SELECT 
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
        abandoned_stage_end,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4,
        prompt_note,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      ${whereClause}
        AND (status IS NULL OR status = 0)
      ORDER BY id ASC`, queryParams);
        return products.map((product) => {
            const processCategory = (value) => {
                if (value === null || value === undefined) {
                    return null;
                }
                const trimmed = value.trim();
                return trimmed === '' ? null : trimmed;
            };
            return {
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
                custom_category_1: processCategory(product.custom_category_1),
                custom_category_2: processCategory(product.custom_category_2),
                custom_category_3: processCategory(product.custom_category_3),
                custom_category_4: processCategory(product.custom_category_4),
                prompt_note: product.prompt_note,
                competitor_link: product.competitor_link,
                competitor_daily_sales: product.competitor_daily_sales,
            };
        });
    }
    async updateProductStage(productId, shopID, shopName, stageType, startTime, endTime) {
        const existing = await this.mysqlService.queryOne('SELECT id FROM product_items WHERE shop_id = ? AND product_id = ?', [shopID, productId]);
        if (!existing) {
            throw new Error(`商品不存在：shop_id=${shopID}, product_id=${productId}`);
        }
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
        const updateData = {};
        if (startTime === null || startTime === undefined || startTime === '') {
            updateData[fields.start] = null;
        }
        else {
            const startDate = new Date(startTime);
            if (isNaN(startDate.getTime())) {
                throw new Error(`开始时间格式错误：${startTime}`);
            }
            updateData[fields.start] = startDate;
        }
        if (endTime === null || endTime === undefined || endTime === '') {
            updateData[fields.end] = null;
        }
        else {
            const endDate = new Date(endTime);
            if (isNaN(endDate.getTime())) {
                throw new Error(`结束时间格式错误：${endTime}`);
            }
            updateData[fields.end] = endDate;
        }
        await this.mysqlService.update('product_items', updateData, {
            shop_id: shopID,
            product_id: productId,
        });
        return {
            success: true,
            message: `成功更新商品阶段时间段：${stageType}`,
        };
    }
    async getTestingMonitorData(shopID, shopName) {
        console.log('=== getTestingMonitorData 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的店铺名称:', shopName);
        const currentDate = new Date();
        console.log('当前时间:', currentDate.toISOString());
        console.log('\n--- 第一步：查询当前处于测款阶段的商品 ---');
        console.log('查询条件:');
        console.log('  - shop_id =', shopID);
        console.log('  - testing_stage_start IS NOT NULL');
        console.log('  - testing_stage_start <=', currentDate.toISOString());
        console.log('  - (testing_stage_end IS NULL OR testing_stage_end >=', currentDate.toISOString(), ')');
        const testingProducts = await this.mysqlService.query(`SELECT 
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
        AND (status IS NULL OR status = 0)
      ORDER BY id ASC`, [shopID, currentDate, currentDate]);
        console.log('查询到的测款商品数量:', testingProducts?.length || 0);
        if (testingProducts && testingProducts.length > 0) {
            console.log('测款商品列表:');
            testingProducts.forEach((p, index) => {
                console.log(`  ${index + 1}. product_id: ${p.product_id}, product_name: ${p.product_name}`);
                console.log(`     测款开始时间: ${String(p.testing_stage_start)}, 测款结束时间: ${p.testing_stage_end ? String(p.testing_stage_end) : '未设置'}`);
            });
        }
        if (!testingProducts || testingProducts.length === 0) {
            console.log('⚠️ 未找到测款阶段的商品，返回空数组');
            console.log('=== getTestingMonitorData 函数执行完成（无数据）===\n');
            return [];
        }
        console.log('\n--- 第二步：对每个商品统计数据 ---');
        console.log(`开始处理 ${testingProducts.length} 个商品的统计数据`);
        const result = await Promise.all(testingProducts.map(async (product, index) => {
            console.log(`\n处理第 ${index + 1}/${testingProducts.length} 个商品: ${product.product_id}`);
            const { product_id, product_name, product_image, testing_stage_start, testing_stage_end, } = product;
            console.log(`商品信息: ${product_name} (${product_id})`);
            const startDate = new Date(testing_stage_start);
            const endDate = testing_stage_end ? new Date(testing_stage_end) : null;
            console.log(`测款开始时间: ${startDate.toISOString()}`);
            console.log(`测款结束时间: ${endDate ? endDate.toISOString() : '未设置（无结束时间）'}`);
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate ? endDate.toISOString().split('T')[0] : null;
            console.log(`用于查询的开始日期: ${startDateStr}`);
            console.log(`用于查询的结束日期: ${endDateStr || '无（查询到当前）'}`);
            let totalClicks = 0;
            let totalVisitors = 0;
            let totalOrders = 0;
            try {
                console.log(`\n  [${product_id}] 开始查询广告数据（点击数）...`);
                try {
                    let adStatsQuery = `
              SELECT COALESCE(SUM(clicks), 0) as total_clicks
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ?
            `;
                    const adStatsParams = [shopID, product_id, startDateStr];
                    if (endDateStr) {
                        adStatsQuery += ' AND date <= ?';
                        adStatsParams.push(endDateStr);
                    }
                    console.log(`  [${product_id}] 广告数据查询 SQL:`, adStatsQuery);
                    console.log(`  [${product_id}] 查询参数:`, adStatsParams);
                    const adStatsResult = await this.mysqlService.queryOne(adStatsQuery, adStatsParams);
                    console.log(`  [${product_id}] 广告数据查询结果:`, adStatsResult);
                    if (adStatsResult && adStatsResult.total_clicks !== null) {
                        totalClicks = Number(adStatsResult.total_clicks) || 0;
                        console.log(`  [${product_id}] ✅ 点击数统计成功: ${totalClicks}`);
                    }
                    else {
                        console.log(`  [${product_id}] ⚠️ 广告数据查询结果为空，点击数设为 0`);
                    }
                }
                catch (error) {
                    console.warn(`  [${product_id}] ❌ 查询广告数据失败:`, error);
                    totalClicks = 0;
                }
                console.log(`\n  [${product_id}] 开始查询每日数据（访客数和出单数）...`);
                try {
                    let dailyStatsQuery = `
              SELECT 
                COALESCE(SUM(visitors), 0) as total_visitors,
                COALESCE(SUM(ordered_items), 0) as total_orders
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ?
            `;
                    const dailyStatsParams = [shopID, product_id, startDateStr];
                    if (endDateStr) {
                        dailyStatsQuery += ' AND date <= ?';
                        dailyStatsParams.push(endDateStr);
                    }
                    console.log(`  [${product_id}] 每日数据查询 SQL:`, dailyStatsQuery);
                    console.log(`  [${product_id}] 查询参数:`, dailyStatsParams);
                    const dailyStatsResult = await this.mysqlService.queryOne(dailyStatsQuery, dailyStatsParams);
                    console.log(`  [${product_id}] 每日数据查询结果:`, dailyStatsResult);
                    if (dailyStatsResult) {
                        totalVisitors = Number(dailyStatsResult.total_visitors) || 0;
                        totalOrders = Number(dailyStatsResult.total_orders) || 0;
                        console.log(`  [${product_id}] ✅ 访客数统计成功: ${totalVisitors}`);
                        console.log(`  [${product_id}] ✅ 出单数统计成功: ${totalOrders}`);
                    }
                    else {
                        console.log(`  [${product_id}] ⚠️ 每日数据查询结果为空，访客数和出单数设为 0`);
                    }
                }
                catch (error) {
                    console.warn(`  [${product_id}] ❌ 查询每日数据失败:`, error);
                    totalVisitors = 0;
                    totalOrders = 0;
                }
                console.log(`\n  [${product_id}] 📊 统计数据汇总:`);
                console.log(`     - 点击数: ${totalClicks}`);
                console.log(`     - 访客数: ${totalVisitors}`);
                console.log(`     - 出单数: ${totalOrders}`);
            }
            catch (error) {
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
        }));
        console.log('\n=== getTestingMonitorData 函数执行完成 ===');
        console.log(`总共处理了 ${result.length} 个商品`);
        console.log('最终返回结果:');
        result.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.product_name} (${item.product_id}): 点击数=${item.total_clicks}, 访客数=${item.total_visitors}, 出单数=${item.total_orders}`);
        });
        console.log('==========================================\n');
        return result;
    }
    async getCustomCategories(shopID) {
        const rawCategories = await this.mysqlService.query(`SELECT DISTINCT category FROM (
        SELECT TRIM(custom_category_1) AS category FROM product_items WHERE shop_id = ? AND (status IS NULL OR status = 0)
        UNION ALL
        SELECT TRIM(custom_category_2) FROM product_items WHERE shop_id = ? AND (status IS NULL OR status = 0)
        UNION ALL
        SELECT TRIM(custom_category_3) FROM product_items WHERE shop_id = ? AND (status IS NULL OR status = 0)
        UNION ALL
        SELECT TRIM(custom_category_4) FROM product_items WHERE shop_id = ? AND (status IS NULL OR status = 0)
      ) AS categories
      WHERE category IS NOT NULL AND category <> ''`, [shopID, shopID, shopID, shopID]);
        const categoriesSet = new Set();
        for (const item of rawCategories) {
            const value = item.category?.trim();
            if (value) {
                categoriesSet.add(value);
            }
        }
        const collator = new Intl.Collator('zh-Hans-u-co-pinyin', {
            sensitivity: 'base',
            numeric: true,
        });
        return Array.from(categoriesSet).sort((a, b) => collator.compare(a, b));
    }
    async getFinishedLinkMonitorData(shopID, shopName, date, customCategory) {
        console.log('=== getFinishedLinkMonitorData 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的店铺名称:', shopName);
        console.log('接收到的日期参数:', date || '未提供（使用当前日期）');
        console.log('接收到的自定义分类参数:', customCategory || '未提供');
        let currentDate;
        if (date) {
            const [year, month, day] = date.split('-').map(Number);
            currentDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        }
        else {
            currentDate = new Date();
        }
        console.log('使用的基准日期:', currentDate.toISOString());
        console.log('\n--- 第一步：查询当前处于成品阶段的商品 ---');
        let whereClause = `WHERE shop_id = ? 
        AND product_stage_start IS NOT NULL
        AND product_stage_start <= ?
        AND (product_stage_end IS NULL OR product_stage_end >= ?)
        AND (status IS NULL OR status = 0)`;
        const queryParams = [shopID, currentDate, currentDate];
        if (customCategory && customCategory.trim()) {
            const trimmedCategory = customCategory.trim();
            whereClause += ` AND (
        (custom_category_1 IS NOT NULL AND LOWER(custom_category_1) LIKE ?) OR
        (custom_category_2 IS NOT NULL AND LOWER(custom_category_2) LIKE ?) OR
        (custom_category_3 IS NOT NULL AND LOWER(custom_category_3) LIKE ?) OR
        (custom_category_4 IS NOT NULL AND LOWER(custom_category_4) LIKE ?)
      )`;
            const categoryPattern = `%${trimmedCategory.toLowerCase()}%`;
            queryParams.push(categoryPattern, categoryPattern, categoryPattern, categoryPattern);
            console.log('应用自定义分类筛选:', trimmedCategory);
        }
        const finishedProducts = await this.mysqlService.query(`SELECT 
        product_id,
        product_name,
        product_image,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4
      FROM product_items 
      ${whereClause}
      ORDER BY id ASC`, queryParams);
        console.log('查询到的成品商品数量:', finishedProducts?.length || 0);
        if (!finishedProducts || finishedProducts.length === 0) {
            console.log('⚠️ 未找到成品阶段的商品，返回空数组');
            console.log('=== getFinishedLinkMonitorData 函数执行完成（无数据）===\n');
            return [];
        }
        console.log('\n--- 第二步：对每个商品计算统计数据 ---');
        console.log(`开始处理 ${finishedProducts.length} 个商品的统计数据`);
        const timeDimensions = [30, 15, 7, 3, 1];
        const result = await Promise.all(finishedProducts.map(async (product) => {
            const { product_id, product_name, product_image, custom_category_1, custom_category_2, custom_category_3, custom_category_4, } = product;
            console.log(`\n处理商品: ${product_id} (${product_name})`);
            const visitorsAvg = [];
            const adCostAvg = [];
            const salesAvg = [];
            const endDate60 = new Date(currentDate);
            const startDate60 = new Date(currentDate);
            startDate60.setDate(endDate60.getDate() - 59);
            const startDate60Str = startDate60.toISOString().split('T')[0];
            const endDate60Str = endDate60.toISOString().split('T')[0];
            const visitorsData60 = await this.mysqlService.query(`SELECT visitors
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`, [shopID, product_id, startDate60Str, endDate60Str]);
            const visitorsValues60 = visitorsData60
                .map((row) => row.visitors)
                .filter((value) => value !== null && value !== undefined)
                .map((value) => Number(value) || 0);
            const adCostData60 = await this.mysqlService.query(`SELECT spend
          FROM ad_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`, [shopID, product_id, startDate60Str, endDate60Str]);
            const adCostValues60 = adCostData60
                .map((row) => row.spend)
                .filter((value) => value !== null && value !== undefined)
                .map((value) => Number(value) || 0);
            const salesData60 = await this.mysqlService.query(`SELECT confirmed_sales
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date`, [shopID, product_id, startDate60Str, endDate60Str]);
            const salesValues60 = salesData60
                .map((row) => row.confirmed_sales)
                .filter((value) => value !== null && value !== undefined)
                .map((value) => Number(value) || 0);
            const visitorsVolatilityBaseline = this.calculateSlidingVolatility(visitorsValues60);
            const adCostVolatilityBaseline = this.calculateSlidingVolatility(adCostValues60);
            const salesVolatilityBaseline = this.calculateSlidingVolatility(salesValues60);
            for (const days of timeDimensions) {
                const endDate = new Date(currentDate);
                const startDate = new Date(currentDate);
                startDate.setDate(endDate.getDate() - (days - 1));
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];
                console.log(`  [${product_id}] 计算 ${days} 天数据 (${startDateStr} 到 ${endDateStr})`);
                try {
                    const visitorsData = await this.mysqlService.query(`SELECT visitors
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
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
                    const adCostData = await this.mysqlService.query(`SELECT spend
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
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
                    const salesData = await this.mysqlService.query(`SELECT confirmed_sales
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
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
                    console.log(`    [${product_id}] ${days}天: 访客(avg=${visitorsAvgValue.toFixed(2)}), 广告花费(avg=${adCostAvgValue.toFixed(2)}), 销售额(avg=${salesAvgValue.toFixed(2)})`);
                }
                catch (error) {
                    console.warn(`    [${product_id}] 计算 ${days} 天数据失败:`, error);
                    visitorsAvg.push(0);
                    adCostAvg.push(0);
                    salesAvg.push(0);
                }
            }
            const warningLevel = '轻微';
            const warningMessages = [];
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
                custom_category_1: custom_category_1 || null,
                custom_category_2: custom_category_2 || null,
                custom_category_3: custom_category_3 || null,
                custom_category_4: custom_category_4 || null,
            };
        }));
        result.sort((a, b) => {
            const salesA = a.salesAvg[0] || 0;
            const salesB = b.salesAvg[0] || 0;
            return salesB - salesA;
        });
        console.log('\n=== getFinishedLinkMonitorData 函数执行完成 ===');
        console.log(`总共处理了 ${result.length} 个商品`);
        console.log('==========================================\n');
        return result;
    }
    calculateWarningLevelFromVolatility(visitors1Day, visitors3Day, adCost1Day, adCost3Day, sales1Day, sales3Day) {
        const levelToScore = (level) => {
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
        const scoreVisitors1Day = visitors1Day
            ? levelToScore(visitors1Day.level)
            : 0;
        const scoreAdCost1Day = adCost1Day ? levelToScore(adCost1Day.level) : 0;
        const scoreSales1Day = sales1Day ? levelToScore(sales1Day.level) : 0;
        const scoreVisitors3Day = visitors3Day
            ? levelToScore(visitors3Day.level)
            : 0;
        const scoreAdCost3Day = adCost3Day ? levelToScore(adCost3Day.level) : 0;
        const scoreSales3Day = sales3Day ? levelToScore(sales3Day.level) : 0;
        const score1Day = scoreVisitors1Day * METRIC_WEIGHTS.visitors +
            scoreAdCost1Day * METRIC_WEIGHTS.adCost +
            scoreSales1Day * METRIC_WEIGHTS.sales;
        const score3Day = scoreVisitors3Day * METRIC_WEIGHTS.visitors +
            scoreAdCost3Day * METRIC_WEIGHTS.adCost +
            scoreSales3Day * METRIC_WEIGHTS.sales;
        const compositeScore = score1Day * 0.6 + score3Day * 0.4;
        if (compositeScore >= 0.8) {
            return '严重';
        }
        else if (compositeScore >= 0.5) {
            return '一般';
        }
        else if (compositeScore >= 0.2) {
            return '轻微';
        }
        else {
            return '正常';
        }
    }
    calculateWarningLevel(visitorsChangeIndex, adCostChangeIndex, salesChangeIndex) {
        const index1Day = 4;
        const index3Day = 3;
        const levelToScore = (level) => {
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
        const scoreVisitors1Day = levelToScore(visitorsChangeIndex[index1Day].level);
        const scoreAdCost1Day = levelToScore(adCostChangeIndex[index1Day].level);
        const scoreSales1Day = levelToScore(salesChangeIndex[index1Day].level);
        const scoreVisitors3Day = levelToScore(visitorsChangeIndex[index3Day].level);
        const scoreAdCost3Day = levelToScore(adCostChangeIndex[index3Day].level);
        const scoreSales3Day = levelToScore(salesChangeIndex[index3Day].level);
        const score1Day = scoreVisitors1Day * METRIC_WEIGHTS.visitors +
            scoreAdCost1Day * METRIC_WEIGHTS.adCost +
            scoreSales1Day * METRIC_WEIGHTS.sales;
        const score3Day = scoreVisitors3Day * METRIC_WEIGHTS.visitors +
            scoreAdCost3Day * METRIC_WEIGHTS.adCost +
            scoreSales3Day * METRIC_WEIGHTS.sales;
        const compositeScore = score1Day * 0.6 + score3Day * 0.4;
        if (compositeScore >= 0.8) {
            return '严重';
        }
        else if (compositeScore >= 0.5) {
            return '一般';
        }
        else if (compositeScore >= 0.2) {
            return '轻微';
        }
        else {
            return '正常';
        }
    }
    async getPotentialLinkMonitorData(shopID, shopName, date) {
        console.log('=== getPotentialLinkMonitorData 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的店铺名称:', shopName);
        console.log('接收到的日期参数:', date);
        const [year, month, day] = date.split('-').map(Number);
        const currentDate = new Date(year, month - 1, day, 0, 0, 0, 0);
        console.log('使用的基准日期:', currentDate.toISOString());
        console.log('\n--- 第一步：查询当前处于潜力阶段的商品 ---');
        const potentialProducts = await this.mysqlService.query(`SELECT 
        product_id,
        product_name,
        product_image,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4
      FROM product_items 
      WHERE shop_id = ? 
        AND potential_stage_start IS NOT NULL
        AND potential_stage_start <= ?
        AND (potential_stage_end IS NULL OR potential_stage_end >= ?)
        AND (status IS NULL OR status = 0)
      ORDER BY id ASC`, [shopID, currentDate, currentDate]);
        console.log('查询到的潜力商品数量:', potentialProducts?.length || 0);
        if (!potentialProducts || potentialProducts.length === 0) {
            console.log('⚠️ 未找到潜力阶段的商品，返回空数组');
            console.log('=== getPotentialLinkMonitorData 函数执行完成（无数据）===\n');
            return [];
        }
        console.log('\n--- 第二步：对每个商品计算统计数据 ---');
        console.log(`开始处理 ${potentialProducts.length} 个商品的统计数据`);
        const timeDimensions = [30, 15, 7, 3, 1];
        const result = await Promise.all(potentialProducts.map(async (product) => {
            const { product_id, product_name, product_image, custom_category_1, custom_category_2, custom_category_3, custom_category_4, } = product;
            console.log(`\n处理商品: ${product_id} (${product_name})`);
            const visitorsAvg = [];
            const visitorsStd = [];
            const adCostAvg = [];
            const adCostStd = [];
            const salesAvg = [];
            const salesStd = [];
            const endDate60 = new Date(currentDate);
            const startDate60 = new Date(currentDate);
            startDate60.setDate(endDate60.getDate() - 59);
            const startDate60Str = startDate60.toISOString().split('T')[0];
            const endDate60Str = endDate60.toISOString().split('T')[0];
            console.log(`  [${product_id}] 查询60天数据范围: ${startDate60Str} 到 ${endDate60Str}`);
            const visitorsData60 = await this.mysqlService.query(`SELECT date, visitors
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date ASC`, [shopID, product_id, startDate60Str, endDate60Str]);
            const visitorsValues60 = visitorsData60
                .map((row) => ({
                date: row.date,
                value: row.visitors !== null && row.visitors !== undefined
                    ? Number(row.visitors) || 0
                    : 0,
            }))
                .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            })
                .map((item) => item.value);
            console.log(`  [${product_id}] 访客数据: 查询到 ${visitorsData60.length} 条记录，处理后 ${visitorsValues60.length} 个数据点`);
            const adCostData60 = await this.mysqlService.query(`SELECT date, spend
          FROM ad_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date ASC`, [shopID, product_id, startDate60Str, endDate60Str]);
            const adCostValues60 = adCostData60
                .map((row) => ({
                date: row.date,
                value: row.spend !== null && row.spend !== undefined
                    ? Number(row.spend) || 0
                    : 0,
            }))
                .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            })
                .map((item) => item.value);
            console.log(`  [${product_id}] 广告花费数据: 查询到 ${adCostData60.length} 条记录，处理后 ${adCostValues60.length} 个数据点`);
            const salesData60 = await this.mysqlService.query(`SELECT date, confirmed_sales
          FROM daily_product_stats
          WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
          ORDER BY date ASC`, [shopID, product_id, startDate60Str, endDate60Str]);
            const salesValues60 = salesData60
                .map((row) => ({
                date: row.date,
                value: row.confirmed_sales !== null && row.confirmed_sales !== undefined
                    ? Number(row.confirmed_sales) || 0
                    : 0,
            }))
                .sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateA - dateB;
            })
                .map((item) => item.value);
            console.log(`  [${product_id}] 销售额数据: 查询到 ${salesData60.length} 条记录，处理后 ${salesValues60.length} 个数据点`);
            const visitorsVolatilityBaseline = this.calculateSlidingVolatility(visitorsValues60);
            const adCostVolatilityBaseline = this.calculateSlidingVolatility(adCostValues60);
            const salesVolatilityBaseline = this.calculateSlidingVolatility(salesValues60);
            console.log(`  [${product_id}] 波动率基线计算完成: 访客=${visitorsVolatilityBaseline.length}个窗口, 广告花费=${adCostVolatilityBaseline.length}个窗口, 销售额=${salesVolatilityBaseline.length}个窗口`);
            for (const days of timeDimensions) {
                const endDate = new Date(currentDate);
                const startDate = new Date(currentDate);
                startDate.setDate(endDate.getDate() - (days - 1));
                const startDateStr = startDate.toISOString().split('T')[0];
                const endDateStr = endDate.toISOString().split('T')[0];
                console.log(`  [${product_id}] 计算 ${days} 天数据 (${startDateStr} 到 ${endDateStr})`);
                try {
                    const visitorsData = await this.mysqlService.query(`SELECT visitors
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
                    const visitorsValues = visitorsData
                        .map((row) => row.visitors)
                        .filter((value) => value !== null && value !== undefined)
                        .map((value) => Number(value) || 0);
                    let visitorsAvgValue = 0;
                    let visitorsStdValue = 0;
                    if (visitorsValues.length > 0) {
                        const sum = visitorsValues.reduce((acc, val) => acc + val, 0);
                        visitorsAvgValue = sum / visitorsValues.length;
                        if (visitorsValues.length > 1) {
                            const mean = visitorsAvgValue;
                            const variance = visitorsValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (visitorsValues.length - 1);
                            visitorsStdValue = Math.sqrt(variance);
                        }
                    }
                    visitorsAvg.push(visitorsAvgValue);
                    visitorsStd.push(visitorsStdValue);
                    const adCostData = await this.mysqlService.query(`SELECT spend
              FROM ad_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
                    const adCostValues = adCostData
                        .map((row) => row.spend)
                        .filter((value) => value !== null && value !== undefined)
                        .map((value) => Number(value) || 0);
                    let adCostAvgValue = 0;
                    let adCostStdValue = 0;
                    if (adCostValues.length > 0) {
                        const sum = adCostValues.reduce((acc, val) => acc + val, 0);
                        adCostAvgValue = sum / adCostValues.length;
                        if (adCostValues.length > 1) {
                            const mean = adCostAvgValue;
                            const variance = adCostValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (adCostValues.length - 1);
                            adCostStdValue = Math.sqrt(variance);
                        }
                    }
                    adCostAvg.push(adCostAvgValue);
                    adCostStd.push(adCostStdValue);
                    const salesData = await this.mysqlService.query(`SELECT confirmed_sales
              FROM daily_product_stats
              WHERE shop_id = ? AND product_id = ? AND date >= ? AND date <= ?
              ORDER BY date`, [shopID, product_id, startDateStr, endDateStr]);
                    const salesValues = salesData
                        .map((row) => row.confirmed_sales)
                        .filter((value) => value !== null && value !== undefined)
                        .map((value) => Number(value) || 0);
                    let salesAvgValue = 0;
                    let salesStdValue = 0;
                    if (salesValues.length > 0) {
                        const sum = salesValues.reduce((acc, val) => acc + val, 0);
                        salesAvgValue = sum / salesValues.length;
                        if (salesValues.length > 1) {
                            const mean = salesAvgValue;
                            const variance = salesValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (salesValues.length - 1);
                            salesStdValue = Math.sqrt(variance);
                        }
                    }
                    salesAvg.push(salesAvgValue);
                    salesStd.push(salesStdValue);
                    console.log(`    [${product_id}] ${days}天: 访客(avg=${visitorsAvgValue.toFixed(2)}, std=${visitorsStdValue.toFixed(2)}), 广告花费(avg=${adCostAvgValue.toFixed(2)}, std=${adCostStdValue.toFixed(2)}), 销售额(avg=${salesAvgValue.toFixed(2)}, std=${salesStdValue.toFixed(2)})`);
                }
                catch (error) {
                    console.warn(`    [${product_id}] 计算 ${days} 天数据失败:`, error);
                    visitorsAvg.push(0);
                    visitorsStd.push(0);
                    adCostAvg.push(0);
                    adCostStd.push(0);
                    salesAvg.push(0);
                    salesStd.push(0);
                }
            }
            const warningLevel = this.calculateWarningLevelFromCV(visitorsAvg, visitorsStd, adCostAvg, adCostStd, salesAvg, salesStd);
            const warningMessages = [];
            const index1Day = 4;
            const index3Day = 3;
            if (visitorsAvg[index1Day] > 0) {
                const cv1Day = visitorsStd[index1Day] / visitorsAvg[index1Day];
                if (cv1Day >= WARNING_LEVEL_THRESHOLDS.一般) {
                    warningMessages.push(`近1天访客数波动${cv1Day >= WARNING_LEVEL_THRESHOLDS.严重 ? '严重' : '一般'}，建议关注`);
                }
            }
            if (adCostAvg[index1Day] > 0) {
                const cv1Day = adCostStd[index1Day] / adCostAvg[index1Day];
                if (cv1Day >= WARNING_LEVEL_THRESHOLDS.一般) {
                    warningMessages.push(`近1天广告花费波动${cv1Day >= WARNING_LEVEL_THRESHOLDS.严重 ? '严重' : '一般'}，建议关注`);
                }
            }
            if (salesAvg[index1Day] > 0) {
                const cv1Day = salesStd[index1Day] / salesAvg[index1Day];
                if (cv1Day >= WARNING_LEVEL_THRESHOLDS.一般) {
                    warningMessages.push(`近1天销售额波动${cv1Day >= WARNING_LEVEL_THRESHOLDS.严重 ? '严重' : '一般'}，建议关注`);
                }
            }
            if (warningMessages.length === 0) {
                if (visitorsAvg[index3Day] > 0) {
                    const cv3Day = visitorsStd[index3Day] / visitorsAvg[index3Day];
                    if (cv3Day >= WARNING_LEVEL_THRESHOLDS.轻微) {
                        warningMessages.push('近3天访客数波动，建议关注');
                    }
                }
                if (adCostAvg[index3Day] > 0) {
                    const cv3Day = adCostStd[index3Day] / adCostAvg[index3Day];
                    if (cv3Day >= WARNING_LEVEL_THRESHOLDS.轻微) {
                        warningMessages.push('近3天广告花费波动，建议关注');
                    }
                }
                if (salesAvg[index3Day] > 0) {
                    const cv3Day = salesStd[index3Day] / salesAvg[index3Day];
                    if (cv3Day >= WARNING_LEVEL_THRESHOLDS.轻微) {
                        warningMessages.push('近3天销售额波动，建议关注');
                    }
                }
            }
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
                custom_category_1: custom_category_1 || null,
                custom_category_2: custom_category_2 || null,
                custom_category_3: custom_category_3 || null,
                custom_category_4: custom_category_4 || null,
            };
        }));
        result.sort((a, b) => {
            const salesA = a.salesAvg[0] || 0;
            const salesB = b.salesAvg[0] || 0;
            return salesB - salesA;
        });
        console.log('\n=== getPotentialLinkMonitorData 函数执行完成 ===');
        console.log(`总共处理了 ${result.length} 个商品`);
        console.log('==========================================\n');
        return result;
    }
    calculateWarningLevelFromCV(visitorsAvg, visitorsStd, adCostAvg, adCostStd, salesAvg, salesStd) {
        const index1Day = 4;
        const index3Day = 3;
        const visitorsCV1Day = visitorsAvg[index1Day] > 0
            ? visitorsStd[index1Day] / visitorsAvg[index1Day]
            : 0.001;
        const adCostCV1Day = adCostAvg[index1Day] > 0
            ? adCostStd[index1Day] / adCostAvg[index1Day]
            : 0.001;
        const salesCV1Day = salesAvg[index1Day] > 0
            ? salesStd[index1Day] / salesAvg[index1Day]
            : 0.001;
        const visitorsCV3Day = visitorsAvg[index3Day] > 0
            ? visitorsStd[index3Day] / visitorsAvg[index3Day]
            : 0.001;
        const adCostCV3Day = adCostAvg[index3Day] > 0
            ? adCostStd[index3Day] / adCostAvg[index3Day]
            : 0.001;
        const salesCV3Day = salesAvg[index3Day] > 0
            ? salesStd[index3Day] / salesAvg[index3Day]
            : 0.001;
        const visitorsScore1Day = visitorsCV1Day * METRIC_WEIGHTS_POTENTIAL.visitors;
        const adCostScore1Day = adCostCV1Day * METRIC_WEIGHTS_POTENTIAL.adCost;
        const salesScore1Day = salesCV1Day * METRIC_WEIGHTS_POTENTIAL.sales;
        const visitorsScore3Day = visitorsCV3Day * METRIC_WEIGHTS_POTENTIAL.visitors;
        const adCostScore3Day = adCostCV3Day * METRIC_WEIGHTS_POTENTIAL.adCost;
        const salesScore3Day = salesCV3Day * METRIC_WEIGHTS_POTENTIAL.sales;
        const compositeScore = (visitorsScore1Day + adCostScore1Day + salesScore1Day) * 0.6 +
            (visitorsScore3Day + adCostScore3Day + salesScore3Day) * 0.4;
        if (compositeScore >= WARNING_LEVEL_THRESHOLDS.严重) {
            return '严重';
        }
        else if (compositeScore >= WARNING_LEVEL_THRESHOLDS.一般) {
            return '一般';
        }
        else if (compositeScore >= WARNING_LEVEL_THRESHOLDS.轻微) {
            return '轻微';
        }
        else {
            return '正常';
        }
    }
    async getPotentialLinkAISuggestion(shopID, shopName, date, productID, productName) {
        console.log('=== getPotentialLinkAISuggestion 函数开始执行 ===');
        console.log('接收到的参数:', {
            shopID,
            shopName,
            date,
            productID,
            productName,
        });
        const monitorData = await this.getPotentialLinkMonitorData(shopID, shopName, date);
        const productData = monitorData.find((p) => p.id === productID);
        if (!productData) {
            return {
                suggestion: '未找到该产品的监控数据，无法生成建议。',
            };
        }
        const suggestions = [];
        const visitorsTrend = this.analyzeTrend(productData.visitorsAvg);
        if (visitorsTrend === '上升') {
            suggestions.push('访客数呈上升趋势，建议继续保持当前推广策略');
        }
        else if (visitorsTrend === '下降') {
            suggestions.push('访客数呈下降趋势，建议优化推广策略或增加广告投入');
        }
        const adCostTrend = this.analyzeTrend(productData.adCostAvg);
        const salesTrend = this.analyzeTrend(productData.salesAvg);
        if (adCostTrend === '上升' && salesTrend === '上升') {
            suggestions.push('广告投入和销售额同步增长，ROI表现良好');
        }
        else if (adCostTrend === '上升' && salesTrend !== '上升') {
            suggestions.push('广告投入增加但销售额未同步增长，建议优化广告投放策略');
        }
        if (productData.warningLevel === '严重') {
            suggestions.push('当前数据波动较大，建议密切关注并采取相应措施');
        }
        else if (productData.warningLevel === '一般') {
            suggestions.push('数据存在一定波动，建议持续关注趋势变化');
        }
        const visitorsVolatility = productData.visitorsVolatilityBaseline.find((v) => v.window === 3);
        if (visitorsVolatility && visitorsVolatility.level === '明显') {
            suggestions.push('访客数波动明显，建议检查推广渠道和广告效果');
        }
        const defaultSuggestion = '基于当前数据分析，该潜力产品在近期表现出良好的增长趋势。建议：1. 继续保持当前广告投入水平；2. 关注访客转化率的提升；3. 可以考虑扩大库存以应对潜在的需求增长。';
        const finalSuggestion = suggestions.length > 0
            ? suggestions.join('。') + '。'
            : defaultSuggestion;
        console.log('生成的AI建议:', finalSuggestion);
        console.log('=== getPotentialLinkAISuggestion 函数执行完成 ===\n');
        return {
            suggestion: finalSuggestion,
        };
    }
    analyzeTrend(values) {
        if (values.length < 2) {
            return '稳定';
        }
        const recent = values[values.length - 1];
        const longTerm = values[0];
        if (longTerm === 0) {
            return recent > 0 ? '上升' : '稳定';
        }
        const changeRate = (recent - longTerm) / longTerm;
        if (changeRate > 0.1) {
            return '上升';
        }
        else if (changeRate < -0.1) {
            return '下降';
        }
        else {
            return '稳定';
        }
    }
    async getProductItems(shopID, shopName, page = 1, pageSize = 20, customCategory) {
        const validPage = Math.max(1, Math.floor(Number(page)) || 1);
        const validPageSize = Math.max(1, Math.min(100, Math.floor(Number(pageSize)) || 20));
        const offset = (validPage - 1) * validPageSize;
        const trimmedCategory = typeof customCategory === 'string' ? customCategory.trim() : undefined;
        const whereConditions = ['shop_id = ?', '(status IS NULL OR status = 0)'];
        const params = [shopID];
        if (trimmedCategory) {
            const likeValue = `%${trimmedCategory}%`;
            whereConditions.push(`(custom_category_1 LIKE ? OR custom_category_2 LIKE ? OR custom_category_3 LIKE ? OR custom_category_4 LIKE ?)`);
            params.push(likeValue, likeValue, likeValue, likeValue);
        }
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const countResult = await this.mysqlService.queryOne(`SELECT COUNT(*) as total 
       FROM product_items 
       ${whereClause}`, [...params]);
        const total = countResult?.total || 0;
        const products = await this.mysqlService.query(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4,
        prompt_note,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT ${validPageSize} OFFSET ${offset}`, [...params]);
        return {
            data: products,
            total,
        };
    }
    validatePromptNote(value) {
        if (value === null || value === undefined) {
            return null;
        }
        if (typeof value !== 'string') {
            throw new Error('prompt_note 必须是字符串类型');
        }
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }
        if (trimmed.length > 2000) {
            throw new Error('prompt_note 不能超过 2000 个字符');
        }
        return trimmed;
    }
    async updateProductItemCustomCategory(id, updateData) {
        const product = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4,
        prompt_note,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      WHERE id = ? OR product_id = ? 
      LIMIT 1`, [id, id]);
        if (!product) {
            throw new Error('商品不存在');
        }
        const updateFields = {};
        if (updateData.custom_category_1 !== undefined) {
            updateFields.custom_category_1 = updateData.custom_category_1;
        }
        if (updateData.custom_category_2 !== undefined) {
            updateFields.custom_category_2 = updateData.custom_category_2;
        }
        if (updateData.custom_category_3 !== undefined) {
            updateFields.custom_category_3 = updateData.custom_category_3;
        }
        if (updateData.custom_category_4 !== undefined) {
            updateFields.custom_category_4 = updateData.custom_category_4;
        }
        if (updateData.prompt_note !== undefined) {
            updateFields.prompt_note = this.validatePromptNote(updateData.prompt_note);
        }
        if (updateData.competitor_link !== undefined) {
            updateFields.competitor_link = updateData.competitor_link === null || updateData.competitor_link === ''
                ? null
                : updateData.competitor_link.trim();
        }
        if (updateData.competitor_daily_sales !== undefined) {
            updateFields.competitor_daily_sales = updateData.competitor_daily_sales === null || updateData.competitor_daily_sales === ''
                ? null
                : updateData.competitor_daily_sales.trim();
        }
        if (Object.keys(updateFields).length === 0) {
            return product;
        }
        await this.mysqlService.update('product_items', updateFields, {
            id: product.id,
        });
        const updatedProduct = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4,
        prompt_note,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      WHERE id = ?`, [product.id]);
        if (!updatedProduct) {
            throw new Error('更新后无法获取商品数据');
        }
        return updatedProduct;
    }
    async updateProductCompetitorInfo(id, updateData) {
        const product = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      WHERE id = ? OR product_id = ? 
      LIMIT 1`, [id, id]);
        if (!product) {
            throw new Error('商品不存在');
        }
        const updateFields = {};
        if (updateData.competitor_link !== undefined) {
            updateFields.competitor_link = updateData.competitor_link === null || updateData.competitor_link === ''
                ? null
                : updateData.competitor_link.trim();
        }
        if (updateData.competitor_daily_sales !== undefined) {
            updateFields.competitor_daily_sales = updateData.competitor_daily_sales === null || updateData.competitor_daily_sales === ''
                ? null
                : updateData.competitor_daily_sales.trim();
        }
        if (Object.keys(updateFields).length === 0) {
            return product;
        }
        await this.mysqlService.update('product_items', updateFields, {
            id: product.id,
        });
        const updatedProduct = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      WHERE id = ?`, [product.id]);
        if (!updatedProduct) {
            throw new Error('更新后无法获取商品数据');
        }
        return updatedProduct;
    }
    async deleteProductItem(id) {
        const product = await this.mysqlService.queryOne(`SELECT id FROM product_items 
       WHERE id = ? OR product_id = ? 
       LIMIT 1`, [id, id]);
        if (!product) {
            throw new Error('商品不存在');
        }
        const affectedRows = await this.mysqlService.delete('product_items', {
            id: product.id,
        });
        return affectedRows > 0;
    }
    async getOfflineProducts(shopID, shopName, page = 1, pageSize = 20, customCategory) {
        const validPage = Math.max(1, Math.floor(Number(page)) || 1);
        const validPageSize = Math.max(1, Math.min(100, Math.floor(Number(pageSize)) || 20));
        const offset = (validPage - 1) * validPageSize;
        const trimmedCategory = typeof customCategory === 'string' ? customCategory.trim() : undefined;
        const whereConditions = ['shop_id = ?', 'status = 1'];
        const params = [shopID];
        if (trimmedCategory) {
            const likeValue = `%${trimmedCategory}%`;
            whereConditions.push(`(custom_category_1 LIKE ? OR custom_category_2 LIKE ? OR custom_category_3 LIKE ? OR custom_category_4 LIKE ?)`);
            params.push(likeValue, likeValue, likeValue, likeValue);
        }
        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const countResult = await this.mysqlService.queryOne(`SELECT COUNT(*) as total 
       FROM product_items 
       ${whereClause}`, [...params]);
        const total = countResult?.total || 0;
        const products = await this.mysqlService.query(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        status,
        custom_category_1,
        custom_category_2,
        custom_category_3,
        custom_category_4,
        prompt_note,
        competitor_link,
        competitor_daily_sales
      FROM product_items 
      ${whereClause} 
      ORDER BY id DESC 
      LIMIT ${validPageSize} OFFSET ${offset}`, [...params]);
        return {
            data: products,
            total,
        };
    }
    async updateProductStatus(id, status) {
        const product = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        status
      FROM product_items 
      WHERE id = ? OR product_id = ? 
      LIMIT 1`, [id, id]);
        if (!product) {
            throw new Error('商品不存在');
        }
        await this.mysqlService.update('product_items', { status }, { id: product.id });
        const updatedProduct = await this.mysqlService.queryOne(`SELECT 
        id,
        product_id,
        product_name,
        product_image,
        status
      FROM product_items 
      WHERE id = ?`, [product.id]);
        if (!updatedProduct) {
            throw new Error('更新后无法获取商品数据');
        }
        return updatedProduct;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
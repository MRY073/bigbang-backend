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
exports.AdAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const mysql_service_1 = require("../database/mysql.service");
let AdAnalysisService = class AdAnalysisService {
    mysqlService;
    constructor(mysqlService) {
        this.mysqlService = mysqlService;
    }
    async getProductStageByDate(productId, shopID, targetDate) {
        try {
            const product = await this.mysqlService.queryOne(`SELECT 
          testing_stage_start,
          testing_stage_end,
          potential_stage_start,
          potential_stage_end,
          product_stage_start,
          product_stage_end,
          abandoned_stage_start,
          abandoned_stage_end
        FROM product_items
        WHERE shop_id = ? AND product_id = ?`, [shopID, productId]);
            if (!product) {
                return null;
            }
            const dateStr = targetDate.toISOString().split('T')[0];
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
        }
        catch (error) {
            console.warn(`判断商品阶段失败 (shopID: ${shopID}, product_id: ${productId}, date: ${targetDate.toISOString()}):`, error);
            return null;
        }
    }
    async getAdTrend30Days(shopID) {
        console.log('=== getAdTrend30Days 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        console.log('查询日期范围:', startDateStr, '到', endDateStr);
        console.log('\n--- 第一步：查询近30天的广告数据 ---');
        const adStats = await this.mysqlService.query(`SELECT 
        product_id,
        date,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date >= ? AND date <= ?
      ORDER BY date ASC, product_id ASC`, [shopID, startDateStr, endDateStr]);
        console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);
        const dateMap = new Map();
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
            const emptyData = [];
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
        console.log('\n--- 第二步：判断商品阶段并统计花费和销售额 ---');
        console.log(`开始处理 ${adStats.length} 条广告数据`);
        for (const ad of adStats) {
            const dateStr = ad.date instanceof Date
                ? ad.date.toISOString().split('T')[0]
                : new Date(ad.date).toISOString().split('T')[0];
            const spend = Number(ad.spend) || 0;
            const sales = Number(ad.sales_amount) || 0;
            if (spend <= 0)
                continue;
            const stage = await this.getProductStageByDate(ad.product_id, shopID, new Date(dateStr));
            const dayData = dateMap.get(dateStr);
            if (dayData) {
                if (stage === 'testing') {
                    dayData.testing_stage_spend += spend;
                }
                else if (stage === 'potential') {
                    dayData.potential_stage_spend += spend;
                }
                else if (stage === 'product') {
                    dayData.product_stage_spend += spend;
                    dayData.product_stage_sales += sales;
                }
                else if (stage === 'abandoned') {
                    dayData.abandoned_stage_spend += spend;
                }
                else {
                    dayData.no_stage_spend += spend;
                }
            }
        }
        const result = Array.from(dateMap.entries())
            .map(([date, data]) => {
            let productStageRoi = 0;
            if (data.product_stage_spend > 0) {
                productStageRoi = data.product_stage_sales / data.product_stage_spend;
            }
            productStageRoi = Math.round(productStageRoi * 100) / 100;
            return {
                date,
                testing_stage_spend: Math.round(data.testing_stage_spend * 100) / 100,
                potential_stage_spend: Math.round(data.potential_stage_spend * 100) / 100,
                product_stage_spend: Math.round(data.product_stage_spend * 100) / 100,
                abandoned_stage_spend: Math.round(data.abandoned_stage_spend * 100) / 100,
                no_stage_spend: Math.round(data.no_stage_spend * 100) / 100,
                product_stage_roi: productStageRoi,
            };
        })
            .sort((a, b) => a.date.localeCompare(b.date));
        console.log('\n=== getAdTrend30Days 函数执行完成 ===');
        console.log(`总共处理了 ${result.length} 天的数据`);
        console.log('最终返回结果（前5天示例）:');
        result.slice(0, 5).forEach((item) => {
            console.log(`  ${item.date}: 测款=${item.testing_stage_spend}, 潜力=${item.potential_stage_spend}, 成品=${item.product_stage_spend}, 放弃=${item.abandoned_stage_spend}, 无阶段=${item.no_stage_spend}, ROI=${item.product_stage_roi}`);
        });
        console.log('==========================================\n');
        return result;
    }
    async getAdRatioByDate(shopID, date) {
        console.log('=== getAdRatioByDate 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的日期:', date);
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
        }
        const dateStr = targetDate.toISOString().split('T')[0];
        console.log('解析后的日期:', dateStr);
        console.log('\n--- 第一步：查询指定日期的广告数据 ---');
        const adStats = await this.mysqlService.query(`SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount,
        COALESCE(roas, 0) as roas
      FROM ad_stats
      WHERE shop_id = ? AND date = ?
      ORDER BY product_id ASC`, [shopID, dateStr]);
        console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);
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
        console.log('\n--- 第二步：判断商品阶段并统计花费和销售额 ---');
        console.log(`开始处理 ${adStats.length} 条广告数据`);
        for (const ad of adStats) {
            const spend = Number(ad.spend) || 0;
            if (spend <= 0)
                continue;
            const stage = await this.getProductStageByDate(ad.product_id, shopID, targetDate);
            console.log(`商品 ${ad.product_id}: 阶段=${stage || '无'}, 花费=${spend}`);
            if (stage === 'testing') {
                stageData.testing_stage.spend += spend;
            }
            else if (stage === 'potential') {
                stageData.potential_stage.spend += spend;
            }
            else if (stage === 'product') {
                stageData.product_stage.spend += spend;
                const sales = Number(ad.sales_amount) || 0;
                stageData.product_stage.sales_amount += sales;
            }
            else if (stage === 'abandoned') {
                stageData.abandoned_stage.spend += spend;
            }
            else {
                stageData.no_stage.spend += spend;
            }
        }
        console.log('\n--- 第三步：计算成品阶段的合计ROI ---');
        if (stageData.product_stage.spend > 0) {
            stageData.product_stage.roi =
                stageData.product_stage.sales_amount / stageData.product_stage.spend;
        }
        else {
            stageData.product_stage.roi = 0;
        }
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
    async getStageProducts(shopID, date, stage, shopName) {
        console.log('=== getStageProducts 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的日期:', date);
        console.log('接收到的阶段:', stage);
        if (shopName) {
            console.log('接收到的店铺名称:', shopName);
        }
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
        const validStages = [
            'product_stage',
            'testing_stage',
            'potential_stage',
            'abandoned_stage',
            'no_stage',
        ];
        if (!validStages.includes(stage)) {
            throw new Error(`阶段参数无效：${stage}，应为 product_stage, testing_stage, potential_stage, abandoned_stage, no_stage 之一`);
        }
        console.log('\n--- 第一步：查询指定日期的广告数据 ---');
        const adStats = await this.mysqlService.query(`SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ? AND COALESCE(spend, 0) > 0
      ORDER BY product_id ASC`, [shopID, dateStr]);
        console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);
        if (!adStats || adStats.length === 0) {
            console.log('⚠️ 未找到广告数据，返回空数组');
            console.log('=== getStageProducts 函数执行完成（无数据）===\n');
            return [];
        }
        console.log('\n--- 第二步：判断商品阶段并筛选符合条件的商品 ---');
        console.log(`开始处理 ${adStats.length} 条广告数据`);
        const stageMap = new Map();
        const stageMapping = {
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
            if (spend <= 0)
                continue;
            const productStage = await this.getProductStageByDate(ad.product_id, shopID, targetDate);
            if (stage === 'no_stage') {
                if (productStage !== null) {
                    continue;
                }
            }
            else {
                if (productStage !== targetStage) {
                    continue;
                }
            }
            const existing = stageMap.get(ad.product_id);
            if (existing) {
                existing.ad_spend += spend;
                existing.ad_sales += sales;
            }
            else {
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
        console.log('\n--- 第三步：查询商品基本信息 ---');
        const productIds = Array.from(stageMap.keys());
        console.log(`需要查询的商品ID数量: ${productIds.length}`);
        const products = await this.mysqlService.query(`SELECT 
        product_id,
        product_name,
        product_image
      FROM product_items
      WHERE shop_id = ? AND product_id IN (${productIds.map(() => '?').join(',')})
      ORDER BY product_id ASC`, [shopID, ...productIds]);
        console.log(`查询到的商品信息条数: ${products?.length || 0}`);
        console.log('\n--- 第四步：合并数据并计算 ROI ---');
        const result = [];
        for (const product of products || []) {
            const adData = stageMap.get(product.product_id);
            if (!adData) {
                continue;
            }
            let roi = 0;
            if (adData.ad_spend > 0) {
                roi = adData.ad_sales / adData.ad_spend;
            }
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
        result.sort((a, b) => b.ad_spend - a.ad_spend);
        console.log(`最终返回商品数量: ${result.length}`);
        if (result.length > 0) {
            console.log('前3个商品示例:');
            result.slice(0, 3).forEach((item) => {
                console.log(`  ${item.product_id}: ${item.title}, 花费=${item.ad_spend}, 销售额=${item.ad_sales}, ROI=${item.roi}`);
            });
        }
        console.log('\n=== getStageProducts 函数执行完成 ===');
        console.log('==========================================\n');
        return result;
    }
};
exports.AdAnalysisService = AdAnalysisService;
exports.AdAnalysisService = AdAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], AdAnalysisService);
//# sourceMappingURL=ad-analysis.service.js.map
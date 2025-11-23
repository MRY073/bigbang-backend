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
    async getAdTrend30Days(shopID, shopName, customCategory) {
        console.log('=== getAdTrend30Days 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        if (shopName) {
            console.log('接收到的店铺名称:', shopName);
        }
        if (customCategory) {
            console.log('接收到的自定义分类:', customCategory);
        }
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        console.log('查询日期范围:', startDateStr, '到', endDateStr);
        let filteredProductIds = null;
        if (customCategory && customCategory.trim()) {
            console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
            const trimmedCategory = customCategory.trim();
            const products = await this.mysqlService.query(`SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`, [shopID, trimmedCategory, trimmedCategory, trimmedCategory, trimmedCategory]);
            filteredProductIds = products.map((p) => p.product_id);
            console.log(`符合自定义分类的商品数量: ${filteredProductIds.length}`);
        }
        console.log('\n--- 第二步：查询近30天的广告数据 ---');
        let adStatsQuery = `SELECT 
        product_id,
        date,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date >= ? AND date <= ?`;
        const queryParams = [shopID, startDateStr, endDateStr];
        if (filteredProductIds !== null && filteredProductIds.length > 0) {
            adStatsQuery += ` AND product_id IN (${filteredProductIds.map(() => '?').join(',')})`;
            queryParams.push(...filteredProductIds);
        }
        else if (filteredProductIds !== null && filteredProductIds.length === 0) {
            console.log('⚠️ 自定义分类筛选后没有符合条件的商品，返回空数据');
            const emptyData = [];
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
        const adStats = await this.mysqlService.query(adStatsQuery, queryParams);
        console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);
        const dateMap = new Map();
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
            const emptyData = [];
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
        console.log('\n--- 第三步：判断商品阶段并统计花费和销售额 ---');
        console.log(`开始处理 ${adStats.length} 条广告数据`);
        for (const ad of adStats) {
            const dateStr = ad.date instanceof Date
                ? ad.date.toISOString().split('T')[0]
                : new Date(ad.date).toISOString().split('T')[0];
            const spend = Number(ad.spend) || 0;
            const sales = Number(ad.sales_amount) || 0;
            const stage = await this.getProductStageByDate(ad.product_id, shopID, new Date(dateStr));
            const dayData = dateMap.get(dateStr);
            if (dayData) {
                if (stage === 'testing') {
                    dayData.testing_stage_spend += spend;
                    dayData.testing_stage_sales += sales;
                }
                else if (stage === 'potential') {
                    dayData.potential_stage_spend += spend;
                    dayData.potential_stage_sales += sales;
                }
                else if (stage === 'product') {
                    dayData.product_stage_spend += spend;
                    dayData.product_stage_sales += sales;
                }
                else if (stage === 'abandoned') {
                    dayData.abandoned_stage_spend += spend;
                    dayData.abandoned_stage_sales += sales;
                }
                else {
                    dayData.no_stage_spend += spend;
                    dayData.no_stage_sales += sales;
                }
            }
        }
        const result = Array.from(dateMap.entries())
            .map(([date, data]) => {
            const calculateRoi = (spend, sales) => {
                if (spend > 0) {
                    return Math.round((sales / spend) * 100) / 100;
                }
                return 0;
            };
            return {
                date,
                product_stage_spend: Math.round(data.product_stage_spend * 100) / 100,
                testing_stage_spend: Math.round(data.testing_stage_spend * 100) / 100,
                potential_stage_spend: Math.round(data.potential_stage_spend * 100) / 100,
                abandoned_stage_spend: Math.round(data.abandoned_stage_spend * 100) / 100,
                no_stage_spend: Math.round(data.no_stage_spend * 100) / 100,
                product_stage_sales: Math.round(data.product_stage_sales * 100) / 100,
                testing_stage_sales: Math.round(data.testing_stage_sales * 100) / 100,
                potential_stage_sales: Math.round(data.potential_stage_sales * 100) / 100,
                abandoned_stage_sales: Math.round(data.abandoned_stage_sales * 100) / 100,
                no_stage_sales: Math.round(data.no_stage_sales * 100) / 100,
                product_stage_roi: calculateRoi(data.product_stage_spend, data.product_stage_sales),
                testing_stage_roi: calculateRoi(data.testing_stage_spend, data.testing_stage_sales),
                potential_stage_roi: calculateRoi(data.potential_stage_spend, data.potential_stage_sales),
                abandoned_stage_roi: calculateRoi(data.abandoned_stage_spend, data.abandoned_stage_sales),
                no_stage_roi: calculateRoi(data.no_stage_spend, data.no_stage_sales),
            };
        })
            .sort((a, b) => a.date.localeCompare(b.date));
        console.log('\n=== getAdTrend30Days 函数执行完成 ===');
        console.log(`总共处理了 ${result.length} 天的数据`);
        console.log('最终返回结果（前5天示例）:');
        result.slice(0, 5).forEach((item) => {
            console.log(`  ${item.date}: 成品(花费=${item.product_stage_spend}, 销售额=${item.product_stage_sales}, ROI=${item.product_stage_roi}), 测款(花费=${item.testing_stage_spend}, 销售额=${item.testing_stage_sales}, ROI=${item.testing_stage_roi}), 潜力(花费=${item.potential_stage_spend}, 销售额=${item.potential_stage_sales}, ROI=${item.potential_stage_roi}), 放弃(花费=${item.abandoned_stage_spend}, 销售额=${item.abandoned_stage_sales}, ROI=${item.abandoned_stage_roi}), 无阶段(花费=${item.no_stage_spend}, 销售额=${item.no_stage_sales}, ROI=${item.no_stage_roi})`);
        });
        console.log('==========================================\n');
        return result;
    }
    async getAdRatioByDate(shopID, date, shopName, customCategory) {
        console.log('=== getAdRatioByDate 函数开始执行 ===');
        console.log('接收到的店铺ID:', shopID);
        console.log('接收到的日期:', date);
        if (shopName) {
            console.log('接收到的店铺名称:', shopName);
        }
        if (customCategory) {
            console.log('接收到的自定义分类:', customCategory);
        }
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            throw new Error(`日期格式错误：${date}，应为 YYYY-MM-DD 格式`);
        }
        const dateStr = targetDate.toISOString().split('T')[0];
        console.log('解析后的日期:', dateStr);
        let filteredProductIds = null;
        if (customCategory && customCategory.trim()) {
            console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
            const trimmedCategory = customCategory.trim();
            const products = await this.mysqlService.query(`SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`, [shopID, trimmedCategory, trimmedCategory, trimmedCategory, trimmedCategory]);
            filteredProductIds = products.map((p) => p.product_id);
            console.log(`符合自定义分类的商品数量: ${filteredProductIds.length}`);
        }
        console.log('\n--- 第二步：查询指定日期的广告数据 ---');
        let adStatsQuery = `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ?`;
        const queryParams = [shopID, dateStr];
        if (filteredProductIds !== null && filteredProductIds.length > 0) {
            adStatsQuery += ` AND product_id IN (${filteredProductIds.map(() => '?').join(',')})`;
            queryParams.push(...filteredProductIds);
        }
        else if (filteredProductIds !== null && filteredProductIds.length === 0) {
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
        const adStats = await this.mysqlService.query(adStatsQuery, queryParams);
        console.log(`查询到的广告数据条数: ${adStats?.length || 0}`);
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
        console.log('\n--- 第三步：判断商品阶段并统计花费和销售额 ---');
        console.log(`开始处理 ${adStats.length} 条广告数据`);
        for (const ad of adStats) {
            const spend = Number(ad.spend) || 0;
            const sales = Number(ad.sales_amount) || 0;
            const stage = await this.getProductStageByDate(ad.product_id, shopID, targetDate);
            console.log(`商品 ${ad.product_id}: 阶段=${stage || '无'}, 花费=${spend}, 销售额=${sales}`);
            if (stage === 'testing') {
                stageData.testing_stage.spend += spend;
                stageData.testing_stage.sales += sales;
            }
            else if (stage === 'potential') {
                stageData.potential_stage.spend += spend;
                stageData.potential_stage.sales += sales;
            }
            else if (stage === 'product') {
                stageData.product_stage.spend += spend;
                stageData.product_stage.sales += sales;
            }
            else if (stage === 'abandoned') {
                stageData.abandoned_stage.spend += spend;
                stageData.abandoned_stage.sales += sales;
            }
            else {
                stageData.no_stage.spend += spend;
                stageData.no_stage.sales += sales;
            }
        }
        console.log('\n--- 第四步：计算各阶段的ROI ---');
        const stages = ['product_stage', 'testing_stage', 'potential_stage', 'abandoned_stage', 'no_stage'];
        for (const stageKey of stages) {
            const stage = stageData[stageKey];
            if (stage.spend > 0) {
                stage.roi = stage.sales / stage.spend;
            }
            else {
                stage.roi = 0;
            }
            stage.spend = Math.round(stage.spend * 100) / 100;
            stage.sales = Math.round(stage.sales * 100) / 100;
            stage.roi = Math.round(stage.roi * 100) / 100;
        }
        const result = {
            stages: {},
        };
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
    async getStageProducts(shopID, date, stage, shopName, customCategory, page = 1, pageSize = 20, sortBy = 'ad_spend', sortOrder = 'desc') {
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
        const validPageSizes = [10, 20, 50, 100];
        if (!validPageSizes.includes(pageSize)) {
            console.log(`⚠️ pageSize ${pageSize} 不合法，使用默认值 20`);
            pageSize = 20;
        }
        if (page < 1) {
            console.log(`⚠️ page ${page} 小于1，使用默认值 1`);
            page = 1;
        }
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
        let filteredProductIds = null;
        if (customCategory && customCategory.trim()) {
            console.log('\n--- 第一步：查询符合自定义分类的商品ID ---');
            const trimmedCategory = customCategory.trim();
            const products = await this.mysqlService.query(`SELECT DISTINCT product_id
        FROM product_items
        WHERE shop_id = ?
          AND (
            custom_category_1 = ?
            OR custom_category_2 = ?
            OR custom_category_3 = ?
            OR custom_category_4 = ?
          )`, [
                shopID,
                trimmedCategory,
                trimmedCategory,
                trimmedCategory,
                trimmedCategory,
            ]);
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
        console.log('\n--- 第二步：查询指定日期的广告数据 ---');
        let adStatsQuery = `SELECT 
        product_id,
        COALESCE(spend, 0) as spend,
        COALESCE(sales_amount, 0) as sales_amount
      FROM ad_stats
      WHERE shop_id = ? AND date = ? AND COALESCE(spend, 0) > 0`;
        const adStatsParams = [shopID, dateStr];
        if (filteredProductIds !== null && filteredProductIds.length > 0) {
            adStatsQuery += ` AND product_id IN (${filteredProductIds
                .map(() => '?')
                .join(',')})`;
            adStatsParams.push(...filteredProductIds);
        }
        adStatsQuery += ' ORDER BY product_id ASC';
        const adStats = await this.mysqlService.query(adStatsQuery, adStatsParams);
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
        console.log('\n--- 第三步：判断商品阶段并筛选符合条件的商品 ---');
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
            console.log('⚠️ 未找到符合条件的商品，返回空结果');
            return {
                items: [],
                total: 0,
                page,
                pageSize,
            };
        }
        console.log('\n--- 第四步：查询商品基本信息 ---');
        const productIds = Array.from(stageMap.keys());
        console.log(`需要查询的商品ID数量: ${productIds.length}`);
        const products = await this.mysqlService.query(`SELECT 
        product_id,
        product_name,
        product_image
      FROM product_items
      WHERE shop_id = ? 
        AND product_id IN (${productIds.map(() => '?').join(',')})
        AND (status IS NULL OR status = 0)
      ORDER BY product_id ASC`, [shopID, ...productIds]);
        console.log(`查询到的商品信息条数: ${products?.length || 0}`);
        console.log('\n--- 第五步：合并数据并计算 ROI ---');
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
        console.log('\n--- 第六步：排序数据 ---');
        result.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'ad_spend') {
                comparison = a.ad_spend - b.ad_spend;
            }
            else if (sortBy === 'ad_sales') {
                comparison = a.ad_sales - b.ad_sales;
            }
            else if (sortBy === 'roi') {
                comparison = a.roi - b.roi;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });
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
                console.log(`  ${item.product_id}: ${item.title}, 花费=${item.ad_spend}, 销售额=${item.ad_sales}, ROI=${item.roi}`);
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
};
exports.AdAnalysisService = AdAnalysisService;
exports.AdAnalysisService = AdAnalysisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], AdAnalysisService);
//# sourceMappingURL=ad-analysis.service.js.map
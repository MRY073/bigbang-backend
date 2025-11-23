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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdAnalysisController = void 0;
const common_1 = require("@nestjs/common");
const ad_analysis_service_1 = require("./ad-analysis.service");
const ad_trend_dto_1 = require("./dto/ad-trend.dto");
const ad_ratio_dto_1 = require("./dto/ad-ratio.dto");
const stage_products_dto_1 = require("./dto/stage-products.dto");
const auth_guard_1 = require("../auth/auth.guard");
let AdAnalysisController = class AdAnalysisController {
    adAnalysisService;
    constructor(adAnalysisService) {
        this.adAnalysisService = adAnalysisService;
    }
    async getAdTrend(query, res) {
        const { shopID, shopName, customCategory } = query;
        if (!shopID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'shopID 参数不能为空',
                error: 'shopID 参数不能为空',
            });
        }
        if (!shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'shopName 参数不能为空',
                error: 'shopName 参数不能为空',
            });
        }
        if (customCategory !== undefined && customCategory !== null && customCategory.trim() === '') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'customCategory 参数不能为空字符串',
                error: 'customCategory 参数不能为空字符串',
            });
        }
        try {
            const data = await this.adAnalysisService.getAdTrend30Days(shopID, shopName, customCategory);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '查询成功',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '查询失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    async getAdRatio(query, res) {
        const { shopID, date, shopName, customCategory } = query;
        if (!shopID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'shopID 参数不能为空',
                message: 'shopID 参数不能为空',
            });
        }
        if (!date) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'date 参数不能为空',
                message: 'date 参数不能为空',
            });
        }
        if (!shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'shopName 参数不能为空',
                message: 'shopName 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '日期格式错误',
                message: '日期格式应为 YYYY-MM-DD',
            });
        }
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '日期格式错误',
                message: '日期格式应为 YYYY-MM-DD',
            });
        }
        if (customCategory !== undefined && customCategory !== null && customCategory.trim() === '') {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'customCategory 参数不能为空字符串',
                message: 'customCategory 参数不能为空字符串',
            });
        }
        try {
            const data = await this.adAnalysisService.getAdRatioByDate(shopID, date, shopName, customCategory);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '查询成功',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误',
                message: '查询失败',
            });
        }
    }
    async getStageProducts(query, res) {
        const { shopID, date, stage, shopName, customCategory, page, pageSize, sortBy, sortOrder, } = query;
        if (!shopID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'shopID 参数不能为空',
                message: 'shopID 参数不能为空',
            });
        }
        if (!date) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'date 参数不能为空',
                message: 'date 参数不能为空',
            });
        }
        if (!stage) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: 'stage 参数不能为空',
                message: 'stage 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '日期格式错误',
                message: '日期格式应为 YYYY-MM-DD',
            });
        }
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '日期格式错误',
                message: '日期格式应为 YYYY-MM-DD',
            });
        }
        const validStages = [
            'product_stage',
            'testing_stage',
            'potential_stage',
            'abandoned_stage',
            'no_stage',
        ];
        if (!validStages.includes(stage)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '阶段参数无效',
                message: '阶段参数应为 product_stage, testing_stage, potential_stage, abandoned_stage, no_stage 之一',
            });
        }
        const validPageSizes = [10, 20, 50, 100];
        if (pageSize !== undefined) {
            const pageSizeNum = Number(pageSize);
            if (isNaN(pageSizeNum) || !validPageSizes.includes(pageSizeNum)) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: '参数错误：pageSize 必须是 10, 20, 50, 100 之一',
                    message: '参数验证失败',
                });
            }
        }
        if (page !== undefined) {
            const pageNum = Number(page);
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: '参数错误：page 必须是大于等于 1 的整数',
                    message: '参数验证失败',
                });
            }
        }
        if (sortBy !== undefined) {
            const validSortBy = ['ad_spend', 'ad_sales', 'roi'];
            if (!validSortBy.includes(sortBy)) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: '参数错误：sortBy 必须是 ad_spend, ad_sales, roi 之一',
                    message: '参数验证失败',
                });
            }
        }
        if (sortOrder !== undefined) {
            const validSortOrder = ['asc', 'desc'];
            if (!validSortOrder.includes(sortOrder)) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: '参数错误：sortOrder 必须是 asc, desc 之一',
                    message: '参数验证失败',
                });
            }
        }
        try {
            const data = await this.adAnalysisService.getStageProducts(shopID, date, stage, shopName, customCategory, page !== undefined ? Number(page) : undefined, pageSize !== undefined ? Number(pageSize) : undefined, sortBy, sortOrder);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '查询成功',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error instanceof Error ? error.message : '未知错误',
                message: '查询失败，请稍后重试',
            });
        }
    }
};
exports.AdAnalysisController = AdAnalysisController;
__decorate([
    (0, common_1.Get)('ad-trend'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ad_trend_dto_1.AdTrendDto, Object]),
    __metadata("design:returntype", Promise)
], AdAnalysisController.prototype, "getAdTrend", null);
__decorate([
    (0, common_1.Get)('ad-ratio'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ad_ratio_dto_1.AdRatioDto, Object]),
    __metadata("design:returntype", Promise)
], AdAnalysisController.prototype, "getAdRatio", null);
__decorate([
    (0, common_1.Get)('stage-products'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stage_products_dto_1.StageProductsDto, Object]),
    __metadata("design:returntype", Promise)
], AdAnalysisController.prototype, "getStageProducts", null);
exports.AdAnalysisController = AdAnalysisController = __decorate([
    (0, common_1.Controller)('ad-analysis'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [ad_analysis_service_1.AdAnalysisService])
], AdAnalysisController);
//# sourceMappingURL=ad-analysis.controller.js.map
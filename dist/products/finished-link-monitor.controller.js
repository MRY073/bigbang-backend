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
exports.FinishedLinkMonitorController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const finished_link_monitor_dto_1 = require("./dto/finished-link-monitor.dto");
const monitor_chart_dto_1 = require("./dto/monitor-chart.dto");
const save_analysis_dto_1 = require("./dto/save-analysis.dto");
const auth_guard_1 = require("../auth/auth.guard");
let FinishedLinkMonitorController = class FinishedLinkMonitorController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getFinishedLinkMonitor(query, res) {
        const { shopID, shopName, customCategory } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const data = await this.productsService.getFinishedLinkMonitorData(shopID, shopName, customCategory);
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
    async getFinishedLinkMonitorChart(query, res) {
        const { shopID, shopName, productID, startDate, endDate } = query;
        if (!shopID || !shopName || !productID || !startDate || !endDate) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID、shopName、productID、startDate 和 endDate 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'startDate 和 endDate 参数格式错误，应为 YYYY-MM-DD 格式',
            });
        }
        try {
            const data = await this.productsService.getFinishedLinkMonitorChartData(shopID, shopName, productID, startDate, endDate);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '查询成功',
                data,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            if (errorMessage.includes('不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: '查询失败',
                    error: errorMessage,
                });
            }
            if (errorMessage.includes('格式') || errorMessage.includes('范围') || errorMessage.includes('不能')) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: '查询失败',
                    error: errorMessage,
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '查询失败',
                error: errorMessage,
            });
        }
    }
    async saveFinishedLinkMonitorAnalysis(body, res) {
        const { shopID, shopName, productID, analysis, improvementPlan } = body;
        if (!shopID || !shopName || !productID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID、shopName 和 productID 参数不能为空',
            });
        }
        if (analysis && analysis.length > 10000) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'analysis 长度不能超过10000字符',
            });
        }
        if (improvementPlan && improvementPlan.length > 10000) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'improvementPlan 长度不能超过10000字符',
            });
        }
        try {
            await this.productsService.saveFinishedLinkMonitorAnalysis(shopID, shopName, productID, analysis, improvementPlan);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '保存成功',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            if (errorMessage.includes('不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: '保存失败',
                    error: errorMessage,
                });
            }
            if (errorMessage.includes('必填') || errorMessage.includes('长度')) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: '保存失败',
                    error: errorMessage,
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '保存失败',
                error: errorMessage,
            });
        }
    }
};
exports.FinishedLinkMonitorController = FinishedLinkMonitorController;
__decorate([
    (0, common_1.Get)('link/monitor/list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finished_link_monitor_dto_1.FinishedLinkMonitorDto, Object]),
    __metadata("design:returntype", Promise)
], FinishedLinkMonitorController.prototype, "getFinishedLinkMonitor", null);
__decorate([
    (0, common_1.Get)('link/monitor/chart'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitor_chart_dto_1.FinishedLinkMonitorChartDto, Object]),
    __metadata("design:returntype", Promise)
], FinishedLinkMonitorController.prototype, "getFinishedLinkMonitorChart", null);
__decorate([
    (0, common_1.Post)('link/monitor/save-analysis'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_analysis_dto_1.SaveAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], FinishedLinkMonitorController.prototype, "saveFinishedLinkMonitorAnalysis", null);
exports.FinishedLinkMonitorController = FinishedLinkMonitorController = __decorate([
    (0, common_1.Controller)('finished'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], FinishedLinkMonitorController);
//# sourceMappingURL=finished-link-monitor.controller.js.map
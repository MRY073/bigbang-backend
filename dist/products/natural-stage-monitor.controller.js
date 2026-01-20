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
exports.NaturalStageMonitorController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const natural_stage_monitor_dto_1 = require("./dto/natural-stage-monitor.dto");
const monitor_chart_dto_1 = require("./dto/monitor-chart.dto");
const save_analysis_dto_1 = require("./dto/save-analysis.dto");
const auth_guard_1 = require("../auth/auth.guard");
let NaturalStageMonitorController = class NaturalStageMonitorController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getNaturalStageMonitor(query, res) {
        const { shopID, shopName, customCategory } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const data = await this.productsService.getNaturalStageMonitorData(shopID, shopName, customCategory);
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
    async getNaturalStageAISuggestion(query, res) {
        const { shopID, shopName, date, productID, productName } = query;
        if (!shopID || !shopName || !date || !productID || !productName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID、shopName、date、productID 和 productName 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2024-01-15）',
            });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'date 参数不是有效的日期',
            });
        }
        try {
            const data = await this.productsService.getNaturalStageAISuggestion(shopID, shopName, date, productID, productName);
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
    async batchNaturalStageAISuggestion(body, res) {
        const { shopID, shopName, date } = body;
        if (!shopID || !shopName || !date) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID、shopName 和 date 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2024-01-15）',
            });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'date 参数不是有效的日期',
            });
        }
        try {
            const data = await this.productsService.batchNaturalStageAISuggestion(shopID, shopName, date);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '任务创建成功',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '任务创建失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    async getNaturalStageMonitorChart(query, res) {
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
            const data = await this.productsService.getNaturalStageMonitorChartData(shopID, shopName, productID, startDate, endDate);
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
    async saveNaturalStageMonitorAnalysis(body, res) {
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
            await this.productsService.saveNaturalStageMonitorAnalysis(shopID, shopName, productID, analysis, improvementPlan);
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
exports.NaturalStageMonitorController = NaturalStageMonitorController;
__decorate([
    (0, common_1.Get)('stage/monitor/list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [natural_stage_monitor_dto_1.NaturalStageMonitorDto, Object]),
    __metadata("design:returntype", Promise)
], NaturalStageMonitorController.prototype, "getNaturalStageMonitor", null);
__decorate([
    (0, common_1.Get)('stage/monitor/ai-suggestion'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [natural_stage_monitor_dto_1.NaturalStageAISuggestionDto, Object]),
    __metadata("design:returntype", Promise)
], NaturalStageMonitorController.prototype, "getNaturalStageAISuggestion", null);
__decorate([
    (0, common_1.Post)('stage/monitor/batch-ai-suggestion'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [natural_stage_monitor_dto_1.BatchNaturalStageAISuggestionDto, Object]),
    __metadata("design:returntype", Promise)
], NaturalStageMonitorController.prototype, "batchNaturalStageAISuggestion", null);
__decorate([
    (0, common_1.Get)('stage/monitor/chart'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [monitor_chart_dto_1.NaturalStageMonitorChartDto, Object]),
    __metadata("design:returntype", Promise)
], NaturalStageMonitorController.prototype, "getNaturalStageMonitorChart", null);
__decorate([
    (0, common_1.Post)('stage/monitor/save-analysis'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [save_analysis_dto_1.SaveAnalysisDto, Object]),
    __metadata("design:returntype", Promise)
], NaturalStageMonitorController.prototype, "saveNaturalStageMonitorAnalysis", null);
exports.NaturalStageMonitorController = NaturalStageMonitorController = __decorate([
    (0, common_1.Controller)('natural'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], NaturalStageMonitorController);
//# sourceMappingURL=natural-stage-monitor.controller.js.map
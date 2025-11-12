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
exports.PotentialLinkMonitorController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const potential_link_monitor_dto_1 = require("./dto/potential-link-monitor.dto");
const auth_guard_1 = require("../auth/auth.guard");
let PotentialLinkMonitorController = class PotentialLinkMonitorController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getPotentialLinkMonitor(query, res) {
        const { shopID, shopName, date } = query;
        if (!shopID || !shopName || !date) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'shopID、shopName 和 date 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2025-11-08）',
            });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'date 参数不是有效的日期',
            });
        }
        try {
            const data = await this.productsService.getPotentialLinkMonitorData(shopID, shopName, date);
            return res.status(common_1.HttpStatus.OK).json({
                code: 200,
                message: 'success',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: 500,
                message: '查询失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    async getPotentialLinkAISuggestion(query, res) {
        const { shopID, shopName, date, productID, productName } = query;
        if (!shopID || !shopName || !date || !productID || !productName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'shopID、shopName、date、productID 和 productName 参数不能为空',
            });
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'date 参数格式错误，应为 YYYY-MM-DD 格式（如：2025-11-08）',
            });
        }
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                code: 400,
                message: 'date 参数不是有效的日期',
            });
        }
        try {
            const data = await this.productsService.getPotentialLinkAISuggestion(shopID, shopName, date, productID, productName);
            return res.status(common_1.HttpStatus.OK).json({
                code: 200,
                message: 'success',
                data,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: 500,
                message: '查询失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
};
exports.PotentialLinkMonitorController = PotentialLinkMonitorController;
__decorate([
    (0, common_1.Get)('link/monitor/list'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [potential_link_monitor_dto_1.PotentialLinkMonitorDto, Object]),
    __metadata("design:returntype", Promise)
], PotentialLinkMonitorController.prototype, "getPotentialLinkMonitor", null);
__decorate([
    (0, common_1.Get)('link/monitor/ai-suggestion'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [potential_link_monitor_dto_1.PotentialLinkAISuggestionDto, Object]),
    __metadata("design:returntype", Promise)
], PotentialLinkMonitorController.prototype, "getPotentialLinkAISuggestion", null);
exports.PotentialLinkMonitorController = PotentialLinkMonitorController = __decorate([
    (0, common_1.Controller)('potential'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], PotentialLinkMonitorController);
//# sourceMappingURL=potential-link-monitor.controller.js.map
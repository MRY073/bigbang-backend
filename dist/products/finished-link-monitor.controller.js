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
const auth_guard_1 = require("../auth/auth.guard");
let FinishedLinkMonitorController = class FinishedLinkMonitorController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getFinishedLinkMonitor(query, res) {
        const { shopID, shopName, date, customCategory } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        if (!date) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'date 参数不能为空',
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
            const data = await this.productsService.getFinishedLinkMonitorData(shopID, shopName, date, customCategory);
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
exports.FinishedLinkMonitorController = FinishedLinkMonitorController = __decorate([
    (0, common_1.Controller)('finished'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], FinishedLinkMonitorController);
//# sourceMappingURL=finished-link-monitor.controller.js.map
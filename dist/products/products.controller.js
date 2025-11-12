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
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const query_products_dto_1 = require("./dto/query-products.dto");
const update_stage_dto_1 = require("./dto/update-stage.dto");
const testing_monitor_dto_1 = require("./dto/testing-monitor.dto");
const auth_guard_1 = require("../auth/auth.guard");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProducts(query, res) {
        const { shopID, shopName } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const products = await this.productsService.getProductsByShop(shopID, shopName);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '查询成功',
                data: products,
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
    async updateStage(body, res) {
        const { product_id, shopID, shopName, stage_type, start_time, end_time } = body;
        if (!product_id || !shopID || !shopName || !stage_type) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'product_id、shopID、shopName 和 stage_type 参数不能为空',
            });
        }
        const validStageTypes = ['testing', 'potential', 'product', 'abandoned'];
        if (!validStageTypes.includes(stage_type)) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: `stage_type 必须是以下值之一：${validStageTypes.join(', ')}`,
            });
        }
        try {
            const result = await this.productsService.updateProductStage(product_id, shopID, shopName, stage_type, start_time, end_time);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: result.message,
                data: result,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '更新失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
    async getTestingMonitor(query, res) {
        const { shopID, shopName } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const data = await this.productsService.getTestingMonitorData(shopID, shopName);
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
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_products_dto_1.QueryProductsDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Put)('stage'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_stage_dto_1.UpdateStageDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "updateStage", null);
__decorate([
    (0, common_1.Get)('testing-monitor'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [testing_monitor_dto_1.TestingMonitorDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getTestingMonitor", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map
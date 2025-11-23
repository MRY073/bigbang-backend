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
exports.ProductItemsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const query_product_items_dto_1 = require("./dto/query-product-items.dto");
const update_custom_category_dto_1 = require("./dto/update-custom-category.dto");
const update_product_status_dto_1 = require("./dto/update-product-status.dto");
const update_competitor_info_dto_1 = require("./dto/update-competitor-info.dto");
const auth_guard_1 = require("../auth/auth.guard");
let ProductItemsController = class ProductItemsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getCustomCategories(shopID, res) {
        const trimmedShopID = shopID?.trim();
        if (!trimmedShopID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 参数不能为空',
            });
        }
        try {
            const categories = await this.productsService.getCustomCategories(trimmedShopID);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error('获取自定义分类失败:', message);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message,
            });
        }
    }
    async getProductItems(query, res) {
        const { shopID, shopName, page, pageSize, customCategory } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const result = await this.productsService.getProductItems(shopID, shopName, page, pageSize, customCategory);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: `拉取成功，共 ${result.total} 条数据`,
                data: result.data,
                total: result.total,
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('获取商品列表失败:', safeMessage);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: safeMessage || '获取商品列表失败',
            });
        }
    }
    async updateProductItem(id, body, res) {
        try {
            const updatedProduct = await this.productsService.updateProductItemCustomCategory(id, body);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '保存成功',
                data: updatedProduct,
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('更新商品分类失败:', safeMessage);
            const errorMessage = safeMessage || '更新商品分类失败';
            if (errorMessage.includes('商品不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: '商品不存在',
                    message: '无法找到指定的商品',
                });
            }
            if (errorMessage.includes('prompt_note') ||
                errorMessage.includes('不能超过') ||
                errorMessage.includes('必须是字符串')) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: '参数错误',
                    message: errorMessage,
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: errorMessage,
            });
        }
    }
    async deleteProductItem(id, res) {
        try {
            const deleted = await this.productsService.deleteProductItem(id);
            if (!deleted) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: '商品不存在',
                    message: '无法找到指定的商品',
                });
            }
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '删除成功',
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('删除商品失败:', safeMessage);
            const errorMessage = safeMessage || '删除商品失败';
            if (errorMessage.includes('商品不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: '商品不存在',
                    message: '无法找到指定的商品',
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: errorMessage,
            });
        }
    }
    async getOfflineProducts(query, res) {
        const { shopID, shopName, page, pageSize, customCategory } = query;
        if (!shopID || !shopName) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'shopID 和 shopName 参数不能为空',
            });
        }
        try {
            const result = await this.productsService.getOfflineProducts(shopID, shopName, page, pageSize, customCategory);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: `拉取成功，共 ${result.total} 条下架商品数据`,
                data: result.data,
                total: result.total,
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('获取下架商品列表失败:', safeMessage);
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: safeMessage || '获取下架商品列表失败',
            });
        }
    }
    async updateProductStatus(id, body, res) {
        const { status } = body;
        if (status !== 0 && status !== 1) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                error: '参数错误',
                message: 'status 必须是 0（上架）或 1（下架）',
            });
        }
        try {
            const updatedProduct = await this.productsService.updateProductStatus(id, status);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: status === 1 ? '商品已下架' : '商品已上架',
                data: updatedProduct,
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('更新商品状态失败:', safeMessage);
            const errorMessage = safeMessage || '更新商品状态失败';
            if (errorMessage.includes('商品不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: '商品不存在',
                    message: '无法找到指定的商品',
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: errorMessage,
            });
        }
    }
    async updateCompetitorInfo(id, body, res) {
        try {
            const updatedProduct = await this.productsService.updateProductCompetitorInfo(id, body);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '竞争对手信息更新成功',
                data: updatedProduct,
            });
        }
        catch (error) {
            const safeMessage = error instanceof Error ? error.message : String(error);
            console.error('更新竞争对手信息失败:', safeMessage);
            const errorMessage = safeMessage || '更新竞争对手信息失败';
            if (errorMessage.includes('商品不存在')) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: '商品不存在',
                    message: '无法找到指定的商品',
                });
            }
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: '服务器错误',
                message: errorMessage,
            });
        }
    }
};
exports.ProductItemsController = ProductItemsController;
__decorate([
    (0, common_1.Get)('custom-categories'),
    __param(0, (0, common_1.Query)('shopID')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "getCustomCategories", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_product_items_dto_1.QueryProductItemsDto, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "getProductItems", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_custom_category_dto_1.UpdateCustomCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "updateProductItem", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "deleteProductItem", null);
__decorate([
    (0, common_1.Get)('offline'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_product_items_dto_1.QueryProductItemsDto, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "getOfflineProducts", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_status_dto_1.UpdateProductStatusDto, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "updateProductStatus", null);
__decorate([
    (0, common_1.Put)(':id/competitor-info'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_competitor_info_dto_1.UpdateCompetitorInfoDto, Object]),
    __metadata("design:returntype", Promise)
], ProductItemsController.prototype, "updateCompetitorInfo", null);
exports.ProductItemsController = ProductItemsController = __decorate([
    (0, common_1.Controller)('product-items'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductItemsController);
//# sourceMappingURL=product-items.controller.js.map
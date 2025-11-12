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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const upload_service_1 = require("./upload.service");
const upload_dto_1 = require("./dto/upload.dto");
const auth_guard_1 = require("../auth/auth.guard");
let UploadController = class UploadController {
    uploadService;
    constructor(uploadService) {
        this.uploadService = uploadService;
    }
    async upload(files, body, res) {
        if (!files || files.length === 0) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: '请上传至少一个文件',
            });
        }
        const { type, shopName, shopID } = body;
        if (!type || !shopName || !shopID) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'type、shopName 和 shopID 参数不能为空',
            });
        }
        try {
            const uploadEntities = await this.uploadService.saveMultipleUploads(files, type, shopName, shopID);
            return res.status(common_1.HttpStatus.OK).json({
                success: true,
                message: '上传成功',
                data: uploadEntities,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: '上传失败',
                error: error instanceof Error ? error.message : '未知错误',
            });
        }
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 100)),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, upload_dto_1.UploadDto, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "upload", null);
exports.UploadController = UploadController = __decorate([
    (0, common_1.Controller)('upload'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [upload_service_1.UploadService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map
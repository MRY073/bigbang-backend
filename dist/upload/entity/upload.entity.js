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
exports.UploadEntity = void 0;
const typeorm_1 = require("typeorm");
let UploadEntity = class UploadEntity {
    id;
    originalName;
    filePath;
    mimeType;
    fileSize;
    type;
    shop;
    createdAt;
    updatedAt;
};
exports.UploadEntity = UploadEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UploadEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: '文件原始名称' }),
    __metadata("design:type", String)
], UploadEntity.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, comment: '文件存储路径' }),
    __metadata("design:type", String)
], UploadEntity.prototype, "filePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '文件类型（MIME类型）' }),
    __metadata("design:type", String)
], UploadEntity.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', comment: '文件大小（字节）' }),
    __metadata("design:type", Number)
], UploadEntity.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: '上传类型参数' }),
    __metadata("design:type", String)
], UploadEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, comment: '店铺参数' }),
    __metadata("design:type", String)
], UploadEntity.prototype, "shop", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ comment: '创建时间' }),
    __metadata("design:type", Date)
], UploadEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ comment: '更新时间' }),
    __metadata("design:type", Date)
], UploadEntity.prototype, "updatedAt", void 0);
exports.UploadEntity = UploadEntity = __decorate([
    (0, typeorm_1.Entity)('uploads')
], UploadEntity);
//# sourceMappingURL=upload.entity.js.map
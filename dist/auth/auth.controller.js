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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login(body, res) {
        const { username, password } = body || {};
        if (!this.authService.validateCredentials(username, password)) {
            return res.status(common_1.HttpStatus.OK).json({
                success: false,
                message: '用户名或密码错误111',
            });
        }
        const token = this.authService.createAuthToken(username);
        res.cookie('auth_token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(common_1.HttpStatus.OK).json({
            success: true,
            username: username,
            nickname: username,
            roles: ['admin'],
            permissions: ['*:*:*'],
            message: '登录成功',
        });
    }
    me(req, res) {
        const token = req.cookies?.['auth_token'];
        if (!this.authService.validateToken(token)) {
            return res
                .status(common_1.HttpStatus.UNAUTHORIZED)
                .json({ success: false, message: '未登录' });
        }
        return res.status(common_1.HttpStatus.OK).json({ success: true, message: '已登录' });
    }
    logout(res) {
        res.clearCookie('auth_token', {
            httpOnly: true,
            path: '/',
        });
        return res.status(common_1.HttpStatus.OK).json({
            success: true,
            message: '登出成功',
        });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Request, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
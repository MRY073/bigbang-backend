"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
let AuthService = class AuthService {
    validateToken(token) {
        if (!token)
            return false;
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf8');
            const [username, tsStr] = decoded.split(':');
            const ts = Number(tsStr || 0);
            if (!this.validUsers.some((u) => u.username === username))
                return false;
            const maxAge = 7 * 24 * 60 * 60 * 1000;
            if (!ts || Date.now() - ts > maxAge)
                return false;
            return true;
        }
        catch {
            return false;
        }
    }
    validUsers = [
        { username: 'YANGYIWEI', password: 'Q8@xM2f#T9' },
        { username: 'YANGDONG', password: 'zL4!pC7&Rq' },
        { username: 'WUJIANMEI', password: 'H5$kV9m*W3' },
    ];
    validateCredentials(username, password) {
        return this.validUsers.some((u) => u.username === username && u.password === password);
    }
    createAuthToken(username) {
        return Buffer.from(`${username}:${Date.now()}`).toString('base64');
    }
    refreshToken(oldToken) {
        if (!this.validateToken(oldToken))
            return null;
        try {
            const decoded = Buffer.from(oldToken, 'base64').toString('utf8');
            const [username] = decoded.split(':');
            return this.createAuthToken(username);
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map
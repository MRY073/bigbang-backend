"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const upload_module_1 = require("./upload/upload.module");
const products_module_1 = require("./products/products.module");
const ad_analysis_module_1 = require("./ad-analysis/ad-analysis.module");
const database_module_1 = require("./database/database.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'mysql',
                host: 'localhost',
                port: 3306,
                username: 'root',
                password: 'Rulener@1207',
                database: 'bigbangShopee',
                autoLoadEntities: true,
                synchronize: true,
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'frontend', 'dist'),
                exclude: [
                    '/api/:path*',
                    '/auth/:path*',
                    '/products/:path*',
                    '/upload/:path*',
                    '/ad-analysis/:path*',
                ],
                renderPath: /^(?!\/api|\/auth|\/products|\/upload|\/ad-analysis).*/,
                serveStaticOptions: {
                    index: 'index.html',
                },
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            upload_module_1.UploadModule,
            products_module_1.ProductsModule,
            ad_analysis_module_1.AdAnalysisModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
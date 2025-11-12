"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, cookie_parser_1.default)());
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
        app.setGlobalPrefix('api');
        await app.listen(80);
    }
    else {
        await app.listen(3000);
    }
}
bootstrap().catch((error) => {
    console.error('应用启动失败:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
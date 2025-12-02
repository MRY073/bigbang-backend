import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // <-- 启用 cookie 解析
  
  // 根据配置设置全局前缀和端口
  if (appConfig.isProduction) {
    app.setGlobalPrefix('api');
    await app.listen(80);
  } else {
    await app.listen(appConfig.port);
  }
}
bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});

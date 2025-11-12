import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // <-- 启用 cookie 解析

  // 根据环境变量设置全局前缀
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.setGlobalPrefix('api');
    await app.listen(80);
  } else {
    await app.listen(3000);
  }
}
bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});

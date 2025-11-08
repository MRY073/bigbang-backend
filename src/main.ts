import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // <-- 启用 cookie 解析
  await app.listen(3000);
}
bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});

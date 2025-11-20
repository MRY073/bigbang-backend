import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { ProductsModule } from './products/products.module';
import { AdAnalysisModule } from './ad-analysis/ad-analysis.module';
// import { StatsModule } from './stats/stats.module';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './ai/ai.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Rulener@1207',
      database: 'bigbangShopee',
      autoLoadEntities: true,
      synchronize: true, // 开发阶段自动创建表
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
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
    DatabaseModule, // MySQL 数据库操作模块
    AuthModule,
    UploadModule,
    ProductsModule,
    AdAnalysisModule,
    AiModule, // AI 服务模块（系统提示词）
    // StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

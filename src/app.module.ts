import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
// import { StatsModule } from './stats/stats.module';
import { DatabaseModule } from './database/database.module';

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
    DatabaseModule, // MySQL 数据库操作模块
    AuthModule,
    UploadModule,
    // StatsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

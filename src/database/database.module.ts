import { Module, Global } from '@nestjs/common';
import { MysqlService } from './mysql.service';

/**
 * 数据库模块
 * 使用 @Global() 装饰器使此模块全局可用
 */
@Global()
@Module({
  providers: [MysqlService],
  exports: [MysqlService],
})
export class DatabaseModule {}

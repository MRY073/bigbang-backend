import { Module } from '@nestjs/common';
// TODO: 未来启用数据库时取消注释
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { UploadEntity } from './entity/upload.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  // TODO: 未来启用数据库时取消注释
  // imports: [TypeOrmModule.forFeature([UploadEntity])],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

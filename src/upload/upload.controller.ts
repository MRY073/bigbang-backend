import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { UploadDto } from './dto/upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10), // 支持多文件上传，最多10个文件（可根据需要调整）
  )
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UploadDto,
    @Res() res: Response,
  ) {
    console.log('进入上传函数');
    console.log('接收到的文件数量:', files?.length || 0);
    console.log('文件列表:', files);
    console.log('其他参数:', body);

    // 验证文件是否存在
    if (!files || files.length === 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '请上传至少一个文件',
      });
    }

    // 验证必需参数
    const { type, shop } = body;
    if (!type || !shop) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'type 和 shop 参数不能为空',
      });
    }

    try {
      // TODO: 伪代码 - 调用服务保存多个文件和信息到数据库（未来启用时取消注释）
      // const uploadEntities = await this.uploadService.saveMultipleUploads(
      //   files,
      //   type,
      //   shop,
      // );

      // 临时实现：返回模拟数据（用于调试）
      const uploadEntities = this.uploadService.saveMultipleUploads(
        files,
        type,
        shop,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: `上传成功（调试模式：未保存到数据库），共上传 ${uploadEntities.length} 个文件`,
        data: uploadEntities.map((entity) => ({
          id: entity.id,
          originalName: entity.originalName,
          filePath: entity.filePath,
          type: entity.type,
          shop: entity.shop,
          fileSize: entity.fileSize,
          createdAt: entity.createdAt,
        })),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: '上传失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }
}

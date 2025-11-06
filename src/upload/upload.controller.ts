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
      // 调用服务保存文件和处理数据
      const uploadEntities = await this.uploadService.saveMultipleUploads(
        files,
        type,
        shop,
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '上传成功',
        data: uploadEntities,
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

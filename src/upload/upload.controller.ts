import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  HttpStatus,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UploadService } from './upload.service';
import { UploadDto } from './dto/upload.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('upload')
@UseGuards(AuthGuard) // 保护整个控制器，所有路由都需要鉴权
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 100), // 支持多文件上传，最多100个文件（可根据需要调整）
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
    const { type, shopName, shopID } = body;
    if (!type || !shopName || !shopID) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'type、shopName 和 shopID 参数不能为空',
      });
    }

    try {
      // 调用服务保存文件和处理数据
      const uploadEntities = await this.uploadService.saveMultipleUploads(
        files,
        type,
        shopName,
        shopID,
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

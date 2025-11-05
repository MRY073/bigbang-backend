import { Injectable } from '@nestjs/common';
// TODO: 未来启用数据库时取消注释
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UploadEntity } from './entity/upload.entity';

@Injectable()
export class UploadService {
  // TODO: 未来启用数据库时取消注释
  // constructor(
  //   @InjectRepository(UploadEntity)
  //   private readonly uploadRepository: Repository<UploadEntity>,
  // ) {}

  // 保存单个文件（保留用于兼容）
  saveUpload(
    file: Express.Multer.File,
    type: string,
    shop: string,
  ): any {
    return this.saveMultipleUploads([file], type, shop)[0];
  }

  // 保存多个文件
  saveMultipleUploads(
    files: Express.Multer.File[],
    type: string,
    shop: string,
  ): any[] {
    // TODO: 伪代码 - 多文件存储逻辑（用于调试，不操作数据库）
    console.log(`开始处理 ${files.length} 个文件的上传`);
    console.log('文件信息:', files.map((f) => ({
      originalName: f.originalname,
      mimetype: f.mimetype,
      size: f.size,
    })));
    console.log('上传参数:', { type, shop });

    // TODO: 伪代码 - 多文件存储逻辑
    //
    // const uploadEntities = [];
    //
    // // 遍历每个文件进行处理
    // for (const file of files) {
    //   // 1. 为每个文件生成唯一存储路径
    //   //    - 根据 type 和 shop 创建目录结构: uploads/{type}/{shop}/
    //   //    - 生成唯一文件名: ${timestamp}-${randomString}-${originalName}
    //   //    - 完整路径: uploads/{type}/${shop}/${timestamp}-${randomString}-${originalName}
    //   const timestamp = Date.now();
    //   const randomString = Math.random().toString(36).substring(2, 15);
    //   const uniqueFileName = `${timestamp}-${randomString}-${file.originalname}`;
    //   const filePath = `uploads/${type}/${shop}/${uniqueFileName}`;
    //
    //   // 2. 将文件保存到本地存储
    //   //    - 使用 fs.writeFileSync 或 multer 的 diskStorage 配置
    //   //    - 确保目录存在，如果不存在则创建: fs.mkdirSync(dirPath, { recursive: true })
    //   //    - 写入文件到目标路径: fs.writeFileSync(filePath, file.buffer)
    //
    //   // 3. 将每个文件信息保存到数据库
    //   //    const uploadEntity = this.uploadRepository.create({
    //   //      originalName: file.originalname,
    //   //      filePath: filePath,
    //   //      mimeType: file.mimetype,
    //   //      fileSize: file.size,
    //   //      type,
    //   //      shop,
    //   //    });
    //   //    const savedEntity = await this.uploadRepository.save(uploadEntity);
    //   //    uploadEntities.push(savedEntity);
    // }
    //
    // // 4. 返回所有保存的文件实体
    // // return uploadEntities;

    // 临时返回模拟数据（用于调试）- 返回多个文件的数组
    return files.map((file, index) => ({
      id: Date.now() + index, // 模拟ID（每个文件不同）
      originalName: file.originalname,
      filePath: `uploads/${type}/${shop}/${file.originalname}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      type,
      shop,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }
}

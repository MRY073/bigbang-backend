import { Injectable } from '@nestjs/common';
// TODO: 未来启用数据库时取消注释
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UploadEntity } from './entity/upload.entity';
import { MysqlService } from '../database/mysql.service';

// 定义 upsert 操作返回类型
interface UpsertProductResult {
  action: 'updated' | 'inserted';
  id: number;
  product_id: string;
  product_name: string;
  shop_name: string;
  affectedRows?: number;
}

@Injectable()
export class UploadService {
  constructor(private readonly mysqlService: MysqlService) {}

  // 保存单个文件（保留用于兼容）
  async saveUpload(
    file: Express.Multer.File,
    type: string,
    shop: string,
  ): Promise<any> {
    const results = await this.saveMultipleUploads([file], type, shop);
    return results[0];
  }

  // 保存多个文件
  async saveMultipleUploads(
    files: Express.Multer.File[],
    type: string,
    shop: string,
  ): Promise<any[]> {
    // 根据 type 类型进行不同的处理
    if (type === 'productID') {
      // 处理商品ID类型的上传
      console.log('处理商品ID类型的上传-productID');
      return await this.handleProductIDUpload(files, shop);
    }
    console.log('其他类型的处理-default');

    // 其他类型的处理（默认处理）
    return this.handleDefaultUpload(files, type, shop);
  }

  /**
   * 处理 productID 类型的上传
   * 更新或插入 product_items 表
   */
  async handleProductIDUpload(
    files: Express.Multer.File[],
    shopName: string,
  ): Promise<any[]> {
    const results: any[] = [];
    console.log('进入函数handleProductIDUpload', shopName);
    // 处理单个文件
    const file = files[0];
    console.log('file', file);
    try {
      // 解析 CSV 文件内容（UTF-8 编码）
      const fileContent = file.buffer.toString('utf-8');
      const productData = this.parseProductFile(fileContent);
      console.log('productData', productData);
      // 处理每个商品数据
      for (const product of productData) {
        const result: UpsertProductResult = await this.upsertProductItem(
          shopName,
          product,
        );
        results.push(result);
      }
    } catch (error) {
      console.error(`处理文件 ${file.originalname} 时出错:`, error);
      results.push({
        error: `处理文件 ${file.originalname} 失败`,
        message: error instanceof Error ? error.message : '未知错误',
      });
    }
    return results;
  }

  /**
   * 解析商品文件内容（CSV 格式）
   * 表头格式：产品ID,产品名称,产品图片
   * 产品图片字段可能包含多个链接（用逗号分隔），只取第一个作为主图
   */
  private parseProductFile(content: string): Array<{
    product_id: string;
    product_name: string;
    product_image?: string | null;
  }> {
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV 文件为空');
    }

    // 第一行是表头：产品ID,产品名称,产品图片
    const headerLine = lines[0].trim();
    const headers = headerLine.split(',').map((h) => h.trim());

    // 查找字段索引（支持中文表头）
    const productIdIndex = headers.findIndex(
      (h) => h === '产品ID' || h.toLowerCase() === 'product_id',
    );
    const productNameIndex = headers.findIndex(
      (h) => h === '产品名称' || h.toLowerCase() === 'product_name',
    );
    const productImageIndex = headers.findIndex(
      (h) => h === '产品图片' || h.toLowerCase() === 'product_image',
    );

    if (productIdIndex === -1) {
      throw new Error('CSV 文件必须包含"产品ID"列');
    }
    if (productNameIndex === -1) {
      throw new Error('CSV 文件必须包含"产品名称"列');
    }

    // 解析数据行
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map((v) => v.trim());
      const productId = values[productIdIndex].trim() || '';
      const productName = values[productNameIndex] || '';

      // 处理产品图片：如果有多个链接（用逗号分隔），只取第一个
      let productImage: string | null = null;
      if (productImageIndex !== -1 && values[productImageIndex]) {
        const imageValue = values[productImageIndex].trim();
        if (imageValue) {
          // 如果包含逗号，取第一个链接
          const firstImage = imageValue.split(',')[0].trim();
          productImage = firstImage || null;
        }
      }

      // 验证必需字段
      if (!productId) {
        throw new Error(`第 ${index + 2} 行的产品ID不能为空`);
      }
      if (!productName) {
        throw new Error(`第 ${index + 2} 行的产品名称不能为空`);
      }

      return {
        product_id: productId,
        product_name: productName,
        product_image: productImage,
      };
    });
  }

  /**
   * 更新或插入商品信息到 product_items 表
   * 如果 shop_name 和 product_id 都匹配，则更新；否则插入
   */
  async upsertProductItem(
    shopName: string,
    product: {
      product_id: string;
      product_name: string;
      product_image?: string | null;
    },
  ): Promise<UpsertProductResult> {
    // 查找是否存在相同 shop_name 和 product_id 的记录
    const existing = await this.mysqlService.queryOne<{
      id: number;
      product_id: string;
      product_name: string;
      product_image: string | null;
      shop_name: string;
    }>('SELECT * FROM product_items WHERE shop_name = ? AND product_id = ?', [
      shopName,
      product.product_id,
    ]);
    if (existing) {
      // 如果存在，更新记录
      const affectedRows = await this.mysqlService.update(
        'product_items',
        {
          product_name: product.product_name,
          product_image: product.product_image || null,
        },
        {
          shop_name: shopName,
          product_id: product.product_id,
        },
      );

      return {
        action: 'updated',
        id: existing.id,
        product_id: product.product_id,
        product_name: product.product_name,
        shop_name: shopName,
        affectedRows,
      };
    } else {
      // 如果不存在，插入新记录
      const insertId = await this.mysqlService.insert('product_items', {
        product_id: product.product_id,
        product_name: product.product_name,
        product_image: product.product_image || null,
        shop_name: shopName,
      });

      return {
        action: 'inserted',
        id: insertId,
        product_id: product.product_id,
        product_name: product.product_name,
        shop_name: shopName,
      };
    }
  }

  /**
   * 处理默认类型的上传（保留原有逻辑）
   */
  private handleDefaultUpload(
    files: Express.Multer.File[],
    type: string,
    shop: string,
  ): any[] {
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

    // 临时返回模拟数据（用于调试）
    return files.map((file, index) => ({
      id: Date.now() + index,
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

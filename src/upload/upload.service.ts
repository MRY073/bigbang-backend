import { Injectable } from '@nestjs/common';
// TODO: 未来启用数据库时取消注释
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { UploadEntity } from './entity/upload.entity';
import { MysqlService } from '../database/mysql.service';
import * as XLSX from 'xlsx';

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

    if (type === 'daily') {
      // 处理每日统计数据类型的上传
      console.log('处理每日统计数据类型的上传-daily');
      return await this.handleDailyStatsUpload(files, shop);
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
   * 验证文件名格式
   * 格式：parentskudetail.YYYYMMDD_YYYYMMDD
   * 两个日期必须相同且是一天
   */
  validateFileName(fileName: string): {
    valid: boolean;
    date?: string;
    error?: string;
  } {
    const pattern = /^parentskudetail\.(\d{8})_(\d{8})/;
    const match = fileName.match(pattern);

    if (!match) {
      return {
        valid: false,
        error: '文件名格式错误，应为：parentskudetail.YYYYMMDD_YYYYMMDD',
      };
    }

    const date1 = match[1];
    const date2 = match[2];

    // 验证两个日期是否相同
    if (date1 !== date2) {
      return {
        valid: false,
        error: '文件名中的两个日期必须相同',
      };
    }

    // 验证日期格式是否正确
    const year = parseInt(date1.substring(0, 4), 10);
    const month = parseInt(date1.substring(4, 6), 10);
    const day = parseInt(date1.substring(6, 8), 10);

    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return {
        valid: false,
        error: '文件名中的日期无效',
      };
    }

    // 转换为 YYYY-MM-DD 格式
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      valid: true,
      date: formattedDate,
    };
  }

  /**
   * 处理每日统计数据上传
   */
  async handleDailyStatsUpload(
    files: Express.Multer.File[],
    shop: string,
  ): Promise<any[]> {
    console.log('=== handleDailyStatsUpload 函数开始执行 ===');
    console.log('接收到的文件数量:', files?.length || 0);
    console.log('店铺名称:', shop);
    console.log('文件列表:', files?.map((f) => f.originalname) || []);

    // 第一步：验证所有文件名格式（在所有逻辑之前）
    console.log('\n--- 第一步：开始验证所有文件名格式 ---');
    const fileValidations: Array<{
      file: Express.Multer.File;
      validation: { valid: boolean; date?: string; error?: string };
    }> = [];

    for (const file of files) {
      console.log(`验证文件: ${file.originalname}`);
      const validation = this.validateFileName(file.originalname);
      console.log(`验证结果:`, validation);
      fileValidations.push({ file, validation });

      // 如果有任何文件验证失败，立即返回错误
      if (!validation.valid) {
        console.error(
          `❌ 文件名验证失败: ${file.originalname} - ${validation.error}`,
        );
        throw new Error(
          `文件名格式错误：${file.originalname} - ${validation.error}`,
        );
      }
      console.log(
        `✅ 文件名验证通过: ${file.originalname}, 解析日期: ${validation.date}`,
      );
    }

    console.log('✅ 所有文件名验证通过，共', fileValidations.length, '个文件');

    // 第二步：所有文件名验证通过后，才开始处理数据
    console.log('\n--- 第二步：开始处理文件数据 ---');
    const results: any[] = [];

    for (let i = 0; i < fileValidations.length; i++) {
      const { file, validation } = fileValidations[i];
      console.log(
        `\n处理第 ${i + 1}/${fileValidations.length} 个文件: ${file.originalname}`,
      );
      console.log(`文件大小: ${file.size} 字节`);
      console.log(`文件类型: ${file.mimetype}`);
      console.log(`解析出的日期: ${validation.date}`);

      try {
        console.log(`开始调用 uploadDailyStats 处理文件: ${file.originalname}`);
        // 解析 CSV 并上传数据
        const result = await this.uploadDailyStats(
          file,
          shop,
          validation.date!,
        );

        console.log(`✅ 文件处理成功: ${file.originalname}`);
        console.log(`处理结果:`, result);

        results.push({
          fileName: file.originalname,
          success: true,
          ...result,
        });

        console.log(`当前已处理结果数: ${results.length}`);
      } catch (error) {
        console.error(`❌ 处理文件 ${file.originalname} 时出错:`);
        console.error('错误详情:', error);
        throw error; // 抛出错误，让上层处理
      }
    }

    console.log('\n=== handleDailyStatsUpload 函数执行完成 ===');
    console.log(`总共处理了 ${results.length} 个文件`);
    console.log('最终结果:', results);

    return results;
  }

  /**
   * 解析每日统计数据 Excel 文件
   */
  private parseDailyStatsExcel(
    file: Express.Multer.File,
    shop: string,
    date: string,
  ): Array<Record<string, any>> {
    // 读取 Excel 文件
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0]; // 读取第一个工作表
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON 格式（第一行作为表头）
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // 使用数组格式，第一行是表头
      defval: null, // 空单元格默认为 null
    });

    if (!Array.isArray(jsonData)) {
      throw new Error('Excel 文件格式错误：无法解析为数组');
    }

    if (jsonData.length === 0) {
      throw new Error('Excel 文件为空');
    }

    // 第一行是表头（保留原始大小写）
    const firstRow = jsonData[0];
    if (!Array.isArray(firstRow)) {
      throw new Error('Excel 文件格式错误：第一行不是数组');
    }

    const headersOriginal = firstRow.map((h) => {
      if (h === null || h === undefined) {
        return '';
      }
      return String(h).trim();
    });
    const headers = headersOriginal.map((h) => h.toLowerCase());

    // 打印实际的表头，用于调试
    console.log('Excel 文件中的实际表头（原始）:', headersOriginal);
    console.log('Excel 文件中的实际表头（小写）:', headers);

    // 数据行（从第二行开始）
    const dataRows = jsonData.slice(1);

    // 构建字段映射表（Excel 表头 -> 数据库字段）
    // 这里需要根据实际的 Excel 表头来映射
    const fieldMapping = this.buildFieldMapping(headersOriginal, headers);

    // 解析数据行
    const parsedRows: Array<Record<string, any>> = [];

    dataRows.forEach((row, index) => {
      const rowData: Record<string, any> = {
        shop,
        date,
      };

      // 根据映射表提取数据
      if (!Array.isArray(row)) {
        return;
      }

      for (const [dbField, excelHeader] of Object.entries(fieldMapping)) {
        // 在原始表头中查找（保持大小写匹配）
        const headerIndex = headersOriginal.findIndex(
          (h) => h.toLowerCase() === excelHeader.toLowerCase(),
        );
        if (headerIndex !== -1 && row[headerIndex] !== undefined) {
          const value: unknown = row[headerIndex];
          rowData[dbField] = this.parseFieldValue(dbField, value);
        }
      }

      // 验证必需字段
      if (!rowData.product_id) {
        throw new Error(`第 ${index + 2} 行的 product_id 不能为空`);
      }
      if (!rowData.product_name) {
        throw new Error(`第 ${index + 2} 行的 product_name 不能为空`);
      }

      // 检查 visitors 字段是否为 "-"，如果是则跳过该行
      const visitorsValue: unknown = rowData.visitors;
      if (!visitorsValue) {
        console.log(`第 ${index + 2} 行的商品访客数不存在，跳过该行`);
        return; // 跳过该行，不添加到结果中
      }

      parsedRows.push(rowData);
    });

    return parsedRows;
  }

  /**
   * 构建字段映射表（数据库字段 -> Excel 表头）
   * 这个方法需要根据实际的 Excel 表头来调整
   */
  private buildFieldMapping(
    headersOriginal: string[],
    headersLower: string[],
  ): Record<string, string> {
    // 获取所有可能的字段名变体（使用精确匹配，避免部分匹配）
    const getHeader = (possibleNames: string[]): string | null => {
      for (let i = 0; i < headersLower.length; i++) {
        const lowerHeader = headersLower[i];
        const originalHeader = headersOriginal[i];
        for (const name of possibleNames) {
          // 只使用精确匹配，不包含部分匹配
          if (name.toLowerCase().trim() === lowerHeader.trim()) {
            return originalHeader; // 返回原始表头（保持大小写）
          }
        }
      }
      return null;
    };

    const mapping: Record<string, string> = {};

    // 定义数据库字段到 Excel 表头的可能匹配（根据用户提供的映射表）
    const fieldMappings: Record<string, string[]> = {
      product_id: ['商品编号'],
      product_name: ['商品'],
      current_item_status: ['Current Item Status', '商品状态'],
      visitors: ['商品访客数量'],
      pageviews: ['商品页面访问量'],
      bounce_visitors: ['跳出商品页面的访客数'],
      bounce_rate: ['商品跳出率'],
      search_clickers: ['搜索点击人数'],
      likes: ['赞'],
      cart_visitors: ['商品访客数 (加入购物车)'],
      cart_items: ['件数 (加入购物车）'],
      cart_conversion: ['转化率 (加入购物车率)'],
      ordered_buyers: ['买家数（已下订单）'],
      ordered_items: ['件数（已下订单）'],
      ordered_sales: ['销售额（已下订单） (THB)'],
      ordered_conversion: ['转化率（已下订单）'],
      confirmed_buyers: ['买家数（已确定订单）'],
      confirmed_items: ['件数（已确定订单）'],
      confirmed_sales: ['销售额（已确定订单） (THB)'],
      confirmed_conversion: ['转化率（已确定订单）'],
      final_conversion: ['转化率 (将确定)'],
      shop: ['shop', '店铺名称', '店铺'],
      date: ['date', '数据日期', '日期'],
    };

    // 构建映射
    for (const [dbField, possibleNames] of Object.entries(fieldMappings)) {
      const matchedHeader = getHeader(possibleNames);
      if (matchedHeader) {
        mapping[dbField] = matchedHeader;
      }
    }

    // 打印映射结果，用于调试
    console.log('字段映射关系:', mapping);

    // 验证必需字段
    if (!mapping.product_id) {
      throw new Error(
        `Excel 文件必须包含 product_id 列。可用的表头: ${headersOriginal.join(', ')}`,
      );
    }
    if (!mapping.product_name) {
      throw new Error(
        `Excel 文件必须包含 product_name 列。可用的表头: ${headersOriginal.join(', ')}`,
      );
    }

    return mapping;
  }

  /**
   * 根据字段类型解析值
   */
  private parseFieldValue(
    fieldName: string,
    value: any,
  ): string | number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // INT 类型字段
    const intFields = [
      'visitors',
      'pageviews',
      'bounce_visitors',
      'search_clickers',
      'likes',
      'cart_visitors',
      'cart_items',
      'ordered_buyers',
      'ordered_items',
      'confirmed_buyers',
      'confirmed_items',
    ];

    // FLOAT 类型字段
    const floatFields = [
      'bounce_rate',
      'cart_conversion',
      'ordered_conversion',
      'confirmed_conversion',
      'final_conversion',
    ];

    // DECIMAL 类型字段
    const decimalFields = ['ordered_sales', 'confirmed_sales'];

    if (intFields.includes(fieldName)) {
      const num = parseInt(String(value), 10);
      return isNaN(num) ? null : num;
    }

    if (floatFields.includes(fieldName)) {
      const num = parseFloat(String(value));
      return isNaN(num) ? null : num;
    }

    if (decimalFields.includes(fieldName)) {
      const num = parseFloat(String(value));
      return isNaN(num) ? null : num;
    }

    // 字符串类型字段
    return String(value).trim() || null;
  }

  /**
   * 解析每日统计数据 CSV 文件
   */
  private parseDailyStatsCSV(
    content: string,
    shop: string,
    date: string,
  ): Array<Record<string, any>> {
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length === 0) {
      throw new Error('CSV 文件为空');
    }

    // 第一行是表头
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    // 查找字段索引（支持多种可能的字段名）
    const getIndex = (possibleNames: string[]): number => {
      for (const name of possibleNames) {
        const index = headers.indexOf(name.toLowerCase());
        if (index !== -1) return index;
      }
      return -1;
    };

    const productIdIndex = getIndex([
      'product_id',
      '产品id',
      '商品id',
      '商品编号',
    ]);
    const productNameIndex = getIndex(['product_name', '产品名称', '商品名称']);
    const currentItemStatusIndex = getIndex([
      'current_item_status',
      'current_status',
      '商品状态',
      '当前状态',
      '状态',
    ]);
    const visitorsIndex = getIndex([
      'visitors',
      '访客数',
      '访问人数',
      '商品访客数量',
    ]);
    const pageviewsIndex = getIndex([
      'pageviews',
      'page_views',
      '浏览量',
      '页面访问量',
      '页面浏览量',
    ]);
    const bounceVisitorsIndex = getIndex([
      'bounce_visitors',
      '跳出访客数',
      '跳出人数',
    ]);
    const bounceRateIndex = getIndex(['bounce_rate', '跳出率']);
    const searchClickersIndex = getIndex([
      'search_clickers',
      'search_clicks',
      '搜索点击人数',
      '搜索点击数',
      '搜索点击',
    ]);
    const likesIndex = getIndex(['likes', '点赞数', '喜欢数', '赞']);
    const cartVisitorsIndex = getIndex([
      'cart_visitors',
      'add_to_cart_visitors',
      '加购访客数',
      '加购人数',
    ]);
    const cartItemsIndex = getIndex([
      'cart_items',
      'add_to_cart_units',
      '加购件数',
      '加购数量',
    ]);
    const cartConversionIndex = getIndex([
      'cart_conversion',
      'cart_conversion_rate',
      '加购转化率',
      '购物车转化率',
    ]);
    const orderedBuyersIndex = getIndex([
      'ordered_buyers',
      'order_buyers',
      '下单买家数',
      '下单人数',
    ]);
    const orderedItemsIndex = getIndex([
      'ordered_items',
      'order_units',
      '下单件数',
      '下单数量',
    ]);
    const orderedSalesIndex = getIndex([
      'ordered_sales',
      'order_sales',
      '下单金额',
      '订单金额',
      '下单销售额',
    ]);
    const orderedConversionIndex = getIndex([
      'ordered_conversion',
      'order_conversion_rate',
      '下单转化率',
      '订单转化率',
    ]);
    const confirmedBuyersIndex = getIndex([
      'confirmed_buyers',
      '确认收货买家数',
      '确认收货人数',
      '确认订单买家数',
    ]);
    const confirmedItemsIndex = getIndex([
      'confirmed_items',
      'confirmed_units',
      '确认收货件数',
      '确认收货数量',
      '确认订单件数',
    ]);
    const confirmedSalesIndex = getIndex([
      'confirmed_sales',
      '确认收货金额',
      '确认订单销售额',
    ]);
    const confirmedConversionIndex = getIndex([
      'confirmed_conversion',
      'confirmed_conversion_rate',
      '确认收货转化率',
      '确认订单转化率',
    ]);
    const finalConversionIndex = getIndex([
      'final_conversion',
      'final conversion',
      '最终转化率',
    ]);

    // 必需字段验证
    if (productIdIndex === -1) {
      throw new Error('CSV 文件必须包含 product_id 列');
    }
    if (productNameIndex === -1) {
      throw new Error('CSV 文件必须包含 product_name 列');
    }

    // 解析数据行
    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map((v) => v.trim());

      const parseNumber = (value: string | undefined): number | null => {
        if (!value || value === '') return null;
        const num = parseInt(value, 10);
        return isNaN(num) ? null : num;
      };

      const parseDecimal = (value: string | undefined): number | null => {
        if (!value || value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
      };

      const productId = values[productIdIndex] || '';
      const productName = values[productNameIndex] || '';

      // 验证必需字段
      if (!productId) {
        throw new Error(`第 ${index + 2} 行的 product_id 不能为空`);
      }
      if (!productName) {
        throw new Error(`第 ${index + 2} 行的 product_name 不能为空`);
      }

      return {
        product_id: productId,
        product_name: productName,
        current_item_status:
          currentItemStatusIndex !== -1
            ? values[currentItemStatusIndex] || null
            : null,
        visitors:
          visitorsIndex !== -1 ? parseNumber(values[visitorsIndex]) : null,
        pageviews:
          pageviewsIndex !== -1 ? parseNumber(values[pageviewsIndex]) : null,
        bounce_visitors:
          bounceVisitorsIndex !== -1
            ? parseNumber(values[bounceVisitorsIndex])
            : null,
        bounce_rate:
          bounceRateIndex !== -1 ? parseDecimal(values[bounceRateIndex]) : null,
        search_clickers:
          searchClickersIndex !== -1
            ? parseNumber(values[searchClickersIndex])
            : null,
        likes: likesIndex !== -1 ? parseNumber(values[likesIndex]) : null,
        cart_visitors:
          cartVisitorsIndex !== -1
            ? parseNumber(values[cartVisitorsIndex])
            : null,
        cart_items:
          cartItemsIndex !== -1 ? parseNumber(values[cartItemsIndex]) : null,
        cart_conversion:
          cartConversionIndex !== -1
            ? parseDecimal(values[cartConversionIndex])
            : null,
        ordered_buyers:
          orderedBuyersIndex !== -1
            ? parseNumber(values[orderedBuyersIndex])
            : null,
        ordered_items:
          orderedItemsIndex !== -1
            ? parseNumber(values[orderedItemsIndex])
            : null,
        ordered_sales:
          orderedSalesIndex !== -1
            ? parseDecimal(values[orderedSalesIndex])
            : null,
        ordered_conversion:
          orderedConversionIndex !== -1
            ? parseDecimal(values[orderedConversionIndex])
            : null,
        confirmed_buyers:
          confirmedBuyersIndex !== -1
            ? parseNumber(values[confirmedBuyersIndex])
            : null,
        confirmed_items:
          confirmedItemsIndex !== -1
            ? parseNumber(values[confirmedItemsIndex])
            : null,
        confirmed_sales:
          confirmedSalesIndex !== -1
            ? parseDecimal(values[confirmedSalesIndex])
            : null,
        confirmed_conversion:
          confirmedConversionIndex !== -1
            ? parseDecimal(values[confirmedConversionIndex])
            : null,
        final_conversion:
          finalConversionIndex !== -1
            ? parseDecimal(values[finalConversionIndex])
            : null,
        shop,
        date,
      };
    });
  }

  /**
   * 上传每日统计数据
   * 使用事务：先删除旧数据，再批量插入新数据
   */
  async uploadDailyStats(
    file: Express.Multer.File,
    shop: string,
    date: string,
  ): Promise<{ insertedCount: number; message: string }> {
    console.log('已经进入 uploadDailyStats 函数');
    console.log('文件类型:', file.mimetype);
    console.log('文件名:', file.originalname);

    // 根据文件类型解析文件
    let data: Array<Record<string, any>>;
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();

    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // 解析 Excel 文件
      data = this.parseDailyStatsExcel(file, shop, date);
    } else {
      // 解析 CSV 文件
      const fileContent = file.buffer.toString('utf-8');
      data = this.parseDailyStatsCSV(fileContent, shop, date);
    }

    if (data.length === 0) {
      throw new Error('文件中没有有效数据');
    }

    // 使用事务处理删除和插入
    const result = await this.mysqlService.transaction(async (connection) => {
      // 1. 查询是否存在相同 shop 和 date 的数据
      const [existingRows] = await connection.query(
        'SELECT COUNT(*) as count FROM daily_product_stats WHERE shop = ? AND date = ?',
        [shop, date],
      );

      // 2. 如果存在，删除旧数据
      const existing = existingRows as Array<{ count: number }>;
      if (existing && existing.length > 0) {
        const count = existing[0]?.count || 0;
        if (count > 0) {
          await connection.execute(
            'DELETE FROM daily_product_stats WHERE shop = ? AND date = ?',
            [shop, date],
          );
        }
      }

      // 3. 批量插入新数据
      if (data.length === 0) {
        return { insertedCount: 0 };
      }

      // 构建批量插入 SQL（根据用户提供的映射表）
      const columns = [
        'product_id',
        'product_name',
        'current_item_status',
        'visitors',
        'pageviews',
        'bounce_visitors',
        'bounce_rate',
        'search_clickers',
        'likes',
        'cart_visitors',
        'cart_items',
        'cart_conversion',
        'ordered_buyers',
        'ordered_items',
        'ordered_sales',
        'ordered_conversion',
        'confirmed_buyers',
        'confirmed_items',
        'confirmed_sales',
        'confirmed_conversion',
        'final_conversion',
        'shop',
        'date',
      ];

      const placeholders = columns.map(() => '?').join(', ');
      const values: any[] = [];

      // 构建 VALUES 部分
      const valuePlaceholders = data.map(() => `(${placeholders})`).join(', ');

      // 收集所有值
      data.forEach((item) => {
        columns.forEach((col) => {
          const value: unknown = item[col];
          values.push(value !== undefined && value !== null ? value : null);
        });
      });

      const insertSql = `INSERT INTO daily_product_stats (${columns.join(', ')}) VALUES ${valuePlaceholders}`;
      const [insertResult] = await connection.execute(insertSql, values);
      const insertResultTyped = insertResult as {
        affectedRows: number;
        insertId: number;
      };

      return {
        insertedCount: insertResultTyped.affectedRows || 0,
      };
    });

    return {
      insertedCount: result.insertedCount,
      message: `成功上传 ${result.insertedCount} 条数据`,
    };
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

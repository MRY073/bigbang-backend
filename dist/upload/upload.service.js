"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const mysql_service_1 = require("../database/mysql.service");
const XLSX = __importStar(require("xlsx"));
let UploadService = class UploadService {
    mysqlService;
    constructor(mysqlService) {
        this.mysqlService = mysqlService;
    }
    async saveUpload(file, type, shopName, shopID) {
        const results = await this.saveMultipleUploads([file], type, shopName, shopID);
        return results[0];
    }
    async saveMultipleUploads(files, type, shopName, shopID) {
        if (type === 'productID') {
            console.log('处理商品ID类型的上传-productID');
            return await this.handleProductIDUpload(files, shopName, shopID);
        }
        if (type === 'daily') {
            console.log('处理每日统计数据类型的上传-daily');
            return await this.handleDailyStatsUpload(files, shopName, shopID);
        }
        if (type === 'ad') {
            console.log('处理广告数据类型的上传-ad');
            return await this.handleAdUpload(files, shopName, shopID);
        }
        console.log('其他类型的处理-default');
        return this.handleDefaultUpload(files, type, shopName);
    }
    async handleProductIDUpload(files, shopName, shopID) {
        const results = [];
        console.log('进入函数handleProductIDUpload', shopName, shopID);
        const file = files[0];
        console.log('file', file);
        try {
            const fileContent = file.buffer.toString('utf-8');
            const productData = this.parseProductFile(fileContent);
            console.log('productData', productData);
            for (const product of productData) {
                const result = await this.upsertProductItem(shopName, shopID, product);
                results.push(result);
            }
        }
        catch (error) {
            console.error(`处理文件 ${file.originalname} 时出错:`, error);
            results.push({
                error: `处理文件 ${file.originalname} 失败`,
                message: error instanceof Error ? error.message : '未知错误',
            });
        }
        return results;
    }
    parseProductFile(content) {
        const lines = content.split('\n').filter((line) => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV 文件为空');
        }
        const removeQuotes = (str) => {
            if (!str)
                return str;
            let result = str.trim();
            while (result.startsWith('"')) {
                result = result.slice(1);
            }
            while (result.endsWith('"')) {
                result = result.slice(0, -1);
            }
            return result.trim();
        };
        const headerLine = lines[0].trim();
        const headers = headerLine.split(',').map((h) => h.trim());
        const productIdIndex = headers.findIndex((h) => h === '产品ID' || h.toLowerCase() === 'product_id');
        const productNameIndex = headers.findIndex((h) => h === '产品名称' || h.toLowerCase() === 'product_name');
        const productImageIndex = headers.findIndex((h) => h === '产品图片' || h.toLowerCase() === 'product_image');
        if (productIdIndex === -1) {
            throw new Error('CSV 文件必须包含"产品ID"列');
        }
        if (productNameIndex === -1) {
            throw new Error('CSV 文件必须包含"产品名称"列');
        }
        return lines.slice(1).map((line, index) => {
            const values = line.split(',').map((v) => v.trim());
            const productId = removeQuotes(values[productIdIndex] || '');
            const productName = removeQuotes(values[productNameIndex] || '');
            let productImage = null;
            if (productImageIndex !== -1 && values[productImageIndex]) {
                const imageValue = removeQuotes(values[productImageIndex]);
                if (imageValue) {
                    const firstImage = imageValue.split(',')[0].trim();
                    productImage = removeQuotes(firstImage) || null;
                }
            }
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
    async upsertProductItem(shopName, shopID, product) {
        const existing = await this.mysqlService.queryOne('SELECT * FROM product_items WHERE shop_id = ? AND product_id = ?', [
            shopID,
            product.product_id,
        ]);
        if (existing) {
            const affectedRows = await this.mysqlService.update('product_items', {
                product_name: product.product_name,
                product_image: product.product_image || null,
                shop_name: shopName,
            }, {
                shop_id: shopID,
                product_id: product.product_id,
            });
            return {
                action: 'updated',
                id: existing.id,
                product_id: product.product_id,
                product_name: product.product_name,
                shop_name: shopName,
                shop_id: shopID,
                affectedRows,
            };
        }
        else {
            const insertId = await this.mysqlService.insert('product_items', {
                product_id: product.product_id,
                product_name: product.product_name,
                product_image: product.product_image || null,
                shop_name: shopName,
                shop_id: shopID,
            });
            return {
                action: 'inserted',
                id: insertId,
                product_id: product.product_id,
                product_name: product.product_name,
                shop_name: shopName,
                shop_id: shopID,
            };
        }
    }
    validateFileName(fileName) {
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
        if (date1 !== date2) {
            return {
                valid: false,
                error: '文件名中的两个日期必须相同',
            };
        }
        const year = parseInt(date1.substring(0, 4), 10);
        const month = parseInt(date1.substring(4, 6), 10);
        const day = parseInt(date1.substring(6, 8), 10);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day) {
            return {
                valid: false,
                error: '文件名中的日期无效',
            };
        }
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return {
            valid: true,
            date: formattedDate,
        };
    }
    async handleDailyStatsUpload(files, shopName, shopID) {
        console.log('=== handleDailyStatsUpload 函数开始执行 ===');
        console.log('接收到的文件数量:', files?.length || 0);
        console.log('店铺名称:', shopName);
        console.log('店铺ID:', shopID);
        console.log('文件列表:', files?.map((f) => f.originalname) || []);
        console.log('\n--- 第一步：开始验证所有文件名格式 ---');
        const fileValidations = [];
        for (const file of files) {
            console.log(`验证文件: ${file.originalname}`);
            const validation = this.validateFileName(file.originalname);
            console.log(`验证结果:`, validation);
            fileValidations.push({ file, validation });
            if (!validation.valid) {
                console.error(`❌ 文件名验证失败: ${file.originalname} - ${validation.error}`);
                throw new Error(`文件名格式错误：${file.originalname} - ${validation.error}`);
            }
            console.log(`✅ 文件名验证通过: ${file.originalname}, 解析日期: ${validation.date}`);
        }
        console.log('✅ 所有文件名验证通过，共', fileValidations.length, '个文件');
        console.log('\n--- 第二步：开始处理文件数据 ---');
        const results = [];
        for (let i = 0; i < fileValidations.length; i++) {
            const { file, validation } = fileValidations[i];
            console.log(`\n处理第 ${i + 1}/${fileValidations.length} 个文件: ${file.originalname}`);
            console.log(`文件大小: ${file.size} 字节`);
            console.log(`文件类型: ${file.mimetype}`);
            console.log(`解析出的日期: ${validation.date}`);
            try {
                console.log(`开始调用 uploadDailyStats 处理文件: ${file.originalname}`);
                const result = await this.uploadDailyStats(file, shopName, shopID, validation.date);
                console.log(`✅ 文件处理成功: ${file.originalname}`);
                console.log(`处理结果:`, result);
                results.push({
                    fileName: file.originalname,
                    success: true,
                    ...result,
                });
                console.log(`当前已处理结果数: ${results.length}`);
            }
            catch (error) {
                console.error(`❌ 处理文件 ${file.originalname} 时出错:`);
                console.error('错误详情:', error);
                throw error;
            }
        }
        console.log('\n=== handleDailyStatsUpload 函数执行完成 ===');
        console.log(`总共处理了 ${results.length} 个文件`);
        console.log('最终结果:', results);
        return results;
    }
    parseDailyStatsExcel(file, shopName, shopID, date) {
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
        });
        if (!Array.isArray(jsonData)) {
            throw new Error('Excel 文件格式错误：无法解析为数组');
        }
        if (jsonData.length === 0) {
            throw new Error('Excel 文件为空');
        }
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
        console.log('Excel 文件中的实际表头（原始）:', headersOriginal);
        console.log('Excel 文件中的实际表头（小写）:', headers);
        const dataRows = jsonData.slice(1);
        const fieldMapping = this.buildFieldMapping(headersOriginal, headers);
        const parsedRows = [];
        dataRows.forEach((row, index) => {
            const rowData = {
                shop_name: shopName,
                shop_id: shopID,
                date,
            };
            if (!Array.isArray(row)) {
                return;
            }
            for (const [dbField, excelHeader] of Object.entries(fieldMapping)) {
                const headerIndex = headersOriginal.findIndex((h) => h.toLowerCase() === excelHeader.toLowerCase());
                if (headerIndex !== -1 && row[headerIndex] !== undefined) {
                    const value = row[headerIndex];
                    rowData[dbField] = this.parseFieldValue(dbField, value);
                }
            }
            if (!rowData.product_id) {
                throw new Error(`第 ${index + 2} 行的 product_id 不能为空`);
            }
            if (!rowData.product_name) {
                throw new Error(`第 ${index + 2} 行的 product_name 不能为空`);
            }
            const visitorsValue = rowData.visitors;
            if (!visitorsValue) {
                console.log(`第 ${index + 2} 行的商品访客数不存在，跳过该行`);
                return;
            }
            parsedRows.push(rowData);
        });
        return parsedRows;
    }
    buildFieldMapping(headersOriginal, headersLower) {
        const getHeader = (possibleNames) => {
            for (let i = 0; i < headersLower.length; i++) {
                const lowerHeader = headersLower[i];
                const originalHeader = headersOriginal[i];
                for (const name of possibleNames) {
                    if (name.toLowerCase().trim() === lowerHeader.trim()) {
                        return originalHeader;
                    }
                }
            }
            return null;
        };
        const mapping = {};
        const fieldMappings = {
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
            shop_name: ['shop', 'shop_name', '店铺名称', '店铺'],
            date: ['date', '数据日期', '日期'],
        };
        for (const [dbField, possibleNames] of Object.entries(fieldMappings)) {
            const matchedHeader = getHeader(possibleNames);
            if (matchedHeader) {
                mapping[dbField] = matchedHeader;
            }
        }
        console.log('字段映射关系:', mapping);
        if (!mapping.product_id) {
            throw new Error(`Excel 文件必须包含 product_id 列。可用的表头: ${headersOriginal.join(', ')}`);
        }
        if (!mapping.product_name) {
            throw new Error(`Excel 文件必须包含 product_name 列。可用的表头: ${headersOriginal.join(', ')}`);
        }
        return mapping;
    }
    cleanNumberString(value) {
        if (!value)
            return '';
        return String(value)
            .trim()
            .replace(/,/g, '')
            .replace(/\s/g, '')
            .replace(/[₿$€£¥฿]/g, '')
            .replace(/[^\d.-]/g, '');
    }
    parseFieldValue(fieldName, value) {
        if (value === null || value === undefined || value === '') {
            return null;
        }
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
        const floatFields = [
            'bounce_rate',
            'cart_conversion',
            'ordered_conversion',
            'confirmed_conversion',
            'final_conversion',
        ];
        const decimalFields = ['ordered_sales', 'confirmed_sales'];
        if (intFields.includes(fieldName)) {
            const cleaned = this.cleanNumberString(String(value));
            const num = parseInt(cleaned, 10);
            return isNaN(num) ? null : num;
        }
        if (floatFields.includes(fieldName)) {
            const cleaned = this.cleanNumberString(String(value));
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        }
        if (decimalFields.includes(fieldName)) {
            const cleaned = this.cleanNumberString(String(value));
            const num = parseFloat(cleaned);
            return isNaN(num) ? null : num;
        }
        return String(value).trim() || null;
    }
    parseDailyStatsCSV(content, shopName, shopID, date) {
        const lines = content.split('\n').filter((line) => line.trim());
        if (lines.length === 0) {
            throw new Error('CSV 文件为空');
        }
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const getIndex = (possibleNames) => {
            for (const name of possibleNames) {
                const index = headers.indexOf(name.toLowerCase());
                if (index !== -1)
                    return index;
            }
            return -1;
        };
        const productIdIndex = getIndex(['商品编号']);
        const productNameIndex = getIndex(['商品']);
        const currentItemStatusIndex = getIndex(['Current Item Status']);
        const visitorsIndex = getIndex(['商品访客数量']);
        const pageviewsIndex = getIndex(['商品页面访问量']);
        const bounceVisitorsIndex = getIndex(['跳出商品页面的访客数']);
        const bounceRateIndex = getIndex(['商品跳出率']);
        const searchClickersIndex = getIndex(['搜索点击人数']);
        const likesIndex = getIndex(['赞']);
        const cartVisitorsIndex = getIndex(['商品访客数 (加入购物车)']);
        const cartItemsIndex = getIndex(['件数 (加入购物车）']);
        const cartConversionIndex = getIndex(['转化率 (加入购物车率)']);
        const orderedBuyersIndex = getIndex(['买家数（已下订单）']);
        const orderedItemsIndex = getIndex(['件数（已下订单）']);
        const orderedSalesIndex = getIndex(['销售额（已下订单） (THB)']);
        const orderedConversionIndex = getIndex(['转化率（已下订单）']);
        const confirmedBuyersIndex = getIndex(['买家数（已确定订单）']);
        const confirmedItemsIndex = getIndex(['件数（已确定订单）']);
        const confirmedSalesIndex = getIndex(['销售额（已确定订单） (THB)']);
        const confirmedConversionIndex = getIndex(['转化率（已确定订单）']);
        const finalConversionIndex = getIndex(['转化率 (将确定)']);
        if (productIdIndex === -1) {
            throw new Error('CSV 文件必须包含 product_id 列');
        }
        if (productNameIndex === -1) {
            throw new Error('CSV 文件必须包含 product_name 列');
        }
        return lines.slice(1).map((line, index) => {
            const values = line.split(',').map((v) => v.trim());
            const parseNumber = (value) => {
                if (!value || value === '')
                    return null;
                const cleaned = value
                    .trim()
                    .replace(/,/g, '')
                    .replace(/\s/g, '')
                    .replace(/[^\d.-]/g, '');
                const num = parseInt(cleaned, 10);
                return isNaN(num) ? null : num;
            };
            const parseDecimal = (value) => {
                if (!value || value === '')
                    return null;
                const cleaned = value
                    .trim()
                    .replace(/,/g, '')
                    .replace(/\s/g, '')
                    .replace(/[₿$€£¥฿]/g, '')
                    .replace(/[^\d.-]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            };
            const productId = values[productIdIndex] || '';
            const productName = values[productNameIndex] || '';
            if (!productId) {
                throw new Error(`第 ${index + 2} 行的 product_id 不能为空`);
            }
            if (!productName) {
                throw new Error(`第 ${index + 2} 行的 product_name 不能为空`);
            }
            return {
                product_id: productId,
                product_name: productName,
                current_item_status: currentItemStatusIndex !== -1
                    ? values[currentItemStatusIndex] || null
                    : null,
                visitors: visitorsIndex !== -1 ? parseNumber(values[visitorsIndex]) : null,
                pageviews: pageviewsIndex !== -1 ? parseNumber(values[pageviewsIndex]) : null,
                bounce_visitors: bounceVisitorsIndex !== -1
                    ? parseNumber(values[bounceVisitorsIndex])
                    : null,
                bounce_rate: bounceRateIndex !== -1 ? parseDecimal(values[bounceRateIndex]) : null,
                search_clickers: searchClickersIndex !== -1
                    ? parseNumber(values[searchClickersIndex])
                    : null,
                likes: likesIndex !== -1 ? parseNumber(values[likesIndex]) : null,
                cart_visitors: cartVisitorsIndex !== -1
                    ? parseNumber(values[cartVisitorsIndex])
                    : null,
                cart_items: cartItemsIndex !== -1 ? parseNumber(values[cartItemsIndex]) : null,
                cart_conversion: cartConversionIndex !== -1
                    ? parseDecimal(values[cartConversionIndex])
                    : null,
                ordered_buyers: orderedBuyersIndex !== -1
                    ? parseNumber(values[orderedBuyersIndex])
                    : null,
                ordered_items: orderedItemsIndex !== -1
                    ? parseNumber(values[orderedItemsIndex])
                    : null,
                ordered_sales: orderedSalesIndex !== -1
                    ? parseDecimal(values[orderedSalesIndex])
                    : null,
                ordered_conversion: orderedConversionIndex !== -1
                    ? parseDecimal(values[orderedConversionIndex])
                    : null,
                confirmed_buyers: confirmedBuyersIndex !== -1
                    ? parseNumber(values[confirmedBuyersIndex])
                    : null,
                confirmed_items: confirmedItemsIndex !== -1
                    ? parseNumber(values[confirmedItemsIndex])
                    : null,
                confirmed_sales: confirmedSalesIndex !== -1
                    ? parseDecimal(values[confirmedSalesIndex])
                    : null,
                confirmed_conversion: confirmedConversionIndex !== -1
                    ? parseDecimal(values[confirmedConversionIndex])
                    : null,
                final_conversion: finalConversionIndex !== -1
                    ? parseDecimal(values[finalConversionIndex])
                    : null,
                shop_name: shopName,
                shop_id: shopID,
                date,
            };
        });
    }
    async uploadDailyStats(file, shopName, shopID, date) {
        console.log('已经进入 uploadDailyStats 函数');
        console.log('文件类型:', file.mimetype);
        console.log('文件名:', file.originalname);
        let data;
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            data = this.parseDailyStatsExcel(file, shopName, shopID, date);
        }
        else {
            const fileContent = file.buffer.toString('utf-8');
            data = this.parseDailyStatsCSV(fileContent, shopName, shopID, date);
        }
        if (data.length === 0) {
            throw new Error('文件中没有有效数据');
        }
        const result = await this.mysqlService.transaction(async (connection) => {
            const [existingRows] = await connection.query('SELECT COUNT(*) as count FROM daily_product_stats WHERE shop_id = ? AND date = ?', [shopID, date]);
            const existing = existingRows;
            if (existing && existing.length > 0) {
                const count = existing[0]?.count || 0;
                if (count > 0) {
                    await connection.execute('DELETE FROM daily_product_stats WHERE shop_id = ? AND date = ?', [shopID, date]);
                }
            }
            if (data.length === 0) {
                return { insertedCount: 0 };
            }
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
                'shop_name',
                'shop_id',
                'date',
            ];
            const placeholders = columns.map(() => '?').join(', ');
            const values = [];
            const valuePlaceholders = data.map(() => `(${placeholders})`).join(', ');
            data.forEach((item) => {
                columns.forEach((col) => {
                    const value = item[col];
                    values.push(value !== undefined && value !== null ? value : null);
                });
            });
            const insertSql = `INSERT INTO daily_product_stats (${columns.join(', ')}) VALUES ${valuePlaceholders}`;
            const [insertResult] = await connection.execute(insertSql, values);
            const insertResultTyped = insertResult;
            return {
                insertedCount: insertResultTyped.affectedRows || 0,
            };
        });
        return {
            insertedCount: result.insertedCount,
            message: `成功上传 ${result.insertedCount} 条数据`,
        };
    }
    validateAdFileName(fileName) {
        console.log('=== 文件名验证调试信息 ===');
        console.log('原始文件名:', fileName);
        console.log('文件名长度:', fileName.length);
        console.log('文件名字节:', Buffer.from(fileName, 'utf-8').toString('hex'));
        let decodedFileName = fileName;
        try {
            decodedFileName = decodeURIComponent(fileName);
            if (decodedFileName !== fileName) {
                console.log('文件名被URL编码，已解码:', decodedFileName);
            }
        }
        catch {
            console.log('文件名URL解码失败，使用原始文件名');
        }
        const nameWithoutExt = decodedFileName.replace(/\.[^.]+$/, '');
        console.log('移除扩展名后:', nameWithoutExt);
        const datePattern = /(\d{4}_\d{2}_\d{2})-(\d{4}_\d{2}_\d{2})/;
        const dateMatch = nameWithoutExt.match(datePattern);
        if (!dateMatch) {
            console.log('❌ 未找到日期格式');
            return {
                valid: false,
                error: '文件名格式错误，必须包含日期格式：YYYY_MM_DD-YYYY_MM_DD（例如：2025_11_03-2025_11_03）',
            };
        }
        console.log('✅ 找到日期格式:', dateMatch[0]);
        const date1 = dateMatch[1];
        const date2 = dateMatch[2];
        console.log('日期1:', date1);
        console.log('日期2:', date2);
        if (date1 !== date2) {
            console.log('❌ 两个日期不相同');
            return {
                valid: false,
                error: '文件名中的两个日期必须相同',
            };
        }
        const dateParts = date1.split('_');
        if (dateParts.length !== 3) {
            return {
                valid: false,
                error: '日期格式错误，应为：YYYY_MM_DD',
            };
        }
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const day = parseInt(dateParts[2], 10);
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return {
                valid: false,
                error: '日期格式错误，日期必须为数字',
            };
        }
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day) {
            return {
                valid: false,
                error: '文件名中的日期无效',
            };
        }
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        console.log('✅ 文件名验证通过，解析日期:', formattedDate);
        console.log('=== 文件名验证结束 ===\n');
        return {
            valid: true,
            date: formattedDate,
        };
    }
    async handleAdUpload(files, shopName, shopID) {
        console.log('=== handleAdUpload 函数开始执行 ===');
        console.log('接收到的文件数量:', files?.length || 0);
        console.log('店铺名称:', shopName);
        console.log('店铺ID:', shopID);
        console.log('文件列表:', files?.map((f) => f.originalname) || []);
        console.log('\n--- 第一步：开始验证所有文件名格式 ---');
        const fileValidations = [];
        for (const file of files) {
            console.log(`验证文件: ${file.originalname}`);
            const validation = this.validateAdFileName(file.originalname);
            console.log(`验证结果:`, validation);
            fileValidations.push({ file, validation });
            if (!validation.valid) {
                console.error(`❌ 文件名验证失败: ${file.originalname} - ${validation.error}`);
                throw new Error(`文件名格式错误：${file.originalname} - ${validation.error}`);
            }
            console.log(`✅ 文件名验证通过: ${file.originalname}, 解析日期: ${validation.date}`);
        }
        console.log('✅ 所有文件名验证通过，共', fileValidations.length, '个文件');
        console.log('\n--- 第二步：开始处理文件数据 ---');
        const results = [];
        for (let i = 0; i < fileValidations.length; i++) {
            const { file, validation } = fileValidations[i];
            console.log(`\n处理第 ${i + 1}/${fileValidations.length} 个文件: ${file.originalname}`);
            console.log(`文件大小: ${file.size} 字节`);
            console.log(`文件类型: ${file.mimetype}`);
            console.log(`解析出的日期: ${validation.date}`);
            try {
                console.log(`开始调用 uploadAdStats 处理文件: ${file.originalname}`);
                const result = await this.uploadAdStats(file, shopName, shopID, validation.date);
                console.log(`✅ 文件处理成功: ${file.originalname}`);
                console.log(`处理结果:`, result);
                results.push({
                    fileName: file.originalname,
                    success: true,
                    ...result,
                });
                console.log(`当前已处理结果数: ${results.length}`);
            }
            catch (error) {
                console.error(`❌ 处理文件 ${file.originalname} 时出错:`);
                console.error('错误详情:', error);
                throw error;
            }
        }
        console.log('\n=== handleAdUpload 函数执行完成 ===');
        console.log(`总共处理了 ${results.length} 个文件`);
        console.log('最终结果:', results);
        return results;
    }
    parseAdStatsCSV(content, shopName, shopID, date) {
        const lines = content.split('\n');
        if (lines.length < 8) {
            throw new Error('CSV 文件行数不足，至少需要8行（前7行无用，第8行是标题）');
        }
        const headerLine = lines[7]?.trim();
        if (!headerLine) {
            throw new Error('CSV 文件第8行（标题行）为空');
        }
        const headers = headerLine.split(',').map((h) => h.trim());
        console.log('广告CSV标题行:', headers);
        const getIndex = (possibleNames) => {
            for (const name of possibleNames) {
                const index = headers.findIndex((h) => h.trim().toLowerCase() === name.trim().toLowerCase());
                if (index !== -1)
                    return index;
            }
            return -1;
        };
        const adNameIndex = getIndex(['广告名称']);
        const statusIndex = getIndex(['状态']);
        const adTypeIndex = getIndex(['广告类型']);
        const productIdIndex = getIndex(['商品编号']);
        const creationIndex = getIndex(['创作']);
        const biddingMethodIndex = getIndex(['竞价方式']);
        const placementIndex = getIndex(['版位']);
        const startDateIndex = getIndex(['开始日期']);
        const endDateIndex = getIndex(['结束日期']);
        const impressionsIndex = getIndex(['展示次数']);
        const clicksIndex = getIndex(['点击数']);
        const clickRateIndex = getIndex(['点击率']);
        const conversionsIndex = getIndex(['转化']);
        const directConversionsIndex = getIndex(['直接转化']);
        const conversionRateIndex = getIndex(['转化率']);
        const directConversionRateIndex = getIndex(['直接转化率']);
        const costPerConversionIndex = getIndex(['每转化成本']);
        const costPerDirectConversionIndex = getIndex(['每一直接转化的成本']);
        const itemsSoldIndex = getIndex(['商品已出售']);
        const directItemsSoldIndex = getIndex(['直接已售商品']);
        const salesAmountIndex = getIndex(['销售金额']);
        const directSalesAmountIndex = getIndex(['直接销售金额']);
        const spendIndex = getIndex(['花费']);
        const roasIndex = getIndex(['广告支出回报率']);
        const directRoasIndex = getIndex(['直接广告支出回报率']);
        const adSalesCostIndex = getIndex(['广告销售成本']);
        const directAdSalesCostIndex = getIndex(['直接广告销售成本']);
        if (productIdIndex === -1) {
            throw new Error('CSV 文件必须包含"商品编号"列');
        }
        const parsedRows = [];
        lines.slice(8).forEach((line, index) => {
            const trimmedLine = line.trim();
            if (!trimmedLine)
                return;
            const values = trimmedLine.split(',').map((v) => v.trim());
            const getValue = (index) => {
                if (index === -1 || index >= values.length)
                    return null;
                const val = values[index]?.trim();
                return val || null;
            };
            const parseNumber = (value) => {
                if (!value || value === '' || value === '-')
                    return null;
                const cleaned = value
                    .trim()
                    .replace(/,/g, '')
                    .replace(/\s/g, '')
                    .replace(/[₿$€£¥฿]/g, '')
                    .replace(/[^\d.-]/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? null : num;
            };
            const rowData = {
                ad_name: getValue(adNameIndex),
                status: getValue(statusIndex),
                ad_type: getValue(adTypeIndex),
                product_id: getValue(productIdIndex),
                creation: getValue(creationIndex),
                bidding_method: getValue(biddingMethodIndex),
                placement: getValue(placementIndex),
                start_date: getValue(startDateIndex),
                end_date: getValue(endDateIndex),
                impressions: parseNumber(getValue(impressionsIndex)),
                clicks: parseNumber(getValue(clicksIndex)),
                click_rate: parseNumber(getValue(clickRateIndex)),
                conversions: parseNumber(getValue(conversionsIndex)),
                direct_conversions: parseNumber(getValue(directConversionsIndex)),
                conversion_rate: parseNumber(getValue(conversionRateIndex)),
                direct_conversion_rate: parseNumber(getValue(directConversionRateIndex)),
                cost_per_conversion: parseNumber(getValue(costPerConversionIndex)),
                cost_per_direct_conversion: parseNumber(getValue(costPerDirectConversionIndex)),
                items_sold: parseNumber(getValue(itemsSoldIndex)),
                direct_items_sold: parseNumber(getValue(directItemsSoldIndex)),
                sales_amount: parseNumber(getValue(salesAmountIndex)),
                direct_sales_amount: parseNumber(getValue(directSalesAmountIndex)),
                spend: parseNumber(getValue(spendIndex)),
                roas: parseNumber(getValue(roasIndex)),
                direct_roas: parseNumber(getValue(directRoasIndex)),
                ad_sales_cost: parseNumber(getValue(adSalesCostIndex)),
                direct_ad_sales_cost: parseNumber(getValue(directAdSalesCostIndex)),
                shop_name: shopName,
                shop_id: shopID,
                date,
            };
            if (!rowData.product_id) {
                throw new Error(`第 ${index + 9} 行的商品编号不能为空`);
            }
            parsedRows.push(rowData);
        });
        return parsedRows;
    }
    async uploadAdStats(file, shopName, shopID, date) {
        console.log('已经进入 uploadAdStats 函数');
        console.log('文件类型:', file.mimetype);
        console.log('文件名:', file.originalname);
        const fileContent = file.buffer.toString('utf-8');
        const data = this.parseAdStatsCSV(fileContent, shopName, shopID, date);
        if (data.length === 0) {
            throw new Error('文件中没有有效数据');
        }
        console.log(`解析到 ${data.length} 条广告数据`);
        if (data.length > 0) {
            console.log('第一条数据示例:', JSON.stringify(data[0], null, 2));
            console.log('shop_name:', data[0].shop_name);
            console.log('shop_id:', data[0].shop_id);
        }
        const result = await this.mysqlService.transaction(async (connection) => {
            const [existingRows] = await connection.query('SELECT COUNT(*) as count FROM ad_stats WHERE shop_id = ? AND date = ?', [shopID, date]);
            const existing = existingRows;
            if (existing && existing.length > 0) {
                const count = existing[0]?.count || 0;
                if (count > 0) {
                    console.log(`删除 ${count} 条旧数据 (shop_id: ${shopID}, date: ${date})`);
                    await connection.execute('DELETE FROM ad_stats WHERE shop_id = ? AND date = ?', [shopID, date]);
                }
            }
            if (data.length === 0) {
                return { insertedCount: 0 };
            }
            const columns = [
                'ad_name',
                'status',
                'ad_type',
                'product_id',
                'creation',
                'bidding_method',
                'placement',
                'start_date',
                'end_date',
                'impressions',
                'clicks',
                'click_rate',
                'conversions',
                'direct_conversions',
                'conversion_rate',
                'direct_conversion_rate',
                'cost_per_conversion',
                'cost_per_direct_conversion',
                'items_sold',
                'direct_items_sold',
                'sales_amount',
                'direct_sales_amount',
                'spend',
                'roas',
                'direct_roas',
                'ad_sales_cost',
                'direct_ad_sales_cost',
                'shop_name',
                'shop_id',
                'date',
            ];
            const placeholders = columns.map(() => '?').join(', ');
            const values = [];
            const valuePlaceholders = data.map(() => `(${placeholders})`).join(', ');
            data.forEach((item, itemIndex) => {
                columns.forEach((col) => {
                    const value = item[col];
                    if (col === 'shop_name' || col === 'shop_id') {
                        console.log(`数据项 ${itemIndex}, 列 ${col}: ${String(value)} (类型: ${typeof value})`);
                    }
                    values.push(value !== undefined && value !== null ? value : null);
                });
            });
            const shopNameIndex = columns.indexOf('shop_name');
            const shopIdIndex = columns.indexOf('shop_id');
            if (shopNameIndex !== -1 && shopIdIndex !== -1 && data.length > 0) {
                console.log(`第一条数据的 shop_name 值: ${values[shopNameIndex]}, shop_id 值: ${values[shopIdIndex]}`);
            }
            const insertSql = `INSERT INTO ad_stats (${columns.join(', ')}) VALUES ${valuePlaceholders}`;
            console.log('插入 SQL:', insertSql.substring(0, 200) + '...');
            console.log('参数数量:', values.length, '数据条数:', data.length);
            const [insertResult] = await connection.execute(insertSql, values);
            const insertResultTyped = insertResult;
            return {
                insertedCount: insertResultTyped.affectedRows || 0,
            };
        });
        return {
            insertedCount: result.insertedCount,
            message: `成功上传 ${result.insertedCount} 条数据`,
        };
    }
    handleDefaultUpload(files, type, shopName) {
        return files.map((file, index) => ({
            id: Date.now() + index,
            originalName: file.originalname,
            filePath: `uploads/${type}/${shopName}/${file.originalname}`,
            mimeType: file.mimetype,
            fileSize: file.size,
            type,
            shop: shopName,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], UploadService);
//# sourceMappingURL=upload.service.js.map
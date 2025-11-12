import { MysqlService } from '../database/mysql.service';
interface UpsertProductResult {
    action: 'updated' | 'inserted';
    id: number;
    product_id: string;
    product_name: string;
    shop_name: string;
    shop_id: string;
    affectedRows?: number;
}
export declare class UploadService {
    private readonly mysqlService;
    constructor(mysqlService: MysqlService);
    saveUpload(file: Express.Multer.File, type: string, shopName: string, shopID: string): Promise<any>;
    saveMultipleUploads(files: Express.Multer.File[], type: string, shopName: string, shopID: string): Promise<any[]>;
    handleProductIDUpload(files: Express.Multer.File[], shopName: string, shopID: string): Promise<any[]>;
    private parseProductFile;
    upsertProductItem(shopName: string, shopID: string, product: {
        product_id: string;
        product_name: string;
        product_image?: string | null;
    }): Promise<UpsertProductResult>;
    validateFileName(fileName: string): {
        valid: boolean;
        date?: string;
        error?: string;
    };
    handleDailyStatsUpload(files: Express.Multer.File[], shopName: string, shopID: string): Promise<any[]>;
    private parseDailyStatsExcel;
    private buildFieldMapping;
    private cleanNumberString;
    private parseFieldValue;
    private parseDailyStatsCSV;
    uploadDailyStats(file: Express.Multer.File, shopName: string, shopID: string, date: string): Promise<{
        insertedCount: number;
        message: string;
    }>;
    validateAdFileName(fileName: string): {
        valid: boolean;
        date?: string;
        error?: string;
    };
    handleAdUpload(files: Express.Multer.File[], shopName: string, shopID: string): Promise<any[]>;
    private parseAdStatsCSV;
    uploadAdStats(file: Express.Multer.File, shopName: string, shopID: string, date: string): Promise<{
        insertedCount: number;
        message: string;
    }>;
    private handleDefaultUpload;
}
export {};

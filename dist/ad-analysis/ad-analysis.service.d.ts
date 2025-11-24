import { MysqlService } from '../database/mysql.service';
export declare class AdAnalysisService {
    private readonly mysqlService;
    constructor(mysqlService: MysqlService);
    private getProductStageByDate;
    getAdTrend30Days(shopID: string, shopName?: string, customCategory?: string): Promise<Array<{
        date: string;
        product_stage_spend?: number;
        testing_stage_spend?: number;
        potential_stage_spend?: number;
        abandoned_stage_spend?: number;
        no_stage_spend?: number;
        product_stage_sales?: number;
        testing_stage_sales?: number;
        potential_stage_sales?: number;
        abandoned_stage_sales?: number;
        no_stage_sales?: number;
        product_stage_roi?: number;
        testing_stage_roi?: number;
        potential_stage_roi?: number;
        abandoned_stage_roi?: number;
        no_stage_roi?: number;
    }>>;
    getAdRatioByDate(shopID: string, startDate: string, endDate: string, shopName?: string, customCategory?: string): Promise<{
        stages: {
            product_stage?: {
                spend: number;
                sales: number;
                roi: number;
            };
            testing_stage?: {
                spend: number;
                sales: number;
                roi: number;
            };
            potential_stage?: {
                spend: number;
                sales: number;
                roi: number;
            };
            abandoned_stage?: {
                spend: number;
                sales: number;
                roi: number;
            };
            no_stage?: {
                spend: number;
                sales: number;
                roi: number;
            };
        };
    }>;
    getStageProducts(shopID: string, startDate: string, endDate: string, stage: string, shopName?: string, customCategory?: string, page?: number, pageSize?: number, sortBy?: string, sortOrder?: string): Promise<{
        items: Array<{
            product_id: string;
            title: string;
            main_image: string;
            ad_spend: number;
            ad_sales: number;
            roi: number;
        }>;
        total: number;
        page: number;
        pageSize: number;
    }>;
}

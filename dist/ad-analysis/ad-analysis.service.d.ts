import { MysqlService } from '../database/mysql.service';
export declare class AdAnalysisService {
    private readonly mysqlService;
    constructor(mysqlService: MysqlService);
    private getProductStageByDate;
    getAdTrend30Days(shopID: string): Promise<Array<{
        date: string;
        testing_stage_spend: number;
        potential_stage_spend: number;
        product_stage_spend: number;
        abandoned_stage_spend: number;
        no_stage_spend: number;
        product_stage_roi: number;
    }>>;
    getAdRatioByDate(shopID: string, date: string): Promise<{
        date: string;
        stages: {
            testing_stage: {
                spend: number;
            };
            potential_stage: {
                spend: number;
            };
            product_stage: {
                spend: number;
                sales_amount: number;
                roi: number;
            };
            abandoned_stage: {
                spend: number;
            };
            no_stage: {
                spend: number;
            };
        };
    }>;
    getStageProducts(shopID: string, date: string, stage: string, shopName?: string): Promise<Array<{
        product_id: string;
        title: string;
        main_image: string;
        ad_spend: number;
        ad_sales: number;
        roi: number;
    }>>;
}

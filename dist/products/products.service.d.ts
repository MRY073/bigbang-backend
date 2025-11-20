import { MysqlService } from '../database/mysql.service';
export declare class ProductsService {
    private readonly mysqlService;
    constructor(mysqlService: MysqlService);
    private calculateChangeIndex;
    private calculateSlidingVolatility;
    private generateWarningMessage;
    getProductsByShop(shopID: string, shopName: string, customCategory?: string): Promise<Array<{
        product_id: string;
        product_name: string;
        product_image: string | null;
        testing_stage: {
            start_time: string | null;
            end_time: string | null;
        };
        potential_stage: {
            start_time: string | null;
            end_time: string | null;
        };
        product_stage: {
            start_time: string | null;
            end_time: string | null;
        };
        abandoned_stage: {
            start_time: string | null;
            end_time: string | null;
        };
        custom_category_1: string | null;
        custom_category_2: string | null;
        custom_category_3: string | null;
        custom_category_4: string | null;
        prompt_note: string | null;
    }>>;
    updateProductStage(productId: string, shopID: string, shopName: string, stageType: 'testing' | 'potential' | 'product' | 'abandoned', startTime?: string | null, endTime?: string | null): Promise<{
        success: boolean;
        message: string;
    }>;
    getTestingMonitorData(shopID: string, shopName: string): Promise<Array<{
        product_id: string;
        product_name: string;
        product_image: string | null;
        testing_stage_start: string;
        total_clicks: number;
        total_visitors: number;
        total_orders: number;
    }>>;
    getCustomCategories(shopID: string): Promise<string[]>;
    getFinishedLinkMonitorData(shopID: string, shopName: string, date?: string, customCategory?: string): Promise<Array<{
        id: string;
        name: string;
        image?: string | null;
        visitorsAvg: number[];
        visitorsVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        adCostAvg: number[];
        adCostVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        salesAvg: number[];
        salesVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        warningLevel: '严重' | '一般' | '轻微' | '正常';
        warningMessages: string[];
        custom_category_1?: string | null;
        custom_category_2?: string | null;
        custom_category_3?: string | null;
        custom_category_4?: string | null;
    }>>;
    private calculateWarningLevelFromVolatility;
    private calculateWarningLevel;
    getPotentialLinkMonitorData(shopID: string, shopName: string, date: string): Promise<Array<{
        id: string;
        name: string;
        image?: string | null;
        visitorsAvg: number[];
        visitorsVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        adCostAvg: number[];
        adCostVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        salesAvg: number[];
        salesVolatilityBaseline: Array<{
            window: number;
            direction: '+' | '-';
            strength: number;
            level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
        }>;
        warningLevel: '严重' | '一般' | '轻微' | '正常';
        warningMessages?: string[];
        custom_category_1?: string | null;
        custom_category_2?: string | null;
        custom_category_3?: string | null;
        custom_category_4?: string | null;
    }>>;
    private calculateWarningLevelFromCV;
    getPotentialLinkAISuggestion(shopID: string, shopName: string, date: string, productID: string, productName: string): Promise<{
        suggestion: string;
    }>;
    private analyzeTrend;
    getProductItems(shopID: string, shopName: string, page?: number, pageSize?: number, customCategory?: string): Promise<{
        data: Array<{
            id: number;
            product_id: string;
            product_name: string;
            product_image: string | null;
            custom_category_1: string | null;
            custom_category_2: string | null;
            custom_category_3: string | null;
            custom_category_4: string | null;
            prompt_note: string | null;
        }>;
        total: number;
    }>;
    private validatePromptNote;
    updateProductItemCustomCategory(id: string | number, updateData: {
        custom_category_1?: string | null;
        custom_category_2?: string | null;
        custom_category_3?: string | null;
        custom_category_4?: string | null;
        prompt_note?: string | null;
    }): Promise<{
        id: number;
        product_id: string;
        product_name: string;
        product_image: string | null;
        custom_category_1: string | null;
        custom_category_2: string | null;
        custom_category_3: string | null;
        custom_category_4: string | null;
        prompt_note: string | null;
    }>;
    deleteProductItem(id: string | number): Promise<boolean>;
    getOfflineProducts(shopID: string, shopName: string, page?: number, pageSize?: number, customCategory?: string): Promise<{
        data: Array<{
            id: number;
            product_id: string;
            product_name: string;
            product_image: string | null;
            status: number | null;
            custom_category_1: string | null;
            custom_category_2: string | null;
            custom_category_3: string | null;
            custom_category_4: string | null;
            prompt_note: string | null;
        }>;
        total: number;
    }>;
    updateProductStatus(id: string | number, status: 0 | 1): Promise<{
        id: number;
        product_id: string;
        product_name: string;
        product_image: string | null;
        status: number | null;
    }>;
}

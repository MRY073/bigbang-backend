export declare class UpdateStageDto {
    product_id: string;
    shopID: string;
    shopName: string;
    stage_type: 'testing' | 'potential' | 'product' | 'abandoned';
    start_time?: string | null;
    end_time?: string | null;
}

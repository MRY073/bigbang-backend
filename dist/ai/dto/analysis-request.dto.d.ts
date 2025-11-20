export declare class AnalysisRequestDto {
    question?: string;
    adData?: object | string;
    shopeeData?: object | string;
    productData?: object | string;
    context?: string;
    format?: 'json' | 'text' | 'csv';
}
export declare class AnalysisResponseDto {
    result: string;
    isJson?: boolean;
    parsedData?: any;
}

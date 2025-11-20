export declare class AiService {
    getSystemPrompt(): string;
    buildPrompt(businessData: string | object, format?: 'json' | 'text' | 'csv'): string;
    buildAnalysisPrompt(params: {
        question?: string;
        adData?: object | string;
        shopeeData?: object | string;
        productData?: object | string;
        context?: string;
    }): string;
}

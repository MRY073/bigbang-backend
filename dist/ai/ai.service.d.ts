type SupplementaryPromptInput = string | string[] | Record<string, any> | null | undefined;
export declare class AiService {
    getSystemPrompt(): string;
    buildPrompt(businessData: string | object, options?: {
        format?: 'json' | 'text' | 'csv';
        supplementaryPrompt?: SupplementaryPromptInput;
    }): string;
    buildAnalysisPrompt(params: {
        question?: string;
        adData?: object | string;
        shopeeData?: object | string;
        productData?: object | string;
        context?: string;
        format?: 'json' | 'text' | 'csv';
        supplementaryPrompt?: SupplementaryPromptInput;
    }): string;
    private normalizeSupplementaryPrompt;
    private buildFormatNote;
}
export {};

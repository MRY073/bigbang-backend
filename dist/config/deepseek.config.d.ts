export interface DeepseekConfig {
    apiKey: string | null;
}
export declare function getDeepseekConfig(): DeepseekConfig;
export declare function validateDeepseekConfig(): void;

export declare function calculateEWMA(values: number[], alpha?: number, period?: number): number[];
export declare function calculateZScore(values: number[], useSampleStdDev?: boolean): number[];
export declare function calculateRollingCV(values: number[], windowSize?: number, useSampleStdDev?: boolean): Array<number | null>;
export declare function calculateShortLongMeanRatio(values: number[], shortWindow?: number, longWindow?: number): Array<number | null>;
export declare function calculateRollingChangeRateIndex(values: number[], windowSize?: number, method?: 'mean' | 'cumulative'): Array<number | null>;
export declare function calculateShortTermVolatilityVsLongTermBaseline(values: number[], shortWindow?: number, longWindow?: number, useSampleStdDev?: boolean): Array<number | null>;
export declare function mean(values: number[]): number;
export declare function standardDeviation(values: number[], useSampleStdDev?: boolean): number;
export declare function coefficientOfVariation(values: number[], useSampleStdDev?: boolean): number | null;

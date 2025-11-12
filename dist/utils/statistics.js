"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEWMA = calculateEWMA;
exports.calculateZScore = calculateZScore;
exports.calculateRollingCV = calculateRollingCV;
exports.calculateShortLongMeanRatio = calculateShortLongMeanRatio;
exports.calculateRollingChangeRateIndex = calculateRollingChangeRateIndex;
exports.calculateShortTermVolatilityVsLongTermBaseline = calculateShortTermVolatilityVsLongTermBaseline;
exports.mean = mean;
exports.standardDeviation = standardDeviation;
exports.coefficientOfVariation = coefficientOfVariation;
function calculateEWMA(values, alpha, period = 10) {
    if (values.length === 0) {
        return [];
    }
    const smoothingFactor = alpha ?? 2 / (period + 1);
    if (smoothingFactor <= 0 || smoothingFactor > 1) {
        throw new Error('平滑因子 alpha 必须在 (0, 1] 范围内');
    }
    const ewma = [];
    let previousEWMA = values[0];
    for (let i = 0; i < values.length; i++) {
        const currentEWMA = smoothingFactor * values[i] + (1 - smoothingFactor) * previousEWMA;
        ewma.push(currentEWMA);
        previousEWMA = currentEWMA;
    }
    return ewma;
}
function calculateZScore(values, useSampleStdDev = true) {
    if (values.length === 0) {
        return [];
    }
    if (values.length === 1) {
        return [0];
    }
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
        (useSampleStdDev ? values.length - 1 : values.length);
    const stdDev = Math.sqrt(variance);
    if (stdDev === 0) {
        return new Array(values.length).fill(0);
    }
    return values.map((val) => (val - mean) / stdDev);
}
function calculateRollingCV(values, windowSize = 7, useSampleStdDev = true) {
    if (values.length === 0 || windowSize <= 0) {
        return [];
    }
    if (windowSize > values.length) {
        return new Array(values.length).fill(null);
    }
    const result = new Array(windowSize - 1).fill(null);
    for (let i = windowSize - 1; i < values.length; i++) {
        const window = values.slice(i - windowSize + 1, i + 1);
        const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
        if (mean === 0) {
            result.push(null);
            continue;
        }
        const variance = window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            (useSampleStdDev ? window.length - 1 : window.length);
        const stdDev = Math.sqrt(variance);
        const cv = stdDev / mean;
        result.push(cv);
    }
    return result;
}
function calculateShortLongMeanRatio(values, shortWindow = 7, longWindow = 30) {
    if (values.length === 0 || shortWindow <= 0 || longWindow <= 0) {
        return [];
    }
    if (shortWindow >= longWindow) {
        throw new Error('短期窗口大小必须小于长期窗口大小');
    }
    if (longWindow > values.length) {
        return new Array(values.length).fill(null);
    }
    const result = new Array(longWindow - 1).fill(null);
    for (let i = longWindow - 1; i < values.length; i++) {
        const shortWindowValues = values.slice(i - shortWindow + 1, i + 1);
        const longWindowValues = values.slice(i - longWindow + 1, i + 1);
        const shortMean = shortWindowValues.reduce((sum, val) => sum + val, 0) /
            shortWindowValues.length;
        const longMean = longWindowValues.reduce((sum, val) => sum + val, 0) /
            longWindowValues.length;
        if (longMean === 0) {
            result.push(null);
            continue;
        }
        const ratio = shortMean / longMean;
        result.push(ratio);
    }
    return result;
}
function calculateRollingChangeRateIndex(values, windowSize = 7, method = 'mean') {
    if (values.length === 0 || windowSize <= 0) {
        return [];
    }
    if (windowSize > values.length) {
        return new Array(values.length).fill(null);
    }
    const result = new Array(windowSize - 1).fill(null);
    for (let i = windowSize - 1; i < values.length; i++) {
        const window = values.slice(i - windowSize + 1, i + 1);
        if (method === 'mean') {
            const firstHalf = window.slice(0, Math.floor(windowSize / 2));
            const secondHalf = window.slice(Math.floor(windowSize / 2));
            const firstMean = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
            const secondMean = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
            if (firstMean === 0) {
                result.push(null);
                continue;
            }
            const changeRate = (secondMean - firstMean) / firstMean;
            result.push(changeRate);
        }
        else {
            let totalChangeRate = 0;
            let validPairs = 0;
            for (let j = 1; j < window.length; j++) {
                const prev = window[j - 1];
                const curr = window[j];
                if (prev !== 0) {
                    const rate = (curr - prev) / prev;
                    totalChangeRate += Math.abs(rate);
                    validPairs++;
                }
            }
            if (validPairs === 0) {
                result.push(null);
                continue;
            }
            const avgChangeRate = totalChangeRate / validPairs;
            result.push(avgChangeRate);
        }
    }
    return result;
}
function calculateShortTermVolatilityVsLongTermBaseline(values, shortWindow = 7, longWindow = 30, useSampleStdDev = true) {
    if (values.length === 0 || shortWindow <= 0 || longWindow <= 0) {
        return [];
    }
    if (shortWindow >= longWindow) {
        throw new Error('短期窗口大小必须小于长期窗口大小');
    }
    if (longWindow > values.length) {
        return new Array(values.length).fill(null);
    }
    const result = new Array(longWindow - 1).fill(null);
    for (let i = longWindow - 1; i < values.length; i++) {
        const shortWindowValues = values.slice(i - shortWindow + 1, i + 1);
        const longWindowValues = values.slice(i - longWindow + 1, i + 1);
        const shortMean = shortWindowValues.reduce((sum, val) => sum + val, 0) /
            shortWindowValues.length;
        const shortVariance = shortWindowValues.reduce((sum, val) => sum + Math.pow(val - shortMean, 2), 0) /
            (useSampleStdDev ? shortWindowValues.length - 1 : shortWindowValues.length);
        const shortStdDev = Math.sqrt(shortVariance);
        const longMean = longWindowValues.reduce((sum, val) => sum + val, 0) /
            longWindowValues.length;
        const longVariance = longWindowValues.reduce((sum, val) => sum + Math.pow(val - longMean, 2), 0) /
            (useSampleStdDev ? longWindowValues.length - 1 : longWindowValues.length);
        const longStdDev = Math.sqrt(longVariance);
        if (longStdDev === 0) {
            result.push(null);
            continue;
        }
        const ratio = shortStdDev / longStdDev;
        result.push(ratio);
    }
    return result;
}
function mean(values) {
    if (values.length === 0) {
        return 0;
    }
    return values.reduce((sum, val) => sum + val, 0) / values.length;
}
function standardDeviation(values, useSampleStdDev = true) {
    if (values.length === 0) {
        return 0;
    }
    if (values.length === 1) {
        return 0;
    }
    const avg = mean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
        (useSampleStdDev ? values.length - 1 : values.length);
    return Math.sqrt(variance);
}
function coefficientOfVariation(values, useSampleStdDev = true) {
    if (values.length === 0) {
        return null;
    }
    const avg = mean(values);
    if (avg === 0) {
        return null;
    }
    const stdDev = standardDeviation(values, useSampleStdDev);
    return stdDev / avg;
}
//# sourceMappingURL=statistics.js.map
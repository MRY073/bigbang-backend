/**
 * 通用统计计算工具函数
 * 所有函数均为纯函数，不涉及业务逻辑、数据库或前端
 */

/**
 * 计算指数加权移动平均（EWMA）
 * 公式: EWMA(t) = α * X(t) + (1 - α) * EWMA(t-1)
 * 其中 α 是平滑因子（decay factor），通常 α = 2 / (period + 1)
 *
 * @param values 按时间顺序排列的数值数组
 * @param alpha 平滑因子（0 < alpha <= 1），默认根据 period 计算
 * @param period 周期长度，用于计算默认 alpha，默认值为 10
 * @returns EWMA 值数组，与输入数组长度相同
 */
export function calculateEWMA(
  values: number[],
  alpha?: number,
  period: number = 10,
): number[] {
  if (values.length === 0) {
    return [];
  }

  // 如果没有提供 alpha，根据 period 计算
  const smoothingFactor = alpha ?? 2 / (period + 1);

  // 验证 alpha 范围
  if (smoothingFactor <= 0 || smoothingFactor > 1) {
    throw new Error('平滑因子 alpha 必须在 (0, 1] 范围内');
  }

  const ewma: number[] = [];
  let previousEWMA = values[0]; // 初始值使用第一个数据点

  for (let i = 0; i < values.length; i++) {
    const currentEWMA =
      smoothingFactor * values[i] + (1 - smoothingFactor) * previousEWMA;
    ewma.push(currentEWMA);
    previousEWMA = currentEWMA;
  }

  return ewma;
}

/**
 * 计算 Z-score（标准化偏差）
 * 公式: Z = (X - μ) / σ
 * 其中 μ 是均值，σ 是标准差
 *
 * @param values 按时间顺序排列的数值数组
 * @param useSampleStdDev 是否使用样本标准差（n-1），默认 true
 * @returns Z-score 数组，与输入数组长度相同
 */
export function calculateZScore(
  values: number[],
  useSampleStdDev: boolean = true,
): number[] {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    return [0]; // 单个数据点的 Z-score 为 0
  }

  // 计算均值
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  // 计算方差
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    (useSampleStdDev ? values.length - 1 : values.length);

  // 计算标准差
  const stdDev = Math.sqrt(variance);

  // 如果标准差为 0，所有 Z-score 都是 0
  if (stdDev === 0) {
    return new Array(values.length).fill(0);
  }

  // 计算每个值的 Z-score
  return values.map((val) => (val - mean) / stdDev);
}

/**
 * 计算滚动相对标准差（Rolling CV - Coefficient of Variation）
 * 公式: CV = σ / μ
 * 其中 σ 是标准差，μ 是均值
 *
 * @param values 按时间顺序排列的数值数组
 * @param windowSize 滚动窗口大小，默认值为 7
 * @param useSampleStdDev 是否使用样本标准差（n-1），默认 true
 * @returns 滚动 CV 数组，前 (windowSize - 1) 个值为 null（无法计算），后续为 CV 值
 */
export function calculateRollingCV(
  values: number[],
  windowSize: number = 7,
  useSampleStdDev: boolean = true,
): Array<number | null> {
  if (values.length === 0 || windowSize <= 0) {
    return [];
  }

  if (windowSize > values.length) {
    // 如果窗口大小大于数组长度，返回全 null
    return new Array(values.length).fill(null);
  }

  const result: Array<number | null> = new Array(windowSize - 1).fill(null);

  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);

    // 计算窗口内的均值
    const mean = window.reduce((sum, val) => sum + val, 0) / window.length;

    // 如果均值为 0，CV 无法计算
    if (mean === 0) {
      result.push(null);
      continue;
    }

    // 计算窗口内的方差
    const variance =
      window.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      (useSampleStdDev ? window.length - 1 : window.length);

    // 计算标准差
    const stdDev = Math.sqrt(variance);

    // 计算 CV
    const cv = stdDev / mean;
    result.push(cv);
  }

  return result;
}

/**
 * 计算短期/长期均值比（Short/Long Mean Ratio）
 * 比较短期窗口均值与长期窗口均值的比值
 *
 * @param values 按时间顺序排列的数值数组
 * @param shortWindow 短期窗口大小，默认值为 7
 * @param longWindow 长期窗口大小，默认值为 30
 * @returns 均值比数组，前 (longWindow - 1) 个值为 null（无法计算），后续为比值
 */
export function calculateShortLongMeanRatio(
  values: number[],
  shortWindow: number = 7,
  longWindow: number = 30,
): Array<number | null> {
  if (values.length === 0 || shortWindow <= 0 || longWindow <= 0) {
    return [];
  }

  if (shortWindow >= longWindow) {
    throw new Error('短期窗口大小必须小于长期窗口大小');
  }

  if (longWindow > values.length) {
    // 如果长期窗口大于数组长度，返回全 null
    return new Array(values.length).fill(null);
  }

  const result: Array<number | null> = new Array(longWindow - 1).fill(null);

  for (let i = longWindow - 1; i < values.length; i++) {
    // 短期窗口：从当前位置向前取 shortWindow 个值
    const shortWindowValues = values.slice(
      i - shortWindow + 1,
      i + 1,
    );

    // 长期窗口：从当前位置向前取 longWindow 个值
    const longWindowValues = values.slice(
      i - longWindow + 1,
      i + 1,
    );

    // 计算短期均值
    const shortMean =
      shortWindowValues.reduce((sum, val) => sum + val, 0) /
      shortWindowValues.length;

    // 计算长期均值
    const longMean =
      longWindowValues.reduce((sum, val) => sum + val, 0) /
      longWindowValues.length;

    // 如果长期均值为 0，比值无法计算
    if (longMean === 0) {
      result.push(null);
      continue;
    }

    // 计算比值
    const ratio = shortMean / longMean;
    result.push(ratio);
  }

  return result;
}

/**
 * 计算滚动变化率指数（Rolling Change Rate Index）
 * 计算滚动窗口内的变化率，可以基于均值变化或累计变化率
 *
 * @param values 按时间顺序排列的数值数组
 * @param windowSize 滚动窗口大小，默认值为 7
 * @param method 计算方法：'mean' 基于均值变化，'cumulative' 基于累计变化率，默认 'mean'
 * @returns 变化率指数数组，前 (windowSize - 1) 个值为 null（无法计算），后续为变化率指数
 */
export function calculateRollingChangeRateIndex(
  values: number[],
  windowSize: number = 7,
  method: 'mean' | 'cumulative' = 'mean',
): Array<number | null> {
  if (values.length === 0 || windowSize <= 0) {
    return [];
  }

  if (windowSize > values.length) {
    return new Array(values.length).fill(null);
  }

  const result: Array<number | null> = new Array(windowSize - 1).fill(null);

  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);

    if (method === 'mean') {
      // 方法1：基于均值变化
      const firstHalf = window.slice(0, Math.floor(windowSize / 2));
      const secondHalf = window.slice(Math.floor(windowSize / 2));

      const firstMean =
        firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondMean =
        secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

      if (firstMean === 0) {
        result.push(null);
        continue;
      }

      const changeRate = (secondMean - firstMean) / firstMean;
      result.push(changeRate);
    } else {
      // 方法2：基于累计变化率
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

      // 平均变化率作为指数
      const avgChangeRate = totalChangeRate / validPairs;
      result.push(avgChangeRate);
    }
  }

  return result;
}

/**
 * 计算短期波动相对长期基准指标（Short-term Volatility vs Long-term Baseline）
 * 比较短期窗口的波动率与长期窗口的波动率
 *
 * @param values 按时间顺序排列的数值数组
 * @param shortWindow 短期窗口大小，默认值为 7
 * @param longWindow 长期窗口大小，默认值为 30
 * @param useSampleStdDev 是否使用样本标准差（n-1），默认 true
 * @returns 波动率比值数组，前 (longWindow - 1) 个值为 null（无法计算），后续为比值
 */
export function calculateShortTermVolatilityVsLongTermBaseline(
  values: number[],
  shortWindow: number = 7,
  longWindow: number = 30,
  useSampleStdDev: boolean = true,
): Array<number | null> {
  if (values.length === 0 || shortWindow <= 0 || longWindow <= 0) {
    return [];
  }

  if (shortWindow >= longWindow) {
    throw new Error('短期窗口大小必须小于长期窗口大小');
  }

  if (longWindow > values.length) {
    return new Array(values.length).fill(null);
  }

  const result: Array<number | null> = new Array(longWindow - 1).fill(null);

  for (let i = longWindow - 1; i < values.length; i++) {
    // 短期窗口：从当前位置向前取 shortWindow 个值
    const shortWindowValues = values.slice(
      i - shortWindow + 1,
      i + 1,
    );

    // 长期窗口：从当前位置向前取 longWindow 个值
    const longWindowValues = values.slice(
      i - longWindow + 1,
      i + 1,
    );

    // 计算短期窗口的波动率（标准差）
    const shortMean =
      shortWindowValues.reduce((sum, val) => sum + val, 0) /
      shortWindowValues.length;
    const shortVariance =
      shortWindowValues.reduce(
        (sum, val) => sum + Math.pow(val - shortMean, 2),
        0,
      ) /
      (useSampleStdDev ? shortWindowValues.length - 1 : shortWindowValues.length);
    const shortStdDev = Math.sqrt(shortVariance);

    // 计算长期窗口的波动率（标准差）
    const longMean =
      longWindowValues.reduce((sum, val) => sum + val, 0) /
      longWindowValues.length;
    const longVariance =
      longWindowValues.reduce(
        (sum, val) => sum + Math.pow(val - longMean, 2),
        0,
      ) /
      (useSampleStdDev ? longWindowValues.length - 1 : longWindowValues.length);
    const longStdDev = Math.sqrt(longVariance);

    // 如果长期标准差为 0，比值无法计算
    if (longStdDev === 0) {
      result.push(null);
      continue;
    }

    // 计算波动率比值
    const ratio = shortStdDev / longStdDev;
    result.push(ratio);
  }

  return result;
}

/**
 * 辅助函数：计算数组的均值
 */
export function mean(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * 辅助函数：计算数组的标准差
 */
export function standardDeviation(
  values: number[],
  useSampleStdDev: boolean = true,
): number {
  if (values.length === 0) {
    return 0;
  }

  if (values.length === 1) {
    return 0;
  }

  const avg = mean(values);
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
    (useSampleStdDev ? values.length - 1 : values.length);

  return Math.sqrt(variance);
}

/**
 * 辅助函数：计算数组的变异系数（CV）
 */
export function coefficientOfVariation(
  values: number[],
  useSampleStdDev: boolean = true,
): number | null {
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


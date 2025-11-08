# 变化指数计算代码

## 阈值配置

```typescript
// 变化指数阈值
const CHANGE_INDEX_THRESHOLDS = {
  极小: 10, // 0 ~ 10: 基本稳定，几乎无波动
  轻微: 30, // 10 ~ 30: 轻微波动，不影响判断
  一般: 60, // 30 ~ 60: 中等波动，值得关注
  明显: 80, // 60 ~ 80: 波动较大，需要关注趋势
  剧烈: 100, // 80 ~ 100: 波动非常大，风险高或异常明显
};
```

## 计算函数

```typescript
/**
 * 计算变化指数
 * @param values 按日期排序的数值数组（从早到晚）
 * @returns 变化指数信息
 */
function calculateChangeIndex(values: number[]): {
  direction: '+' | '-';
  strength: number;
  level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
} {
  // 如果数据少于2个，无法计算变化
  if (values.length < 2) {
    return {
      direction: '+',
      strength: 0,
      level: '极小',
    };
  }

  // 过滤掉无效值（0或负数可能表示无数据）
  const validValues = values.filter((v) => v > 0);
  if (validValues.length < 2) {
    return {
      direction: '+',
      strength: 0,
      level: '极小',
    };
  }

  // 计算每日增幅 ri = (今天值 - 前一天值) / 前一天值
  const dailyRates: number[] = [];
  for (let i = 1; i < validValues.length; i++) {
    const prevValue = validValues[i - 1];
    const currValue = validValues[i];
    if (prevValue > 0) {
      const rate = (currValue - prevValue) / prevValue;
      dailyRates.push(rate);
    }
  }

  if (dailyRates.length === 0) {
    return {
      direction: '+',
      strength: 0,
      level: '极小',
    };
  }

  // 计算平均变化率（趋势方向）
  const meanRate =
    dailyRates.reduce((sum, rate) => sum + rate, 0) / dailyRates.length;
  const direction: '+' | '-' = meanRate >= 0 ? '+' : '-';

  // 计算变化强度（波动剧烈程度）
  const maxRate = Math.max(...dailyRates);
  const minRate = Math.min(...dailyRates);
  const maxAmplitude = maxRate - minRate;
  const changeIndex = Math.min(maxAmplitude * 100, 100);

  // 确定变化等级
  let level: '极小' | '轻微' | '一般' | '明显' | '剧烈';
  if (changeIndex < CHANGE_INDEX_THRESHOLDS.极小) {
    level = '极小';
  } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.轻微) {
    level = '轻微';
  } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.一般) {
    level = '一般';
  } else if (changeIndex < CHANGE_INDEX_THRESHOLDS.明显) {
    level = '明显';
  } else {
    level = '剧烈';
  }

  return {
    direction,
    strength: Math.round(changeIndex * 100) / 100, // 保留2位小数
    level,
  };
}
```

## 计算逻辑说明

### 步骤1：数据验证
- 如果数据少于2个，返回默认值（方向+，强度0，等级极小）
- 过滤掉0或负数值（视为无效数据）

### 步骤2：计算每日增幅
- 公式：`ri = (今天值 - 前一天值) / 前一天值`
- 遍历所有相邻的数据对，计算每日变化率
- 结果存储在 `dailyRates` 数组中

### 步骤3：计算平均变化率（趋势方向）
- 公式：`meanRate = 平均(所有ri)`
- 如果 `meanRate >= 0`，方向为 `+`（上升）
- 如果 `meanRate < 0`，方向为 `-`（下降）

### 步骤4：计算变化强度（波动剧烈程度）
- 找出所有每日增幅的最大值：`maxRate = max(所有ri)`
- 找出所有每日增幅的最小值：`minRate = min(所有ri)`
- 计算最大振幅：`maxAmplitude = maxRate - minRate`
- 变化指数：`changeIndex = min(maxAmplitude * 100, 100)`
- 限制在0-100范围内

### 步骤5：确定变化等级
根据 `changeIndex` 的值：
- 0 ~ 10：极小
- 10 ~ 30：轻微
- 30 ~ 60：一般
- 60 ~ 80：明显
- 80 ~ 100：剧烈

## 示例

假设有7天的销售额数据：[100, 120, 110, 130, 105, 140, 125]

1. 计算每日增幅：
   - Day1→Day2: (120-100)/100 = 0.20 (20%)
   - Day2→Day3: (110-120)/120 = -0.083 (-8.3%)
   - Day3→Day4: (130-110)/110 = 0.182 (18.2%)
   - Day4→Day5: (105-130)/130 = -0.192 (-19.2%)
   - Day5→Day6: (140-105)/105 = 0.333 (33.3%)
   - Day6→Day7: (125-140)/140 = -0.107 (-10.7%)

2. 平均变化率：meanRate = (0.20 - 0.083 + 0.182 - 0.192 + 0.333 - 0.107) / 6 = 0.0558
   - 方向：+（上升）

3. 变化强度：
   - maxRate = 0.333
   - minRate = -0.192
   - maxAmplitude = 0.333 - (-0.192) = 0.525
   - changeIndex = 0.525 * 100 = 52.5

4. 变化等级：52.5 在 30-60 之间，等级为"一般"

结果：{ direction: '+', strength: 52.5, level: '一般' }


// 自然流商品监控查询 DTO
export class NaturalStageMonitorDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必填）
  customCategory?: string; // 自定义分类筛选（可选）
}

// AI建议查询 DTO
export class NaturalStageAISuggestionDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必需）
  productID: string; // 产品ID
  productName: string; // 产品名称
}

// 批量AI建议 DTO
export class BatchNaturalStageAISuggestionDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必需）
}


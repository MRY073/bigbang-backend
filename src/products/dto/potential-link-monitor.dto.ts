// 潜力链接监控查询 DTO
export class PotentialLinkMonitorDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必需）
}

// AI建议查询 DTO
export class PotentialLinkAISuggestionDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必需）
  productID: string; // 产品ID
  productName: string; // 产品名称
}


// 折线图查询参数 DTO
export class FinishedLinkMonitorChartDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  productID: string; // 商品ID
  startDate: string; // 开始日期（YYYY-MM-DD 格式）
  endDate: string; // 结束日期（YYYY-MM-DD 格式）
}

export class PotentialLinkMonitorChartDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  productID: string; // 商品ID
  startDate: string; // 开始日期（YYYY-MM-DD 格式）
  endDate: string; // 结束日期（YYYY-MM-DD 格式）
}

export class NaturalStageMonitorChartDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  productID: string; // 商品ID
  startDate: string; // 开始日期（YYYY-MM-DD 格式）
  endDate: string; // 结束日期（YYYY-MM-DD 格式）
}


// 指定日期广告占比查询 DTO
export class AdRatioDto {
  shopID: string; // 店铺ID
  date: string; // 日期（YYYY-MM-DD 格式）
  shopName: string; // 店铺名称（用于日志记录）
  customCategory?: string; // 自定义分类筛选值（可选）
}


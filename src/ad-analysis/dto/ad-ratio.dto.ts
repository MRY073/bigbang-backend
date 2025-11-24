// 时间段广告占比查询 DTO
export class AdRatioDto {
  shopID: string; // 店铺ID
  startDate: string; // 开始日期（YYYY-MM-DD 格式）
  endDate: string; // 结束日期（YYYY-MM-DD 格式）
  shopName: string; // 店铺名称（用于日志记录）
  customCategory?: string; // 自定义分类筛选值（可选）
  // 向后兼容：保留 date 参数支持
  date?: string; // 日期（YYYY-MM-DD 格式，向后兼容，如果提供则同时作为 startDate 和 endDate）
}


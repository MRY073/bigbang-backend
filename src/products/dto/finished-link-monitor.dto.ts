// 成品链接监控查询 DTO
export class FinishedLinkMonitorDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  date: string; // 日期（YYYY-MM-DD 格式，必填）
  customCategory?: string; // 自定义分类筛选（可选）
}

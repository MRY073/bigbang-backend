// 更新商品竞争对手信息的 DTO
export class UpdateCompetitorInfoDto {
  competitor_link?: string | null; // 竞争对手链接（可选，可能包含泰文等字符）
  competitor_daily_sales?: string | null; // 竞争对手日均销量（可选，字符串类型）
}


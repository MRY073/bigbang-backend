// 更新商品自定义分类的 DTO
export class UpdateCustomCategoryDto {
  custom_category_1?: string | null; // 自定义分类1（可选）
  custom_category_2?: string | null; // 自定义分类2（可选）
  custom_category_3?: string | null; // 自定义分类3（可选）
  custom_category_4?: string | null; // 自定义分类4（可选）
  prompt_note?: string | null; // 提示词备注（可选，最多2000字符）
  competitor_link?: string | null; // 竞争对手链接（可选，可能包含泰文等字符）
  competitor_daily_sales?: string | null; // 竞争对手日均销量（可选，字符串类型）
}


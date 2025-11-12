// 查询商品列表的 DTO
export class QueryProductItemsDto {
  shopID: string; // 店铺ID（必填）
  shopName: string; // 店铺名称（必填）
  page?: number; // 页码（可选，默认1）
  pageSize?: number; // 每页数量（可选，默认20）
  customCategory?: string; // 自定义分类筛选（可选）
}


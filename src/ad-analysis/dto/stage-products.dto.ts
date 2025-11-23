// 阶段商品列表查询 DTO
export class StageProductsDto {
  shopID: string; // 店铺ID
  date: string; // 日期（YYYY-MM-DD 格式）
  stage: string; // 阶段标识：product_stage, testing_stage, potential_stage, abandoned_stage, no_stage
  shopName?: string; // 店铺名称（可选，用于日志记录）
  customCategory?: string; // 自定义分类值，用于筛选商品
  page?: number; // 页码，从1开始，默认为 1
  pageSize?: number; // 每页数量，默认为 20，可选值：10, 20, 50, 100
  sortBy?: string; // 排序字段，可选值：ad_spend, ad_sales, roi，默认为 ad_spend
  sortOrder?: string; // 排序顺序，可选值：asc, desc，默认为 desc
}


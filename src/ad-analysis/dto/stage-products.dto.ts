// 阶段商品列表查询 DTO
export class StageProductsDto {
  shopID: string; // 店铺ID
  date: string; // 日期（YYYY-MM-DD 格式）
  stage: string; // 阶段标识：product_stage, testing_stage, potential_stage, abandoned_stage, no_stage
  shopName?: string; // 店铺名称（可选，用于日志记录）
}


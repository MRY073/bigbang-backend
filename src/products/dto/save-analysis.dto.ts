// 保存分析参数 DTO
export class SaveAnalysisDto {
  shopID: string; // 店铺ID
  shopName: string; // 店铺名称
  productID: string; // 商品ID
  analysis?: string; // 分析内容（可选，最多10000字）
  improvementPlan?: string; // 改善方案（可选，最多10000字）
}


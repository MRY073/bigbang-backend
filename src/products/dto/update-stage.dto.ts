// 修改阶段时间段的 DTO
export class UpdateStageDto {
  product_id: string; // 产品ID
  shop: string; // 商店ID（店铺名称）
  stage_type: 'testing' | 'potential' | 'product' | 'abandoned'; // 阶段类型
  start_time?: string | null; // 开始时间（ISO 8601 格式，可为空）
  end_time?: string | null; // 结束时间（ISO 8601 格式，可为空）
}


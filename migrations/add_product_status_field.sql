-- 在 product_items 表中添加上下架状态字段
-- status: TINYINT, 0=上架, 1=下架, NULL=上架（为了兼容历史数据）
ALTER TABLE product_items 
  ADD COLUMN status TINYINT DEFAULT NULL COMMENT '上下架状态：0=上架，1=下架，NULL=上架（兼容历史数据）';

-- 创建索引以便快速查询下架商品
CREATE INDEX idx_status ON product_items(status);


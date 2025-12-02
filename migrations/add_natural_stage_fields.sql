-- 在 product_items 表中添加自然流阶段字段
-- natural_stage_start: DATETIME, 自然流阶段开始时间
-- natural_stage_end: DATETIME, 自然流阶段结束时间
ALTER TABLE product_items 
  ADD COLUMN natural_stage_start DATETIME DEFAULT NULL COMMENT '自然流阶段开始时间',
  ADD COLUMN natural_stage_end DATETIME DEFAULT NULL COMMENT '自然流阶段结束时间';


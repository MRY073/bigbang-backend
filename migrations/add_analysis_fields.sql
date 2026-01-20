-- 添加分析字段和改善方案字段到 product_items 表
-- 执行时间：2024-01-XX

ALTER TABLE product_items 
  ADD COLUMN analysis TEXT DEFAULT NULL COMMENT '分析内容（最多10000字）',
  ADD COLUMN improvement_plan TEXT DEFAULT NULL COMMENT '改善方案（最多10000字）';


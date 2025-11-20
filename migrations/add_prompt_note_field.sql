-- 在 product_items 表中添加提示词备注字段
-- prompt_note: TEXT, 最多2000字符，允许NULL
ALTER TABLE product_items 
  ADD COLUMN prompt_note TEXT NULL COMMENT '提示词备注，最多2000字符';


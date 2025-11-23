-- 在 product_items 表中添加竞争对手相关字段
-- competitor_link: TEXT, 用于存储竞争对手链接（可能很长，包含泰文等字符），允许NULL
-- competitor_daily_sales: VARCHAR(255), 用于存储竞争对手日均销量（字符串），允许NULL
ALTER TABLE product_items 
  ADD COLUMN competitor_link TEXT NULL COMMENT '竞争对手链接，可能包含泰文等字符',
  ADD COLUMN competitor_daily_sales VARCHAR(255) NULL COMMENT '竞争对手日均销量（字符串）';


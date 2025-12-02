CREATE TABLE IF NOT EXISTS `link_ai_prompt_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `link_id` VARCHAR(128) NOT NULL COMMENT '链接唯一 ID',
  `link_url` VARCHAR(512) NULL DEFAULT NULL COMMENT '链接地址',
  `shop_id` VARCHAR(128) NULL DEFAULT NULL COMMENT '店铺 ID',
  `prompt_date` DATE NOT NULL COMMENT '提示词日期（按天缓存）',
  `model_key` VARCHAR(64) NOT NULL COMMENT 'AI Provider',
  `model_name` VARCHAR(128) NOT NULL COMMENT '模型名称',
  `prompt_text` LONGTEXT NOT NULL COMMENT '完整提示词',
  `prompt_hash` CHAR(64) NOT NULL COMMENT '提示词哈希',
  `business_payload` LONGTEXT NOT NULL COMMENT '业务数据载荷',
  `supplementary_prompt` LONGTEXT NULL DEFAULT NULL COMMENT '补充提示词',
  `ai_response` LONGTEXT NULL DEFAULT NULL COMMENT 'AI 响应',
  `raw_response` LONGTEXT NULL DEFAULT NULL COMMENT 'AI 原始响应',
  `prompt_tokens` INT NULL DEFAULT NULL COMMENT '提示词 token 数',
  `completion_tokens` INT NULL DEFAULT NULL COMMENT '输出 token 数',
  `total_tokens` INT NULL DEFAULT NULL COMMENT '总 token 数',
  `status` ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `error_message` TEXT NULL DEFAULT NULL COMMENT '错误信息',
  `metadata` JSON NULL DEFAULT NULL COMMENT '附加元数据',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_link_prompt_date` (`link_id`, `prompt_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='链接 AI 提示词缓存表';




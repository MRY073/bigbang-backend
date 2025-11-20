# 数据库迁移说明

## 添加 status 字段

需要在数据库中执行以下 SQL 语句来添加 `status` 字段：

```sql
-- 添加上下架状态字段
ALTER TABLE product_items 
  ADD COLUMN status TINYINT DEFAULT NULL COMMENT '上下架状态：0=上架，1=下架，NULL=上架（兼容历史数据）';

-- 创建索引以便快速查询下架商品
CREATE INDEX idx_status ON product_items(status);
```

## 执行方式

### 方式一：使用 MySQL 命令行

```bash
mysql -u root -p bigbangShopee < migrations/add_product_status_field.sql
```

### 方式二：直接在 MySQL 客户端执行

1. 连接到数据库：
```bash
mysql -u root -p
```

2. 选择数据库：
```sql
USE bigbangShopee;
```

3. 执行 SQL：
```sql
ALTER TABLE product_items 
  ADD COLUMN status TINYINT DEFAULT NULL COMMENT '上下架状态：0=上架，1=下架，NULL=上架（兼容历史数据）';

CREATE INDEX idx_status ON product_items(status);
```

### 方式三：使用数据库管理工具

在 Navicat、phpMyAdmin、DBeaver 等工具中，直接执行 `migrations/add_product_status_field.sql` 文件中的 SQL 语句。

## 验证

执行后可以通过以下 SQL 验证字段是否添加成功：

```sql
DESCRIBE product_items;
```

或者：

```sql
SHOW COLUMNS FROM product_items LIKE 'status';
```

如果看到 `status` 字段，说明迁移成功。

## 添加 prompt_note 字段

需要在数据库中执行以下 SQL 语句来添加 `prompt_note` 字段：

```sql
-- 添加提示词备注字段
ALTER TABLE product_items 
  ADD COLUMN prompt_note TEXT NULL COMMENT '提示词备注，最多2000字符';
```

### 执行方式

#### 方式一：使用 MySQL 命令行

```bash
mysql -u root -p bigbangShopee < migrations/add_prompt_note_field.sql
```

#### 方式二：直接在 MySQL 客户端执行

1. 连接到数据库：
```bash
mysql -u root -p
```

2. 选择数据库：
```sql
USE bigbangShopee;
```

3. 执行 SQL：
```sql
ALTER TABLE product_items 
  ADD COLUMN prompt_note TEXT NULL COMMENT '提示词备注，最多2000字符';
```

#### 方式三：使用数据库管理工具

在 Navicat、phpMyAdmin、DBeaver 等工具中，直接执行 `migrations/add_prompt_note_field.sql` 文件中的 SQL 语句。

### 验证

执行后可以通过以下 SQL 验证字段是否添加成功：

```sql
DESCRIBE product_items;
```

或者：

```sql
SHOW COLUMNS FROM product_items LIKE 'prompt_note';
```

如果看到 `prompt_note` 字段，说明迁移成功。


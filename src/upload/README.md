# 文件上传模块

## 功能说明

文件上传模块支持多文件上传，并根据不同的 `type` 参数进行不同的数据处理。

## 接口说明

### 文件上传接口

**接口地址**: `POST /upload`

**请求格式**: FormData
- `files`: 文件（支持多个，字段名必须是 `files`）
- `type`: 上传类型（字符串，如 `productID`）
- `shop`: 店铺名称（字符串）

**响应格式**:
```json
{
  "success": true,
  "message": "上传成功，共上传 X 个文件",
  "data": [...]
}
```

## 类型处理

### type === 'productID'

当 `type` 为 `productID` 时，系统会：
1. 解析上传的文件内容（支持 CSV 和 JSON 格式）
2. 提取商品信息（product_id, product_name, product_image）
3. 更新或插入 `product_items` 表

**更新逻辑**:
- 查找 `shop_name` 和 `product_id` 都匹配的记录
- 如果存在：更新该记录的 `product_name` 和 `product_image`
- 如果不存在：插入新记录

### type === 'daily'

当 `type` 为 `daily` 时，系统会：
1. 验证文件名格式：`parentskudetail.YYYYMMDD_YYYYMMDD`（两个日期必须相同）
2. 从文件名解析日期
3. 解析 CSV 或 Excel 文件内容
4. 使用事务处理：先删除相同 shop 和 date 的旧数据，再批量插入新数据到 `daily_product_stats` 表

### type === 'ad'

当 `type` 为 `ad` 时，系统会：
1. 验证文件名格式：`Shopee广告-整体-数据-YYYY_MM_DD-YYYY_MM_DD`（两个日期必须相同）
2. 从文件名解析日期
3. 解析 CSV 文件内容（跳过前7行，第8行是标题）
4. 使用事务处理：先删除相同 shop 和 date 的旧数据，再批量插入新数据到 `ad_stats` 表

### 其他 type

其他类型的上传按照默认逻辑处理（文件存储）。

> **注意**：商品查询和阶段管理接口已迁移到 `products` 模块，请参考 `src/products/README.md` 文档。

## 文件格式

### CSV 格式

**表头格式**（第一行）:
```
产品ID,产品名称,产品图片
```

**数据格式**:
```
12345,商品名称1,https://example.com/image1.jpg,https://example.com/image2.jpg
67890,商品名称2,https://example.com/image3.jpg
```

**字段说明**:
- `产品ID`（必需）：商品ID
- `产品名称`（必需）：商品名称
- `产品图片`（可选）：产品图片链接，如果包含多个链接（用逗号分隔），系统会自动取第一个作为主图

**示例**:
- 单张图片：`https://example.com/image1.jpg`
- 多张图片：`https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg`（只会保存第一个链接）

### 广告数据 CSV 格式（type === 'ad'）

**文件名格式**: `Shopee广告-整体-数据-YYYY_MM_DD-YYYY_MM_DD`

**文件内容格式**:
- 第1-7行：无用行，系统会自动跳过
- 第8行：标题行（必需）
- 第9行及以后：数据行

**标题行格式**（第8行）:
```
排序,广告名称,状态,广告类型,商品编号,创作,竞价方式,版位,开始日期,结束日期,展示次数,点击数,点击率,转化,直接转化,转化率,直接转化率,每转化成本,每一直接转化的成本,商品已出售,直接已售商品,销售金额,直接销售金额,花费,广告支出回报率,直接广告支出回报率,广告销售成本,直接广告销售成本
```

**字段说明**:
- `排序`：不入库，系统会自动忽略
- `商品编号`：必需字段
- 其他字段：可选字段，系统会自动解析数值类型
- 系统会自动添加 `date` 列（从文件名解析）和 `shop` 列（从请求参数获取）

**数据格式示例**:
```
1,测试广告1,启用,搜索广告,12345,自动,CPC,搜索结果,2025-01-01,2025-01-31,1000,100,0.1,10,5,0.01,0.005,10.5,21,20,10,5000,2500,105,47.62,23.81,0.021,0.042
```

### JSON 格式

```json
[
  {
    "product_id": "12345",
    "product_name": "商品名称1",
    "product_image": "https://example.com/image1.jpg"
  },
  {
    "product_id": "67890",
    "product_name": "商品名称2",
    "product_image": "https://example.com/image2.jpg"
  }
]
```

## 数据库表结构

### product_items 表

**表名**: `product_items`

**表说明**: 店铺商品信息表

**表结构**:

```sql
CREATE TABLE product_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  product_id VARCHAR(50) NOT NULL COMMENT '商品ID（业务字段）',
  product_name VARCHAR(255) NOT NULL COMMENT '商品名称',
  product_image VARCHAR(500) DEFAULT NULL COMMENT '商品图片链接',
  shop_name VARCHAR(255) DEFAULT NULL COMMENT '店铺名称',
  testing_stage_start DATETIME DEFAULT NULL COMMENT '测款阶段开始时间',
  testing_stage_end DATETIME DEFAULT NULL COMMENT '测款阶段结束时间',
  potential_stage_start DATETIME DEFAULT NULL COMMENT '潜力阶段开始时间',
  potential_stage_end DATETIME DEFAULT NULL COMMENT '潜力阶段结束时间',
  product_stage_start DATETIME DEFAULT NULL COMMENT '成品阶段开始时间',
  product_stage_end DATETIME DEFAULT NULL COMMENT '成品阶段结束时间',
  abandoned_stage_start DATETIME DEFAULT NULL COMMENT '放弃阶段开始时间',
  abandoned_stage_end DATETIME DEFAULT NULL COMMENT '放弃阶段结束时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_product_id (product_id),
  KEY idx_shop_name (shop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺商品信息表';
```

**新增字段说明**（需要执行 ALTER TABLE 添加）：

```sql
ALTER TABLE product_items 
  ADD COLUMN testing_stage_start DATETIME DEFAULT NULL COMMENT '测款阶段开始时间',
  ADD COLUMN testing_stage_end DATETIME DEFAULT NULL COMMENT '测款阶段结束时间',
  ADD COLUMN potential_stage_start DATETIME DEFAULT NULL COMMENT '潜力阶段开始时间',
  ADD COLUMN potential_stage_end DATETIME DEFAULT NULL COMMENT '潜力阶段结束时间',
  ADD COLUMN product_stage_start DATETIME DEFAULT NULL COMMENT '成品阶段开始时间',
  ADD COLUMN product_stage_end DATETIME DEFAULT NULL COMMENT '成品阶段结束时间',
  ADD COLUMN abandoned_stage_start DATETIME DEFAULT NULL COMMENT '放弃阶段开始时间',
  ADD COLUMN abandoned_stage_end DATETIME DEFAULT NULL COMMENT '放弃阶段结束时间';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT UNSIGNED | 自增主键 | PRIMARY KEY, NOT NULL, AUTO_INCREMENT |
| product_id | VARCHAR(50) | 商品ID（业务字段） | NOT NULL, 索引 |
| product_name | VARCHAR(255) | 商品名称 | NOT NULL |
| product_image | VARCHAR(500) | 商品图片链接 | NULL |
| shop_name | VARCHAR(255) | 店铺名称 | NULL, 索引 |
| testing_stage_start | DATETIME | 测款阶段开始时间 | NULL |
| testing_stage_end | DATETIME | 测款阶段结束时间 | NULL |
| potential_stage_start | DATETIME | 潜力阶段开始时间 | NULL |
| potential_stage_end | DATETIME | 潜力阶段结束时间 | NULL |
| product_stage_start | DATETIME | 成品阶段开始时间 | NULL |
| product_stage_end | DATETIME | 成品阶段结束时间 | NULL |
| abandoned_stage_start | DATETIME | 放弃阶段开始时间 | NULL |
| abandoned_stage_end | DATETIME | 放弃阶段结束时间 | NULL |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

**索引**:
- `PRIMARY KEY (id)`: 主键索引
- `KEY idx_product_id (product_id)`: product_id 索引
- `KEY idx_shop_name (shop_name)`: shop_name 索引

**业务规则**:
- `shop_name` 和 `product_id` 的组合用于判断记录是否存在
- 如果 `shop_name` 和 `product_id` 都匹配，则更新记录
- 如果不存在匹配的记录，则插入新记录

### ad_stats 表

**表名**: `ad_stats`

**表说明**: 广告统计数据表

**表结构**:

```sql
CREATE TABLE ad_stats (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  ad_name VARCHAR(255) DEFAULT NULL COMMENT '广告名称',
  status VARCHAR(50) DEFAULT NULL COMMENT '状态',
  ad_type VARCHAR(50) DEFAULT NULL COMMENT '广告类型',
  product_id VARCHAR(50) NOT NULL COMMENT '商品编号',
  creation VARCHAR(255) DEFAULT NULL COMMENT '创作',
  bidding_method VARCHAR(50) DEFAULT NULL COMMENT '竞价方式',
  placement VARCHAR(255) DEFAULT NULL COMMENT '版位',
  start_date VARCHAR(50) DEFAULT NULL COMMENT '开始日期',
  end_date VARCHAR(50) DEFAULT NULL COMMENT '结束日期',
  impressions INT DEFAULT NULL COMMENT '展示次数',
  clicks INT DEFAULT NULL COMMENT '点击数',
  click_rate FLOAT DEFAULT NULL COMMENT '点击率',
  conversions INT DEFAULT NULL COMMENT '转化',
  direct_conversions INT DEFAULT NULL COMMENT '直接转化',
  conversion_rate FLOAT DEFAULT NULL COMMENT '转化率',
  direct_conversion_rate FLOAT DEFAULT NULL COMMENT '直接转化率',
  cost_per_conversion FLOAT DEFAULT NULL COMMENT '每转化成本',
  cost_per_direct_conversion FLOAT DEFAULT NULL COMMENT '每一直接转化的成本',
  items_sold INT DEFAULT NULL COMMENT '商品已出售',
  direct_items_sold INT DEFAULT NULL COMMENT '直接已售商品',
  sales_amount DECIMAL(10, 2) DEFAULT NULL COMMENT '销售金额（THB）',
  direct_sales_amount DECIMAL(10, 2) DEFAULT NULL COMMENT '直接销售金额（THB）',
  spend DECIMAL(10, 2) DEFAULT NULL COMMENT '花费',
  roas FLOAT DEFAULT NULL COMMENT '广告支出回报率',
  direct_roas FLOAT DEFAULT NULL COMMENT '直接广告支出回报率',
  ad_sales_cost DECIMAL(10, 2) DEFAULT NULL COMMENT '广告销售成本',
  direct_ad_sales_cost DECIMAL(10, 2) DEFAULT NULL COMMENT '直接广告销售成本',
  shop VARCHAR(100) NOT NULL COMMENT '店铺名称',
  date DATE NOT NULL COMMENT '数据日期',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_shop_date (shop, date),
  KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告统计数据表';
```

**字段映射表**（CSV标题 -> 数据库字段）:

| CSV标题 | 数据库字段 | 类型 | 说明 | 是否入库 |
|---------|-----------|------|------|---------|
| 排序 | - | - | 排序字段 | ❌ 不入库 |
| 广告名称 | ad_name | VARCHAR(255) | 广告名称 | ✅ |
| 状态 | status | VARCHAR(50) | 状态 | ✅ |
| 广告类型 | ad_type | VARCHAR(50) | 广告类型 | ✅ |
| 商品编号 | product_id | VARCHAR(50) | 商品编号（必需） | ✅ |
| 创作 | creation | VARCHAR(255) | 创作 | ✅ |
| 竞价方式 | bidding_method | VARCHAR(50) | 竞价方式 | ✅ |
| 版位 | placement | VARCHAR(255) | 版位 | ✅ |
| 开始日期 | start_date | VARCHAR(50) | 开始日期 | ✅ |
| 结束日期 | end_date | VARCHAR(50) | 结束日期 | ✅ |
| 展示次数 | impressions | INT | 展示次数 | ✅ |
| 点击数 | clicks | INT | 点击数 | ✅ |
| 点击率 | click_rate | FLOAT | 点击率 | ✅ |
| 转化 | conversions | INT | 转化 | ✅ |
| 直接转化 | direct_conversions | INT | 直接转化 | ✅ |
| 转化率 | conversion_rate | FLOAT | 转化率 | ✅ |
| 直接转化率 | direct_conversion_rate | FLOAT | 直接转化率 | ✅ |
| 每转化成本 | cost_per_conversion | FLOAT | 每转化成本 | ✅ |
| 每一直接转化的成本 | cost_per_direct_conversion | FLOAT | 每一直接转化的成本 | ✅ |
| 商品已出售 | items_sold | INT | 商品已出售 | ✅ |
| 直接已售商品 | direct_items_sold | INT | 直接已售商品 | ✅ |
| 销售金额 | sales_amount | DECIMAL(10,2) | 销售金额（THB） | ✅ |
| 直接销售金额 | direct_sales_amount | DECIMAL(10,2) | 直接销售金额（THB） | ✅ |
| 花费 | spend | DECIMAL(10,2) | 花费 | ✅ |
| 广告支出回报率 | roas | FLOAT | 广告支出回报率 | ✅ |
| 直接广告支出回报率 | direct_roas | FLOAT | 直接广告支出回报率 | ✅ |
| 广告销售成本 | ad_sales_cost | DECIMAL(10,2) | 广告销售成本 | ✅ |
| 直接广告销售成本 | direct_ad_sales_cost | DECIMAL(10,2) | 直接广告销售成本 | ✅ |
| - | shop | VARCHAR(100) | 店铺名称（从请求参数获取） | ✅ |
| - | date | DATE | 数据日期（从文件名解析） | ✅ |

**索引**:
- `PRIMARY KEY (id)`: 主键索引
- `KEY idx_shop_date (shop, date)`: shop 和 date 联合索引
- `KEY idx_product_id (product_id)`: product_id 索引

**业务规则**:
- 上传时会先删除相同 `shop` 和 `date` 的旧数据，再插入新数据
- 使用事务确保数据一致性
- `product_id` 是必需字段

## 使用示例

### 前端上传示例

```javascript
// 上传 CSV 文件
const formData = new FormData();
formData.append('files', csvFile);
formData.append('type', 'productID');
formData.append('shop', '店铺名称');

const response = await fetch('/upload', {
  method: 'POST',
  body: formData
});
```

### 响应示例

**成功响应**:
```json
{
  "success": true,
  "message": "上传成功，共处理 2 个商品",
  "data": [
    {
      "action": "inserted",
      "id": 1,
      "product_id": "12345",
      "product_name": "商品名称1",
      "shop_name": "店铺名称"
    },
    {
      "action": "updated",
      "id": 2,
      "product_id": "67890",
      "product_name": "商品名称2",
      "shop_name": "店铺名称",
      "affectedRows": 1
    }
  ]
}
```

## 错误处理

如果文件格式不正确或处理失败，会在响应中返回错误信息：

```json
{
  "success": false,
  "message": "上传失败",
  "error": "具体错误信息"
}
```

## 注意事项

### 通用注意事项

1. 文件编码必须是 UTF-8
2. 文件大小限制由服务器配置决定（当前最多 10 个文件）

### productID 类型注意事项

1. CSV 文件第一行必须是表头
2. JSON 文件必须是数组格式
3. `product_id` 和 `product_name` 是必需字段
4. `product_image` 是可选的，可以为空

### daily 类型注意事项

1. 文件名格式必须严格为：`parentskudetail.YYYYMMDD_YYYYMMDD`
2. 文件名中的两个日期必须相同
3. 支持 CSV 和 Excel (.xlsx, .xls) 格式
4. Excel 文件会自动映射表头到数据库字段

### ad 类型注意事项

1. 文件名格式必须严格为：`Shopee广告-整体-数据-YYYY_MM_DD-YYYY_MM_DD`
2. 文件名中的两个日期必须相同
3. 仅支持 CSV 格式
4. CSV 文件前7行为无用行，系统会自动跳过
5. 第8行必须是标题行
6. 第9行及以后是数据行
7. `排序` 列不会入库
8. `商品编号` 是必需字段
9. 系统会自动添加 `date` 列（从文件名解析）和 `shop` 列（从请求参数获取）


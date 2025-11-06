# 文件上传模块

## 功能说明

文件上传模块支持多文件上传，并根据不同的 `type` 参数进行不同的数据处理。

## 接口说明

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

### 其他 type

其他类型的上传按照默认逻辑处理（文件存储）。

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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (id),
  KEY idx_product_id (product_id),
  KEY idx_shop_name (shop_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='店铺商品信息表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | BIGINT UNSIGNED | 自增主键 | PRIMARY KEY, NOT NULL, AUTO_INCREMENT |
| product_id | VARCHAR(50) | 商品ID（业务字段） | NOT NULL, 索引 |
| product_name | VARCHAR(255) | 商品名称 | NOT NULL |
| product_image | VARCHAR(500) | 商品图片链接 | NULL |
| shop_name | VARCHAR(255) | 店铺名称 | NULL, 索引 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

**索引**:
- `PRIMARY KEY (id)`: 主键索引
- `KEY idx_product_id (product_id)`: product_id 索引
- `KEY idx_shop_name (shop_name)`: shop_name 索引

**业务规则**:
- `shop_name` 和 `product_id` 的组合用于判断记录是否存在
- 如果 `shop_name` 和 `product_id` 都匹配，则更新记录
- 如果不存在匹配的记录，则插入新记录

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

1. 文件编码必须是 UTF-8
2. CSV 文件第一行必须是表头
3. JSON 文件必须是数组格式
4. `product_id` 和 `product_name` 是必需字段
5. `product_image` 是可选的，可以为空
6. 文件大小限制由服务器配置决定（当前最多 10 个文件）


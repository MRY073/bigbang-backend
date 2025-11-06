# 商品管理模块

## 功能说明

商品管理模块负责商品的查询和阶段时间段管理功能。

## 接口说明

### 查询店铺商品接口

**接口地址**: `GET /products`

**请求参数**:
- `shop` (query, 必需): 商店ID（店铺名称）

**请求示例**:
```
GET /products?shop=店铺名称
```

**响应格式**:
```json
{
  "success": true,
  "message": "查询成功",
  "data": [
    {
      "product_id": "12345",
      "product_name": "商品名称1",
      "product_image": "https://example.com/image1.jpg",
      "testing_stage": {
        "start_time": "2025-01-01T00:00:00.000Z",
        "end_time": "2025-01-31T23:59:59.000Z"
      },
      "potential_stage": {
        "start_time": null,
        "end_time": null
      },
      "product_stage": {
        "start_time": null,
        "end_time": null
      },
      "abandoned_stage": {
        "start_time": null,
        "end_time": null
      }
    }
  ]
}
```

**字段说明**:
- `product_id`: 产品ID
- `product_name`: 产品名称
- `product_image`: 产品主图（可为 null）
- `testing_stage`: 测款阶段时间段对象
  - `start_time`: 开始时间（ISO 8601 格式字符串，可为 null）
  - `end_time`: 结束时间（ISO 8601 格式字符串，可为 null）
- `potential_stage`: 潜力阶段时间段对象（结构同 testing_stage）
- `product_stage`: 成品阶段时间段对象（结构同 testing_stage）
- `abandoned_stage`: 放弃阶段时间段对象（结构同 testing_stage）

**错误响应**:
```json
{
  "success": false,
  "message": "查询失败",
  "error": "具体错误信息"
}
```

### 修改阶段时间段接口

**接口地址**: `PUT /products/stage`

**请求格式**: JSON

**请求头**:
```
Content-Type: application/json
```

**请求参数**:
```json
{
  "product_id": "12345",
  "shop": "店铺名称",
  "stage_type": "testing",
  "start_time": "2025-01-01T00:00:00.000Z",
  "end_time": "2025-01-31T23:59:59.000Z"
}
```

**参数说明**:
- `product_id` (必需): 产品ID，字符串类型
- `shop` (必需): 商店ID（店铺名称），字符串类型
- `stage_type` (必需): 阶段类型，字符串类型，必须是以下值之一：
  - `"testing"` - 测款阶段
  - `"potential"` - 潜力阶段
  - `"product"` - 成品阶段
  - `"abandoned"` - 放弃阶段
- `start_time` (可选): 开始时间，ISO 8601 格式字符串（如 `"2025-01-01T00:00:00.000Z"`），可为 `null` 或空字符串表示清空
- `end_time` (可选): 结束时间，ISO 8601 格式字符串，可为 `null` 或空字符串表示清空

**成功响应**:
```json
{
  "success": true,
  "message": "成功更新商品阶段时间段：testing",
  "data": {
    "success": true,
    "message": "成功更新商品阶段时间段：testing"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "更新失败",
  "error": "具体错误信息"
}
```

**使用示例**:
```javascript
// 设置测款阶段时间段
fetch('/products/stage', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product_id: '12345',
    shop: '店铺名称',
    stage_type: 'testing',
    start_time: '2025-01-01T00:00:00.000Z',
    end_time: '2025-01-31T23:59:59.000Z',
  }),
});

// 清空潜力阶段时间段
fetch('/products/stage', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product_id: '12345',
    shop: '店铺名称',
    stage_type: 'potential',
    start_time: null,
    end_time: null,
  }),
});
```

## 数据库表结构

### product_items 表

商品管理模块使用 `product_items` 表存储商品信息，包括四个阶段的时间段字段。

**相关字段**:
- `testing_stage_start` / `testing_stage_end` - 测款阶段
- `potential_stage_start` / `potential_stage_end` - 潜力阶段
- `product_stage_start` / `product_stage_end` - 成品阶段
- `abandoned_stage_start` / `abandoned_stage_end` - 放弃阶段

详细表结构请参考 `src/upload/README.md` 中的 `product_items` 表说明。

## 注意事项

1. **时间格式**：所有时间字段使用 ISO 8601 格式（如 `"2025-01-01T00:00:00.000Z"`）
2. **空值处理**：`start_time` 和 `end_time` 可以为 `null`，表示该时间段未设置
3. **商品验证**：修改阶段时间段时，系统会验证商品是否存在（根据 `shop` 和 `product_id`）
4. **阶段类型**：`stage_type` 必须是指定的四个值之一，否则会返回错误

## 错误处理

- **参数缺失**：如果必需参数缺失，返回 400 错误
- **商品不存在**：如果指定的商品不存在，返回错误信息
- **时间格式错误**：如果时间格式不正确，返回错误信息
- **网络错误**：如果数据库操作失败，返回 500 错误


# 更新商品上下架状态 API

## 接口地址
```
PUT /product-items/:id/status
```

## 请求参数

**URL 参数**:
- `id` (string, 必填) - 商品ID（可以是主键id或product_id）

**Body 参数** (JSON):
- `status` (number, 必填) - 上下架状态：`0`=上架，`1`=下架

## 请求示例

```json
PUT /product-items/123/status
Content-Type: application/json

{
  "status": 1
}
```

或者使用 product_id：

```json
PUT /product-items/product123/status
Content-Type: application/json

{
  "status": 0
}
```

## 响应格式

**成功响应** (200):
```json
{
  "success": true,
  "message": "商品已下架",
  "data": {
    "id": 123,
    "product_id": "product123",
    "product_name": "商品名称",
    "product_image": "https://example.com/image.jpg",
    "status": 1
  }
}
```

**错误响应** (400):
```json
{
  "success": false,
  "error": "参数错误",
  "message": "status 必须是 0（上架）或 1（下架）"
}
```

**错误响应** (404):
```json
{
  "success": false,
  "error": "商品不存在",
  "message": "无法找到指定的商品"
}
```

## 说明
- 需要鉴权（Authorization Header）
- `status` 值：`0` 表示上架，`1` 表示下架
- `id` 参数支持主键ID或product_id


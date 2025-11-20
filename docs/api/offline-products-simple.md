# 获取下架商品列表 API

## 接口地址
```
GET /product-items/offline
```

## 请求参数

**Query 参数**:
- `shopID` (string, 必填) - 店铺ID
- `shopName` (string, 必填) - 店铺名称
- `page` (number, 可选) - 页码，默认 1
- `pageSize` (number, 可选) - 每页数量，默认 20，最大 100
- `customCategory` (string, 可选) - 自定义分类筛选

## 请求示例
```
GET /product-items/offline?shopID=shop123&shopName=测试店铺&page=1&pageSize=20
```

## 响应格式

**成功响应** (200):
```json
{
  "success": true,
  "message": "拉取成功，共 10 条下架商品数据",
  "data": [
    {
      "id": 1,
      "product_id": "12345",
      "product_name": "商品名称",
      "product_image": "https://example.com/image.jpg",
      "status": 1,
      "custom_category_1": "分类1",
      "custom_category_2": null,
      "custom_category_3": null,
      "custom_category_4": null
    }
  ],
  "total": 10
}
```

**错误响应** (400):
```json
{
  "success": false,
  "error": "参数错误",
  "message": "shopID 和 shopName 参数不能为空"
}
```

## 说明
- 需要鉴权（Authorization Header）
- 返回状态为 `status = 1` 的下架商品
- 支持分页和自定义分类筛选


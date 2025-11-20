# 获取下架商品列表 API

## 接口信息

**接口地址**: `GET /product-items/offline`

**需要鉴权**: 是

## 请求参数

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| shopID | string | 是 | 店铺ID |
| shopName | string | 是 | 店铺名称 |
| page | number | 否 | 页码，默认 1 |
| pageSize | number | 否 | 每页数量，默认 20，最大 100 |
| customCategory | string | 否 | 自定义分类筛选（模糊匹配） |

## 请求示例

```
GET /product-items/offline?shopID=shop123&shopName=测试店铺&page=1&pageSize=20
```

## 响应格式

### 成功响应 (200)

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

### 错误响应 (400)

```json
{
  "success": false,
  "error": "参数错误",
  "message": "shopID 和 shopName 参数不能为空"
}
```

## 响应字段说明

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | array | 下架商品列表 |
| total | number | 总记录数 |
| data[].id | number | 商品主键ID |
| data[].product_id | string | 商品ID（业务字段） |
| data[].product_name | string | 商品名称 |
| data[].product_image | string \| null | 商品图片链接 |
| data[].status | number | 上下架状态（1=下架） |
| data[].custom_category_1~4 | string \| null | 自定义分类1~4 |


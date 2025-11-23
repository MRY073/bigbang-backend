# 更新商品竞争对手信息 API

## 接口地址
```
PUT /product-items/:id/competitor-info
```

## 功能说明
用于更新商品的竞争对手相关信息，包括竞争对手链接和竞争对手日均销量。

## 请求参数

### URL 参数
- `id` (string, 必填) - 商品ID，可以是主键id（数字）或product_id（字符串）

### Body 参数 (JSON)
- `competitor_link` (string | null, 可选) - 竞争对手链接，可能包含泰文等字符，支持长文本
- `competitor_daily_sales` (string | null, 可选) - 竞争对手日均销量，字符串类型

**注意**：
- 两个字段都是可选的，可以只更新其中一个字段
- 传入 `null` 或空字符串 `""` 会清空对应字段的值
- 字符串会自动去除首尾空格

## 请求示例

### 示例 1：同时更新两个字段
```http
PUT /product-items/123/competitor-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "competitor_link": "https://shopee.co.th/product/123456789?smtt=0.0.9",
  "competitor_daily_sales": "50-100"
}
```

### 示例 2：只更新竞争对手链接
```http
PUT /product-items/123/competitor-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "competitor_link": "https://shopee.co.th/product/123456789?smtt=0.0.9"
}
```

### 示例 3：只更新日均销量
```http
PUT /product-items/123/competitor-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "competitor_daily_sales": "100+"
}
```

### 示例 4：清空字段（设置为 null）
```http
PUT /product-items/123/competitor-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "competitor_link": null,
  "competitor_daily_sales": null
}
```

### 示例 5：使用 product_id 作为 ID
```http
PUT /product-items/product123/competitor-info
Content-Type: application/json
Authorization: Bearer <token>

{
  "competitor_link": "https://shopee.co.th/product/123456789?smtt=0.0.9",
  "competitor_daily_sales": "50-100"
}
```

## 响应格式

### 成功响应 (200 OK)
```json
{
  "success": true,
  "message": "竞争对手信息更新成功",
  "data": {
    "id": 123,
    "product_id": "product123",
    "product_name": "商品名称",
    "product_image": "https://example.com/image.jpg",
    "competitor_link": "https://shopee.co.th/product/123456789?smtt=0.0.9",
    "competitor_daily_sales": "50-100"
  }
}
```

### 错误响应 (400 Bad Request)
当请求参数格式错误时：
```json
{
  "success": false,
  "error": "参数错误",
  "message": "具体错误信息"
}
```

### 错误响应 (404 Not Found)
当商品不存在时：
```json
{
  "success": false,
  "error": "商品不存在",
  "message": "无法找到指定的商品"
}
```

### 错误响应 (500 Internal Server Error)
当服务器内部错误时：
```json
{
  "success": false,
  "error": "服务器错误",
  "message": "具体错误信息"
}
```

## 字段说明

### 请求字段
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| competitor_link | string \| null | 否 | 竞争对手链接，支持长文本和特殊字符（如泰文），可以为 null 或空字符串 |
| competitor_daily_sales | string \| null | 否 | 竞争对手日均销量，字符串类型，可以为 null 或空字符串 |

### 响应字段
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | number | 商品主键ID |
| product_id | string | 商品业务ID |
| product_name | string | 商品名称 |
| product_image | string \| null | 商品图片链接 |
| competitor_link | string \| null | 竞争对手链接 |
| competitor_daily_sales | string \| null | 竞争对手日均销量 |

## 使用示例

### JavaScript / TypeScript (fetch)
```typescript
async function updateCompetitorInfo(
  productId: string | number,
  competitorLink?: string | null,
  dailySales?: string | null
) {
  const response = await fetch(
    `/product-items/${productId}/competitor-info`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        competitor_link: competitorLink,
        competitor_daily_sales: dailySales,
      }),
    }
  );

  const result = await response.json();
  
  if (result.success) {
    console.log('更新成功:', result.data);
    return result.data;
  } else {
    console.error('更新失败:', result.message);
    throw new Error(result.message);
  }
}

// 使用示例
updateCompetitorInfo(
  123,
  'https://shopee.co.th/product/123456789?smtt=0.0.9',
  '50-100'
);
```

### JavaScript / TypeScript (axios)
```typescript
import axios from 'axios';

async function updateCompetitorInfo(
  productId: string | number,
  competitorLink?: string | null,
  dailySales?: string | null
) {
  try {
    const response = await axios.put(
      `/product-items/${productId}/competitor-info`,
      {
        competitor_link: competitorLink,
        competitor_daily_sales: dailySales,
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log('更新成功:', response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error('更新失败:', error.response.data.message);
    } else {
      console.error('请求失败:', error.message);
    }
    throw error;
  }
}

// 使用示例
updateCompetitorInfo(
  123,
  'https://shopee.co.th/product/123456789?smtt=0.0.9',
  '50-100'
);
```

### cURL
```bash
# 更新竞争对手信息
curl -X PUT \
  'http://localhost:3000/product-items/123/competitor-info' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <token>' \
  -d '{
    "competitor_link": "https://shopee.co.th/product/123456789?smtt=0.0.9",
    "competitor_daily_sales": "50-100"
  }'
```

## 注意事项

1. **鉴权要求**：此接口需要鉴权，请在请求头中包含 `Authorization: Bearer <token>`

2. **ID 参数**：
   - 支持主键ID（数字）：`/product-items/123/competitor-info`
   - 支持product_id（字符串）：`/product-items/product123/competitor-info`

3. **字段更新**：
   - 可以只更新其中一个字段，未提供的字段不会被修改
   - 传入 `null` 或空字符串 `""` 会清空对应字段
   - 字符串会自动去除首尾空格

4. **数据格式**：
   - `competitor_link` 支持长文本，可以包含泰文等特殊字符
   - `competitor_daily_sales` 是字符串类型，可以存储任何格式的销量信息（如 "50-100"、"100+"、"约80" 等）

5. **错误处理**：
   - 商品不存在时返回 404
   - 参数错误时返回 400
   - 服务器错误时返回 500

## 相关接口

- `PUT /product-items/:id` - 更新商品自定义分类和提示词备注（也支持更新竞争对手信息）
- `GET /product-items` - 获取商品列表（返回数据包含竞争对手信息字段）
- `GET /product-items/offline` - 获取下架商品列表（返回数据包含竞争对手信息字段）


# MySQL 数据库操作模块

## 功能说明

提供 MySQL 数据库的常用操作功能，包括：
- 连接管理（连接池）
- CRUD 操作
- 事务支持
- 分页查询

## 使用方法

### 1. 在模块中导入 DatabaseModule

```typescript
import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MysqlService } from './database/mysql.service';

@Module({
  imports: [DatabaseModule], // 导入数据库模块
  providers: [YourService],
})
export class YourModule {}
```

### 2. 在服务中注入 MysqlService

```typescript
import { Injectable } from '@nestjs/common';
import { MysqlService } from '../database/mysql.service';

@Injectable()
export class YourService {
  constructor(private readonly mysqlService: MysqlService) {}

  async getData() {
    // 使用数据库服务
  }
}
```

## API 文档

### 基础查询

#### query<T>(sql: string, params?: any[]): Promise<T[]>
执行查询语句，返回结果数组

```typescript
const users = await this.mysqlService.query<User>(
  'SELECT * FROM users WHERE age > ?',
  [18]
);
```

#### queryOne<T>(sql: string, params?: any[]): Promise<T | null>
查询单条记录

```typescript
const user = await this.mysqlService.queryOne<User>(
  'SELECT * FROM users WHERE id = ?',
  [1]
);
```

#### execute(sql: string, params?: any[]): Promise<{affectedRows: number, insertId: number}>
执行更新操作（INSERT, UPDATE, DELETE）

```typescript
const result = await this.mysqlService.execute(
  'UPDATE users SET name = ? WHERE id = ?',
  ['新名字', 1]
);
console.log('影响行数:', result.affectedRows);
```

### CRUD 操作

#### insert(table: string, data: Record<string, any>): Promise<number>
插入单条记录

```typescript
const id = await this.mysqlService.insert('users', {
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
});
console.log('插入的ID:', id);
```

#### insertMany(table: string, dataArray: Record<string, any>[]): Promise<number>
批量插入记录

```typescript
const affectedRows = await this.mysqlService.insertMany('users', [
  { name: '张三', age: 25 },
  { name: '李四', age: 30 },
  { name: '王五', age: 28 }
]);
console.log('插入行数:', affectedRows);
```

#### update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number>
更新记录

```typescript
const affectedRows = await this.mysqlService.update(
  'users',
  { name: '新名字', age: 26 },
  { id: 1 }
);
console.log('更新行数:', affectedRows);
```

#### delete(table: string, where: Record<string, any>): Promise<number>
删除记录

```typescript
const affectedRows = await this.mysqlService.delete('users', { id: 1 });
console.log('删除行数:', affectedRows);
```

### 便捷查询方法

#### findById<T>(table: string, id: number | string, idColumn?: string): Promise<T | null>
根据ID查询

```typescript
const user = await this.mysqlService.findById<User>('users', 1);
```

#### findAll<T>(table: string, where?: Record<string, any>): Promise<T[]>
查询所有记录（可带条件）

```typescript
// 查询所有
const allUsers = await this.mysqlService.findAll<User>('users');

// 带条件查询
const adultUsers = await this.mysqlService.findAll<User>('users', { age: 25 });
```

#### findPage<T>(table: string, page?: number, pageSize?: number, where?: Record<string, any>): Promise<{data: T[], total: number, page: number, pageSize: number}>
分页查询

```typescript
const result = await this.mysqlService.findPage<User>(
  'users',
  1,  // 页码
  10, // 每页数量
  { age: 25 } // 可选的条件
);

console.log('数据:', result.data);
console.log('总数:', result.total);
console.log('当前页:', result.page);
```

### 事务操作

#### transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T>
执行事务

```typescript
await this.mysqlService.transaction(async (connection) => {
  // 在事务中执行多个操作
  await connection.execute('UPDATE users SET balance = balance - ? WHERE id = ?', [100, 1]);
  await connection.execute('UPDATE users SET balance = balance + ? WHERE id = ?', [100, 2]);
  // 如果任何操作失败，会自动回滚
});
```

## 配置文件

数据库配置在 `mysql.config.ts` 中：

```typescript
export const mysqlConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Rulener@1207',
  database: 'bigbangShopee',
  // ... 其他配置
};
```

## 注意事项

1. 使用连接池管理连接，不需要手动管理连接的创建和释放
2. 所有方法都支持参数化查询，防止 SQL 注入
3. 事务操作会自动处理提交和回滚
4. 模块使用 `@Global()` 装饰器，导入一次后可在任何模块中使用


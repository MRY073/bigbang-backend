/**
 * MySQL 服务使用示例
 * 这个文件展示了如何使用 MysqlService 进行各种数据库操作
 */
import { Injectable } from '@nestjs/common';
import { MysqlService } from './mysql.service';

// 示例：用户实体类型
interface User {
  id?: number;
  name: string;
  age: number;
  email: string;
  createdAt?: Date;
}

@Injectable()
export class ExampleService {
  constructor(private readonly mysqlService: MysqlService) {}

  /**
   * 示例 1: 插入单条记录
   */
  async createUser(user: User): Promise<number> {
    const insertId = await this.mysqlService.insert('users', {
      name: user.name,
      age: user.age,
      email: user.email,
    });
    return insertId;
  }

  /**
   * 示例 2: 批量插入记录
   */
  async createUsers(users: User[]): Promise<number> {
    const affectedRows = await this.mysqlService.insertMany('users', users);
    return affectedRows;
  }

  /**
   * 示例 3: 根据ID查询
   */
  async getUserById(id: number): Promise<User | null> {
    return await this.mysqlService.findById<User>('users', id);
  }

  /**
   * 示例 4: 查询所有记录
   */
  async getAllUsers(): Promise<User[]> {
    return await this.mysqlService.findAll<User>('users');
  }

  /**
   * 示例 5: 条件查询
   */
  async getUsersByAge(age: number): Promise<User[]> {
    return await this.mysqlService.findAll<User>('users', { age });
  }

  /**
   * 示例 6: 分页查询
   */
  async getUsersPage(page: number = 1, pageSize: number = 10) {
    return await this.mysqlService.findPage<User>('users', page, pageSize);
  }

  /**
   * 示例 7: 更新记录
   */
  async updateUser(id: number, data: Partial<User>): Promise<number> {
    return await this.mysqlService.update('users', data, { id });
  }

  /**
   * 示例 8: 删除记录
   */
  async deleteUser(id: number): Promise<number> {
    return await this.mysqlService.delete('users', { id });
  }

  /**
   * 示例 9: 自定义 SQL 查询
   */
  async getUsersWithCustomQuery(): Promise<User[]> {
    const sql = `
      SELECT * FROM users 
      WHERE age > ? AND email LIKE ?
      ORDER BY createdAt DESC
      LIMIT 10
    `;
    return await this.mysqlService.query<User>(sql, [18, '%@example.com']);
  }

  /**
   * 示例 10: 执行事务
   */
  async transferBalance(
    fromUserId: number,
    toUserId: number,
    amount: number,
  ): Promise<void> {
    await this.mysqlService.transaction(async (connection) => {
      // 扣减转出用户的余额
      await connection.execute(
        'UPDATE accounts SET balance = balance - ? WHERE userId = ?',
        [amount, fromUserId],
      );

      // 增加转入用户的余额
      await connection.execute(
        'UPDATE accounts SET balance = balance + ? WHERE userId = ?',
        [amount, toUserId],
      );

      // 如果任何操作失败，会自动回滚
    });
  }

  /**
   * 示例 11: 复杂查询（使用原生 SQL）
   */
  async getUsersWithStats(): Promise<any[]> {
    const sql = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id) as orderCount,
        SUM(o.total) as totalAmount
      FROM users u
      LEFT JOIN orders o ON u.id = o.userId
      GROUP BY u.id
      HAVING orderCount > 0
      ORDER BY totalAmount DESC
    `;
    return await this.mysqlService.query(sql);
  }
}

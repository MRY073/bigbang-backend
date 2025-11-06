import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPool, Pool, PoolConnection } from 'mysql2/promise';
import { mysqlConfig } from './mysql.config';

/**
 * MySQL 数据库操作服务
 * 提供常用的数据库操作方法
 */
@Injectable()
export class MysqlService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    // 创建连接池
    this.pool = createPool({
      ...mysqlConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async onModuleInit() {
    // 测试数据库连接
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL 数据库连接成功');
      connection.release();
    } catch (error) {
      console.error('❌ MySQL 数据库连接失败:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    // 关闭连接池
    await this.pool.end();
    console.log('MySQL 连接池已关闭');
  }

  /**
   * 获取数据库连接
   */
  async getConnection(): Promise<PoolConnection> {
    return await this.pool.getConnection();
  }

  /**
   * 执行查询（返回结果集）
   * @param sql SQL 语句
   * @param params 参数数组
   * @returns 查询结果
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows as T[];
    } catch (error) {
      console.error('查询执行失败:', error);
      throw error;
    }
  }

  /**
   * 执行更新（INSERT, UPDATE, DELETE）
   * @param sql SQL 语句
   * @param params 参数数组
   * @returns 影响的行数和插入ID
   */
  async execute(
    sql: string,
    params: any[] = [],
  ): Promise<{ affectedRows: number; insertId: number }> {
    try {
      const [result] = await this.pool.execute(sql, params);
      const insertResult = result as any;
      return {
        affectedRows: insertResult.affectedRows || 0,
        insertId: insertResult.insertId || 0,
      };
    } catch (error) {
      console.error('执行失败:', error);
      throw error;
    }
  }

  /**
   * 查询单条记录
   * @param sql SQL 语句
   * @param params 参数数组
   * @returns 单条记录或 null
   */
  async queryOne<T = any>(
    sql: string,
    params: any[] = [],
  ): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 插入单条记录
   * @param table 表名
   * @param data 数据对象
   * @returns 插入的ID
   */
  async insert(table: string, data: Record<string, any>): Promise<number> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await this.execute(sql, values);
    return result.insertId;
  }

  /**
   * 批量插入记录
   * @param table 表名
   * @param dataArray 数据数组
   * @returns 影响的行数
   */
  async insertMany(
    table: string,
    dataArray: Record<string, any>[],
  ): Promise<number> {
    if (dataArray.length === 0) return 0;

    const keys = Object.keys(dataArray[0]);
    const placeholders = keys.map(() => '?').join(', ');
    const values: any[] = [];

    // 构建 VALUES 部分
    const valuePlaceholders = dataArray
      .map(() => `(${placeholders})`)
      .join(', ');

    // 收集所有值
    dataArray.forEach((data) => {
      keys.forEach((key) => {
        values.push(data[key]);
      });
    });

    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${valuePlaceholders}`;
    const result = await this.execute(sql, values);
    return result.affectedRows;
  }

  /**
   * 更新记录
   * @param table 表名
   * @param data 更新的数据
   * @param where 条件对象
   * @returns 影响的行数
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>,
  ): Promise<number> {
    const setClause = Object.keys(data)
      .map((key) => `${key} = ?`)
      .join(', ');
    const whereClause = Object.keys(where)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const values = [...Object.values(data), ...Object.values(where)];

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const result = await this.execute(sql, values);
    return result.affectedRows;
  }

  /**
   * 删除记录
   * @param table 表名
   * @param where 条件对象
   * @returns 影响的行数
   */
  async delete(
    table: string,
    where: Record<string, any>,
  ): Promise<number> {
    const whereClause = Object.keys(where)
      .map((key) => `${key} = ?`)
      .join(' AND ');
    const values = Object.values(where);

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const result = await this.execute(sql, values);
    return result.affectedRows;
  }

  /**
   * 根据ID查询单条记录
   * @param table 表名
   * @param id ID值
   * @param idColumn ID列名（默认为 'id'）
   * @returns 记录或 null
   */
  async findById<T = any>(
    table: string,
    id: number | string,
    idColumn: string = 'id',
  ): Promise<T | null> {
    const sql = `SELECT * FROM ${table} WHERE ${idColumn} = ?`;
    return await this.queryOne<T>(sql, [id]);
  }

  /**
   * 查询所有记录
   * @param table 表名
   * @param where 条件对象（可选）
   * @returns 记录数组
   */
  async findAll<T = any>(
    table: string,
    where?: Record<string, any>,
  ): Promise<T[]> {
    let sql = `SELECT * FROM ${table}`;
    const params: any[] = [];

    if (where && Object.keys(where).length > 0) {
      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(where));
    }

    return await this.query<T>(sql, params);
  }

  /**
   * 分页查询
   * @param table 表名
   * @param page 页码（从1开始）
   * @param pageSize 每页数量
   * @param where 条件对象（可选）
   * @returns 分页结果
   */
  async findPage<T = any>(
    table: string,
    page: number = 1,
    pageSize: number = 10,
    where?: Record<string, any>,
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
    const offset = (page - 1) * pageSize;
    let whereClause = '';
    const params: any[] = [];

    if (where && Object.keys(where).length > 0) {
      whereClause =
        ' WHERE ' +
        Object.keys(where)
          .map((key) => `${key} = ?`)
          .join(' AND ');
      params.push(...Object.values(where));
    }

    // 查询总数
    const countSql = `SELECT COUNT(*) as total FROM ${table}${whereClause}`;
    const countResult = await this.queryOne<{ total: number }>(
      countSql,
      params,
    );
    const total = countResult?.total || 0;

    // 查询数据
    const sql = `SELECT * FROM ${table}${whereClause} LIMIT ? OFFSET ?`;
    const data = await this.query<T>(sql, [...params, pageSize, offset]);

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   * @returns 事务执行结果
   */
  async transaction<T>(
    callback: (connection: PoolConnection) => Promise<T>,
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}


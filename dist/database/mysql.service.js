"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MysqlService = void 0;
const common_1 = require("@nestjs/common");
const promise_1 = require("mysql2/promise");
const mysql_config_1 = require("./mysql.config");
let MysqlService = class MysqlService {
    pool;
    constructor() {
        this.pool = (0, promise_1.createPool)({
            ...mysql_config_1.mysqlConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
        });
    }
    async onModuleInit() {
        try {
            const connection = await this.pool.getConnection();
            console.log('✅ MySQL 数据库连接成功');
            connection.release();
        }
        catch (error) {
            console.error('❌ MySQL 数据库连接失败:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.pool.end();
        console.log('MySQL 连接池已关闭');
    }
    async getConnection() {
        return await this.pool.getConnection();
    }
    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        }
        catch (error) {
            console.error('查询执行失败:', error);
            throw error;
        }
    }
    async execute(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            const insertResult = result;
            return {
                affectedRows: insertResult.affectedRows || 0,
                insertId: insertResult.insertId || 0,
            };
        }
        catch (error) {
            console.error('执行失败:', error);
            throw error;
        }
    }
    async queryOne(sql, params = []) {
        const results = await this.query(sql, params);
        return results.length > 0 ? results[0] : null;
    }
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        const result = await this.execute(sql, values);
        return result.insertId;
    }
    async insertMany(table, dataArray) {
        if (dataArray.length === 0)
            return 0;
        const keys = Object.keys(dataArray[0]);
        const placeholders = keys.map(() => '?').join(', ');
        const values = [];
        const valuePlaceholders = dataArray
            .map(() => `(${placeholders})`)
            .join(', ');
        dataArray.forEach((data) => {
            keys.forEach((key) => {
                values.push(data[key]);
            });
        });
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES ${valuePlaceholders}`;
        const result = await this.execute(sql, values);
        return result.affectedRows;
    }
    async update(table, data, where) {
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
    async delete(table, where) {
        const whereClause = Object.keys(where)
            .map((key) => `${key} = ?`)
            .join(' AND ');
        const values = Object.values(where);
        const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await this.execute(sql, values);
        return result.affectedRows;
    }
    async findById(table, id, idColumn = 'id') {
        const sql = `SELECT * FROM ${table} WHERE ${idColumn} = ?`;
        return await this.queryOne(sql, [id]);
    }
    async findAll(table, where) {
        let sql = `SELECT * FROM ${table}`;
        const params = [];
        if (where && Object.keys(where).length > 0) {
            const whereClause = Object.keys(where)
                .map((key) => `${key} = ?`)
                .join(' AND ');
            sql += ` WHERE ${whereClause}`;
            params.push(...Object.values(where));
        }
        return await this.query(sql, params);
    }
    async findPage(table, page = 1, pageSize = 10, where) {
        const offset = (page - 1) * pageSize;
        let whereClause = '';
        const params = [];
        if (where && Object.keys(where).length > 0) {
            whereClause =
                ' WHERE ' +
                    Object.keys(where)
                        .map((key) => `${key} = ?`)
                        .join(' AND ');
            params.push(...Object.values(where));
        }
        const countSql = `SELECT COUNT(*) as total FROM ${table}${whereClause}`;
        const countResult = await this.queryOne(countSql, params);
        const total = countResult?.total || 0;
        const sql = `SELECT * FROM ${table}${whereClause} LIMIT ? OFFSET ?`;
        const data = await this.query(sql, [...params, pageSize, offset]);
        return {
            data,
            total,
            page,
            pageSize,
        };
    }
    async transaction(callback) {
        const connection = await this.pool.getConnection();
        await connection.beginTransaction();
        try {
            const result = await callback(connection);
            await connection.commit();
            return result;
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
};
exports.MysqlService = MysqlService;
exports.MysqlService = MysqlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MysqlService);
//# sourceMappingURL=mysql.service.js.map
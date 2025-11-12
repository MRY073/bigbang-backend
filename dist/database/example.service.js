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
exports.ExampleService = void 0;
const common_1 = require("@nestjs/common");
const mysql_service_1 = require("./mysql.service");
let ExampleService = class ExampleService {
    mysqlService;
    constructor(mysqlService) {
        this.mysqlService = mysqlService;
    }
    async createUser(user) {
        const insertId = await this.mysqlService.insert('users', {
            name: user.name,
            age: user.age,
            email: user.email,
        });
        return insertId;
    }
    async createUsers(users) {
        const affectedRows = await this.mysqlService.insertMany('users', users);
        return affectedRows;
    }
    async getUserById(id) {
        return await this.mysqlService.findById('users', id);
    }
    async getAllUsers() {
        return await this.mysqlService.findAll('users');
    }
    async getUsersByAge(age) {
        return await this.mysqlService.findAll('users', { age });
    }
    async getUsersPage(page = 1, pageSize = 10) {
        return await this.mysqlService.findPage('users', page, pageSize);
    }
    async updateUser(id, data) {
        return await this.mysqlService.update('users', data, { id });
    }
    async deleteUser(id) {
        return await this.mysqlService.delete('users', { id });
    }
    async getUsersWithCustomQuery() {
        const sql = `
      SELECT * FROM users 
      WHERE age > ? AND email LIKE ?
      ORDER BY createdAt DESC
      LIMIT 10
    `;
        return await this.mysqlService.query(sql, [18, '%@example.com']);
    }
    async transferBalance(fromUserId, toUserId, amount) {
        await this.mysqlService.transaction(async (connection) => {
            await connection.execute('UPDATE accounts SET balance = balance - ? WHERE userId = ?', [amount, fromUserId]);
            await connection.execute('UPDATE accounts SET balance = balance + ? WHERE userId = ?', [amount, toUserId]);
        });
    }
    async getUsersWithStats() {
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
};
exports.ExampleService = ExampleService;
exports.ExampleService = ExampleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_service_1.MysqlService])
], ExampleService);
//# sourceMappingURL=example.service.js.map
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PoolConnection } from 'mysql2/promise';
export declare class MysqlService implements OnModuleInit, OnModuleDestroy {
    private pool;
    constructor();
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    getConnection(): Promise<PoolConnection>;
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    execute(sql: string, params?: any[]): Promise<{
        affectedRows: number;
        insertId: number;
    }>;
    queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
    insert(table: string, data: Record<string, any>): Promise<number>;
    insertMany(table: string, dataArray: Record<string, any>[]): Promise<number>;
    update(table: string, data: Record<string, any>, where: Record<string, any>): Promise<number>;
    delete(table: string, where: Record<string, any>): Promise<number>;
    findById<T = any>(table: string, id: number | string, idColumn?: string): Promise<T | null>;
    findAll<T = any>(table: string, where?: Record<string, any>): Promise<T[]>;
    findPage<T = any>(table: string, page?: number, pageSize?: number, where?: Record<string, any>): Promise<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    transaction<T>(callback: (connection: PoolConnection) => Promise<T>): Promise<T>;
}

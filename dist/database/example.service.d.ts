import { MysqlService } from './mysql.service';
interface User {
    id?: number;
    name: string;
    age: number;
    email: string;
    createdAt?: Date;
}
export declare class ExampleService {
    private readonly mysqlService;
    constructor(mysqlService: MysqlService);
    createUser(user: User): Promise<number>;
    createUsers(users: User[]): Promise<number>;
    getUserById(id: number): Promise<User | null>;
    getAllUsers(): Promise<User[]>;
    getUsersByAge(age: number): Promise<User[]>;
    getUsersPage(page?: number, pageSize?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    updateUser(id: number, data: Partial<User>): Promise<number>;
    deleteUser(id: number): Promise<number>;
    getUsersWithCustomQuery(): Promise<User[]>;
    transferBalance(fromUserId: number, toUserId: number, amount: number): Promise<void>;
    getUsersWithStats(): Promise<any[]>;
}
export {};

/**
 * MySQL 数据库配置
 */
export const mysqlConfig = {
  host: 'localhost', // 数据库地址
  port: 3306, // 数据库端口
  user: 'root', // 数据库用户名
  password: 'Rulener@1207', // 数据库密码
  database: 'bigbangShopee', // 数据库名
  waitForConnections: true, // 等待连接
  connectionLimit: 10, // 最大连接数
  queueLimit: 0, // 队列限制（0表示无限制）
  enableKeepAlive: true, // 保持连接
  keepAliveInitialDelay: 0, // 保持连接初始延迟
};

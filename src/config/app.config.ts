/**
 * 应用配置
 * 所有配置直接写死在文件中，不使用环境变量
 */

export interface AppConfig {
  /** 是否为生产环境 */
  isProduction: boolean;
  /** 服务端口 */
  port: number;
}

/**
 * 应用配置
 * 修改此配置以切换开发/生产环境
 */
export const appConfig: AppConfig = {
  // 设置为 true 表示生产环境，false 表示开发环境
  isProduction: false,
  // 服务端口
  port: 3000,
};


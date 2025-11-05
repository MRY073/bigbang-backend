import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // 新增：验证 token 是否有效（解码后检查用户名和时间窗口）
  validateToken(token?: string): boolean {
    if (!token) return false;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [username, tsStr] = decoded.split(':');
      const ts = Number(tsStr || 0);
      if (!this.validUsers.some((u) => u.username === username)) return false;
      // 检查是否在 7 天内
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (!ts || Date.now() - ts > maxAge) return false;
      return true;
    } catch {
      return false;
    }
  }
  private readonly validUsers: { username: string; password: string }[] = [
    { username: 'YANGYIWEI', password: 'Q8@xM2f#T9' },
    { username: 'YANGDONG', password: 'zL4!pC7&Rq' },
    { username: 'WUJIANMEI', password: 'H5$kV9m*W3' },
  ];

  validateCredentials(username: string, password: string): boolean {
    return this.validUsers.some(
      (u) => u.username === username && u.password === password,
    );
  }

  createAuthToken(username: string): string {
    // 开发阶段使用简单明文/基于时间的 token
    return Buffer.from(`${username}:${Date.now()}`).toString('base64');
  }

  // 新增：基于旧 token 刷新（验证后生成新 token）
  refreshToken(oldToken?: string): string | null {
    if (!this.validateToken(oldToken)) return null;
    try {
      const decoded = Buffer.from(oldToken as string, 'base64').toString(
        'utf8',
      );
      const [username] = decoded.split(':');
      return this.createAuthToken(username);
    } catch {
      return null;
    }
  }
}

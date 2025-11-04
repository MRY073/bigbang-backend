import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly validUser = { username: 'admin', password: '123456' };

  validateCredentials(username: string, password: string): boolean {
    return (
      username === this.validUser.username &&
      password === this.validUser.password
    );
  }

  createAuthToken(username: string): string {
    // 开发阶段使用简单明文/基于时间的 token
    return Buffer.from(`${username}:${Date.now()}`).toString('base64');
  }
}

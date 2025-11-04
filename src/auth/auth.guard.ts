import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = request.cookies['auth_token'];

    if (!token) {
      throw new UnauthorizedException('未登录');
    }

    // 这里可以添加更多的验证逻辑，例如解码 token 等
    return true; // 如果 token 存在，返回 true
  }
}

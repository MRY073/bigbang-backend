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
    // 使用可选链，避免 request.cookies 为 undefined 导致错误
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = (request as any).cookies?.['auth_token'];

    if (!token) {
      throw new UnauthorizedException('未登录');
    }

    // TODO: 在这里验证 token 是否有效
    return true;
  }
}

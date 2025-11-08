/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginDto, @Res() res: Response) {
    const { username, password } = body || {}; 
    if (!this.authService.validateCredentials(username, password)) {
      return res.status(HttpStatus.OK).json({
        success: false,
        message: '用户名或密码错误111',
      });
    }
    // if (!this.authService.validateCredentials(username, password)) {
    //   return res.status(HttpStatus.UNAUTHORIZED).json({
    //     success: false,
    //     message: 'back-用户名或密码错误',
    //   });
    // }

    const token = this.authService.createAuthToken(username);
    res.cookie('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天（ms）
    });

    /**
     *           success: true,
          data: {
            avatar: "https://avatars.githubusercontent.com/u/44761321",
            username: "admin",
            nickname: "小铭",
            // 一个用户可能有多个角色
            roles: ["admin"],
            // 按钮级别权限
            permissions: ["*:*:*"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
     */

    return res.status(HttpStatus.OK).json({
      success: true,
      username: username,
      nickname: username,
      roles: ['admin'],
      permissions: ['*:*:*'],
      message: '登录成功',
    });
  }

  // 新增：用来前端每次路由跳转时校验是否已登录
  @Get('me')
  me(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = (req as any).cookies?.['auth_token'];

    if (!this.authService.validateToken(token)) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: '未登录' });
    }

    return res.status(HttpStatus.OK).json({ success: true, message: '已登录' });
  }

  // 登出接口：清除 Cookie
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('auth_token', {
      httpOnly: true,
      path: '/',
    });
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '登出成功',
    });
  }
}

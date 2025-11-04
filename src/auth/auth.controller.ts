import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
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
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: '用户名或密码错误' });
    }

    const token = this.authService.createAuthToken(username);
    res.cookie('auth_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天（ms）
    });

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: '登录成功' });
  }
}

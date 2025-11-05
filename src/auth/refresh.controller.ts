import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller()
export class RefreshController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh-token')
  refresh(@Req() req: Request, @Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const token = (req as any).cookies?.['auth_token'];

    const newToken = this.authService.refreshToken(token);
    if (!newToken) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: '未登录或 token 无效' });
    }

    res.cookie('auth_token', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
    });

    return res
      .status(HttpStatus.OK)
      .json({ success: true, message: '刷新成功' });
  }
}

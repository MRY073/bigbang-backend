import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard'; // 导入 AuthGuard

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  @UseGuards(AuthGuard) // 使用 AuthGuard
  getHello(): string {
    return this.appService.getHello();
  }
}

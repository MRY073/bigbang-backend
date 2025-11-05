import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshController } from './refresh.controller'; // <- 新增

@Module({
  controllers: [AuthController, RefreshController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

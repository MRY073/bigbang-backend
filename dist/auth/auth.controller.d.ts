import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, res: Response): Response<any, Record<string, any>>;
    me(req: Request, res: Response): Response<any, Record<string, any>>;
    logout(res: Response): Response<any, Record<string, any>>;
}

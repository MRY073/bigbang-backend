import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
export declare class RefreshController {
    private readonly authService;
    constructor(authService: AuthService);
    refresh(req: Request, res: Response): Response<any, Record<string, any>>;
}

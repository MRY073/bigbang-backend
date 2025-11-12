import type { Response } from 'express';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorDto } from './dto/finished-link-monitor.dto';
export declare class FinishedLinkMonitorController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getFinishedLinkMonitor(query: FinishedLinkMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

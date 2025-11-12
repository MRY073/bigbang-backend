import type { Response } from 'express';
import { ProductsService } from './products.service';
import { PotentialLinkMonitorDto, PotentialLinkAISuggestionDto } from './dto/potential-link-monitor.dto';
export declare class PotentialLinkMonitorController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getPotentialLinkMonitor(query: PotentialLinkMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getPotentialLinkAISuggestion(query: PotentialLinkAISuggestionDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

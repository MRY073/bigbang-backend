import type { Response } from 'express';
import { ProductsService } from './products.service';
import { NaturalStageMonitorDto, NaturalStageAISuggestionDto, BatchNaturalStageAISuggestionDto } from './dto/natural-stage-monitor.dto';
export declare class NaturalStageMonitorController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getNaturalStageMonitor(query: NaturalStageMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getNaturalStageAISuggestion(query: NaturalStageAISuggestionDto, res: Response): Promise<Response<any, Record<string, any>>>;
    batchNaturalStageAISuggestion(body: BatchNaturalStageAISuggestionDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

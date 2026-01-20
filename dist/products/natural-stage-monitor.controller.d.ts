import type { Response } from 'express';
import { ProductsService } from './products.service';
import { NaturalStageMonitorDto, NaturalStageAISuggestionDto, BatchNaturalStageAISuggestionDto } from './dto/natural-stage-monitor.dto';
import { NaturalStageMonitorChartDto } from './dto/monitor-chart.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
export declare class NaturalStageMonitorController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getNaturalStageMonitor(query: NaturalStageMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getNaturalStageAISuggestion(query: NaturalStageAISuggestionDto, res: Response): Promise<Response<any, Record<string, any>>>;
    batchNaturalStageAISuggestion(body: BatchNaturalStageAISuggestionDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getNaturalStageMonitorChart(query: NaturalStageMonitorChartDto, res: Response): Promise<Response<any, Record<string, any>>>;
    saveNaturalStageMonitorAnalysis(body: SaveAnalysisDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

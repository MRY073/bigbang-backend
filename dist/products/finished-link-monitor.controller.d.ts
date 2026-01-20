import type { Response } from 'express';
import { ProductsService } from './products.service';
import { FinishedLinkMonitorDto } from './dto/finished-link-monitor.dto';
import { FinishedLinkMonitorChartDto } from './dto/monitor-chart.dto';
import { SaveAnalysisDto } from './dto/save-analysis.dto';
export declare class FinishedLinkMonitorController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getFinishedLinkMonitor(query: FinishedLinkMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getFinishedLinkMonitorChart(query: FinishedLinkMonitorChartDto, res: Response): Promise<Response<any, Record<string, any>>>;
    saveFinishedLinkMonitorAnalysis(body: SaveAnalysisDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

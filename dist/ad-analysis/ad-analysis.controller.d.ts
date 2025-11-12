import type { Response } from 'express';
import { AdAnalysisService } from './ad-analysis.service';
import { AdTrendDto } from './dto/ad-trend.dto';
import { AdRatioDto } from './dto/ad-ratio.dto';
import { StageProductsDto } from './dto/stage-products.dto';
export declare class AdAnalysisController {
    private readonly adAnalysisService;
    constructor(adAnalysisService: AdAnalysisService);
    getAdTrend(query: AdTrendDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getAdRatio(query: AdRatioDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getStageProducts(query: StageProductsDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

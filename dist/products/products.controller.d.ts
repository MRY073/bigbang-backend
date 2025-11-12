import type { Response } from 'express';
import { ProductsService } from './products.service';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateStageDto } from './dto/update-stage.dto';
import { TestingMonitorDto } from './dto/testing-monitor.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProducts(query: QueryProductsDto, res: Response): Promise<Response<any, Record<string, any>>>;
    updateStage(body: UpdateStageDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getTestingMonitor(query: TestingMonitorDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

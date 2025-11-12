import type { Response } from 'express';
import { ProductsService } from './products.service';
import { QueryProductItemsDto } from './dto/query-product-items.dto';
import { UpdateCustomCategoryDto } from './dto/update-custom-category.dto';
export declare class ProductItemsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getCustomCategories(shopID: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getProductItems(query: QueryProductItemsDto, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProductItem(id: string, body: UpdateCustomCategoryDto, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProductItem(id: string, res: Response): Promise<Response<any, Record<string, any>>>;
}

import type { Response } from 'express';
import { UploadService } from './upload.service';
import { UploadDto } from './dto/upload.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    upload(files: Express.Multer.File[], body: UploadDto, res: Response): Promise<Response<any, Record<string, any>>>;
}

// DTO 用于类型定义和参数验证
// 如果需要使用 class-validator 进行自动验证，请安装: npm install class-validator class-transformer
// 并在 main.ts 中添加: app.useGlobalPipes(new ValidationPipe());
export class UploadDto {
  type: string;
  shopName: string;
  shopID: string;
}

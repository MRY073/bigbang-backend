"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiGatewayRequestDto = void 0;
const analysis_request_dto_1 = require("./analysis-request.dto");
class AiGatewayRequestDto extends analysis_request_dto_1.AnalysisRequestDto {
    linkId;
    linkUrl;
    shopId;
    provider;
    modelId;
    temperature;
    responseFormat;
    supplementaryPrompt;
    promptDate;
    forceRefresh;
    metadata;
}
exports.AiGatewayRequestDto = AiGatewayRequestDto;
//# sourceMappingURL=ai-gateway.dto.js.map
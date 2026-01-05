"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoidInvoiceRequestDto = exports.MarkAsOverdueRequestDto = exports.PayInvoiceRequestDto = exports.IssueInvoiceRequestDto = exports.CreateInvoiceRequestDto = exports.CreateInvoiceItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateInvoiceItemDto {
    id;
    description;
    quantity;
    unitPriceAmount;
}
exports.CreateInvoiceItemDto = CreateInvoiceItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceItemDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateInvoiceItemDto.prototype, "unitPriceAmount", void 0);
class CreateInvoiceRequestDto {
    invoiceId;
    currency;
    items;
}
exports.CreateInvoiceRequestDto = CreateInvoiceRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceRequestDto.prototype, "invoiceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceRequestDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateInvoiceItemDto),
    __metadata("design:type", Array)
], CreateInvoiceRequestDto.prototype, "items", void 0);
class IssueInvoiceRequestDto {
    issueAt;
}
exports.IssueInvoiceRequestDto = IssueInvoiceRequestDto;
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], IssueInvoiceRequestDto.prototype, "issueAt", void 0);
class PayInvoiceRequestDto {
}
exports.PayInvoiceRequestDto = PayInvoiceRequestDto;
class MarkAsOverdueRequestDto {
}
exports.MarkAsOverdueRequestDto = MarkAsOverdueRequestDto;
class VoidInvoiceRequestDto {
}
exports.VoidInvoiceRequestDto = VoidInvoiceRequestDto;
//# sourceMappingURL=RequestDtos.js.map
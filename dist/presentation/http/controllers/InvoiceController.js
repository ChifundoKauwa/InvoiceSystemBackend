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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const usecases_1 = require("../../../application/usecases");
const dtos_1 = require("../../../application/dtos");
const RequestDtos_1 = require("../dtos/RequestDtos");
const roles_decorator_1 = require("../../../auth/decorators/roles.decorator");
const users_entity_1 = require("../../../users/users.entity");
let InvoiceController = class InvoiceController {
    createInvoiceUseCase;
    issueInvoiceUseCase;
    payInvoiceUseCase;
    markAsOverdueUseCase;
    voidInvoiceUseCase;
    constructor(createInvoiceUseCase, issueInvoiceUseCase, payInvoiceUseCase, markAsOverdueUseCase, voidInvoiceUseCase) {
        this.createInvoiceUseCase = createInvoiceUseCase;
        this.issueInvoiceUseCase = issueInvoiceUseCase;
        this.payInvoiceUseCase = payInvoiceUseCase;
        this.markAsOverdueUseCase = markAsOverdueUseCase;
        this.voidInvoiceUseCase = voidInvoiceUseCase;
    }
    async createInvoice(dto) {
        const command = new dtos_1.CreateInvoiceCommand(dto.invoiceId, dto.currency, dto.items);
        return this.createInvoiceUseCase.execute(command);
    }
    async issueInvoice(invoiceId, dto) {
        const command = new dtos_1.IssueInvoiceCommand(invoiceId, dto?.issueAt || new Date());
        return this.issueInvoiceUseCase.execute(command);
    }
    async payInvoice(invoiceId) {
        const command = new dtos_1.PayInvoiceCommand(invoiceId);
        return this.payInvoiceUseCase.execute(command);
    }
    async markAsOverdue(invoiceId) {
        const command = new dtos_1.MarkAsOverdueCommand(invoiceId);
        return this.markAsOverdueUseCase.execute(command);
    }
    async voidInvoice(invoiceId) {
        const command = new dtos_1.VoidInvoiceCommand(invoiceId);
        return this.voidInvoiceUseCase.execute(command);
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(users_entity_1.UserRole.MANAGER, users_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestDtos_1.CreateInvoiceRequestDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)(':id/issue'),
    (0, roles_decorator_1.Roles)(users_entity_1.UserRole.MANAGER, users_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, RequestDtos_1.IssueInvoiceRequestDto]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "issueInvoice", null);
__decorate([
    (0, common_1.Post)(':id/pay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "payInvoice", null);
__decorate([
    (0, common_1.Post)(':id/overdue'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "markAsOverdue", null);
__decorate([
    (0, common_1.Post)(':id/void'),
    (0, roles_decorator_1.Roles)(users_entity_1.UserRole.MANAGER, users_entity_1.UserRole.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "voidInvoice", null);
exports.InvoiceController = InvoiceController = __decorate([
    (0, common_1.Controller)('invoices'),
    __metadata("design:paramtypes", [usecases_1.CreateInvoiceUseCase,
        usecases_1.IssueInvoiceUseCase,
        usecases_1.PayInvoiceUseCase,
        usecases_1.MarkAsOverdueUseCase,
        usecases_1.VoidInvoiceUseCase])
], InvoiceController);
//# sourceMappingURL=InvoiceController.js.map
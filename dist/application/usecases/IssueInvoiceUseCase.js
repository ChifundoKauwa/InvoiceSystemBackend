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
exports.IssueInvoiceUseCase = void 0;
const common_1 = require("@nestjs/common");
const InvoiceRepo_1 = require("../../domain/invoice/InvoiceRepo");
const ApplicationEventBus_1 = require("../ports/ApplicationEventBus");
const Responses_1 = require("../dtos/Responses");
const ApplicationExceptions_1 = require("../exceptions/ApplicationExceptions");
let IssueInvoiceUseCase = class IssueInvoiceUseCase {
    invoiceRepo;
    eventBus;
    constructor(invoiceRepo, eventBus) {
        this.invoiceRepo = invoiceRepo;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);
        const dueAt = new Date(command.issueAt);
        dueAt.setDate(dueAt.getDate() + 30);
        let issuedInvoice;
        try {
            issuedInvoice = invoice.issue(dueAt);
        }
        catch (error) {
            throw new ApplicationExceptions_1.InvalidInvoiceStateError(invoice.getStatus(), "issue");
        }
        await this.invoiceRepo.save(issuedInvoice);
        try {
            await this.eventBus.publishAll(issuedInvoice.getEvents());
        }
        catch (error) {
            throw new ApplicationExceptions_1.EventPublishingError(error.message);
        }
        return this.mapToDto(issuedInvoice);
    }
    mapToDto(invoice) {
        const items = invoice.getItems().map((item) => new Responses_1.InvoiceItemDto(item.getId(), item.getDescription(), 0, 0, item.subtotal().getAmount(), invoice.getCurrency()));
        return new Responses_1.InvoiceDto(invoice.getId(), invoice.getStatus(), invoice.getCurrency(), invoice.getTotal().getAmount(), items, invoice.getIssueAt(), invoice.getDueAt());
    }
};
exports.IssueInvoiceUseCase = IssueInvoiceUseCase;
exports.IssueInvoiceUseCase = IssueInvoiceUseCase = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [InvoiceRepo_1.InvoiceRepo,
        ApplicationEventBus_1.ApplicationEventBus])
], IssueInvoiceUseCase);
//# sourceMappingURL=IssueInvoiceUseCase.js.map
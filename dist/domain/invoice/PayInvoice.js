"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayInvoiceUseCase = void 0;
class PayInvoiceUseCase {
    invoiceRepo;
    eventBus;
    constructor(invoiceRepo, eventBus) {
        this.invoiceRepo = invoiceRepo;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);
        const paidInvoice = invoice.markAsPaid();
        await this.invoiceRepo.save(paidInvoice);
        await this.eventBus.publish({
            type: "InvoicePaid",
            invoice: paidInvoice
        });
    }
}
exports.PayInvoiceUseCase = PayInvoiceUseCase;
//# sourceMappingURL=PayInvoice.js.map
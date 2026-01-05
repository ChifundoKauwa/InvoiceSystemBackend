"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceVoided = exports.InvoiceOverdue = exports.InvoicePaid = exports.InvoiceIssued = void 0;
const DomainEvent_1 = require("./DomainEvent");
class InvoiceIssued extends DomainEvent_1.DomainEvent {
    invoiceId;
    issuedAt;
    dueAt;
    constructor(invoiceId, issuedAt, dueAt) {
        super();
        this.invoiceId = invoiceId;
        this.issuedAt = issuedAt;
        this.dueAt = dueAt;
    }
}
exports.InvoiceIssued = InvoiceIssued;
class InvoicePaid extends DomainEvent_1.DomainEvent {
    invoiceId;
    paidAt;
    constructor(invoiceId, paidAt) {
        super();
        this.invoiceId = invoiceId;
        this.paidAt = paidAt;
    }
}
exports.InvoicePaid = InvoicePaid;
class InvoiceOverdue extends DomainEvent_1.DomainEvent {
    invoiceId;
    overdueAt;
    constructor(invoiceId, overdueAt) {
        super();
        this.invoiceId = invoiceId;
        this.overdueAt = overdueAt;
    }
}
exports.InvoiceOverdue = InvoiceOverdue;
class InvoiceVoided extends DomainEvent_1.DomainEvent {
    invoiceId;
    voidedAt;
    constructor(invoiceId, voidedAt) {
        super();
        this.invoiceId = invoiceId;
        this.voidedAt = voidedAt;
    }
}
exports.InvoiceVoided = InvoiceVoided;
//# sourceMappingURL=InvoiceEvent.js.map
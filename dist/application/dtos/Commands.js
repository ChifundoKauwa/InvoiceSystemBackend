"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInvoiceCommand = exports.VoidInvoiceCommand = exports.MarkAsOverdueCommand = exports.PayInvoiceCommand = exports.IssueInvoiceCommand = void 0;
class IssueInvoiceCommand {
    invoiceId;
    issueAt;
    constructor(invoiceId, issueAt = new Date()) {
        this.invoiceId = invoiceId;
        this.issueAt = issueAt;
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
        if (!issueAt || !(issueAt instanceof Date)) {
            throw new Error("issueAt must be a valid Date");
        }
    }
}
exports.IssueInvoiceCommand = IssueInvoiceCommand;
class PayInvoiceCommand {
    invoiceId;
    constructor(invoiceId) {
        this.invoiceId = invoiceId;
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}
exports.PayInvoiceCommand = PayInvoiceCommand;
class MarkAsOverdueCommand {
    invoiceId;
    constructor(invoiceId) {
        this.invoiceId = invoiceId;
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}
exports.MarkAsOverdueCommand = MarkAsOverdueCommand;
class VoidInvoiceCommand {
    invoiceId;
    constructor(invoiceId) {
        this.invoiceId = invoiceId;
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}
exports.VoidInvoiceCommand = VoidInvoiceCommand;
class CreateInvoiceCommand {
    invoiceId;
    currency;
    items;
    constructor(invoiceId, currency, items) {
        this.invoiceId = invoiceId;
        this.currency = currency;
        this.items = items;
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
        if (!currency || currency.trim().length === 0) {
            throw new Error("currency is required");
        }
        if (!items || items.length === 0) {
            throw new Error("items cannot be empty");
        }
    }
}
exports.CreateInvoiceCommand = CreateInvoiceCommand;
//# sourceMappingURL=Commands.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const IncoiceStatus_1 = require("./IncoiceStatus");
const Money_1 = require("../shared/Money");
const InvoiceEvent_1 = require("./InvoiceEvent");
const deepFreeze_1 = require("../shared/deepFreeze");
class Invoice {
    state = IncoiceStatus_1.InvoiceStatus.draft;
    id;
    items = [];
    events = [];
    issueAt = undefined;
    dueAt = undefined;
    currency;
    constructor(id, currency, items = [], events = []) {
        if (!currency || currency.trim().length === 0) {
            throw new Error("currency is required");
        }
        if (!id || id.trim().length === 0) {
            throw new Error("id is required");
        }
        if (items && items.some(i => !i.subtotal().sameCurrency(Money_1.Money.zero(currency)))) {
            throw new Error("all items must have the same currency as the invoice");
        }
        this.currency = currency;
        this.id = id;
        if (items) {
            this.items.push(...items);
        }
        if (events && events.length > 0) {
            this.events.push(...events);
        }
    }
    issue(dueAt) {
        if (this.state !== IncoiceStatus_1.InvoiceStatus.draft) {
            throw new Error("can only issue draft invoices");
        }
        if (this.items.length === 0) {
            throw new Error("cannot issue invoice with no items");
        }
        if (!dueAt || !(dueAt instanceof Date)) {
            throw new Error("dueAt must be a valid Date");
        }
        const now = new Date();
        const issuedInvoice = this.cloneWithNewState();
        issuedInvoice.state = IncoiceStatus_1.InvoiceStatus.issued;
        issuedInvoice.issueAt = now;
        issuedInvoice.dueAt = dueAt;
        issuedInvoice.events = [...this.events, new InvoiceEvent_1.InvoiceIssued(this.id, now, dueAt)];
        return (0, deepFreeze_1.deepFreeze)(issuedInvoice);
    }
    markAsPaid() {
        if (![IncoiceStatus_1.InvoiceStatus.issued, IncoiceStatus_1.InvoiceStatus.overdue].includes(this.state)) {
            throw new Error("can only pay issued or overdue invoices");
        }
        const paidInvoice = this.cloneWithNewState();
        paidInvoice.state = IncoiceStatus_1.InvoiceStatus.paid;
        paidInvoice.events = [...this.events, new InvoiceEvent_1.InvoicePaid(this.id, new Date())];
        return (0, deepFreeze_1.deepFreeze)(paidInvoice);
    }
    markAsOverdue() {
        if (this.state !== IncoiceStatus_1.InvoiceStatus.issued) {
            throw new Error("can only mark issued invoices as overdue");
        }
        const overdueInvoice = this.cloneWithNewState();
        overdueInvoice.state = IncoiceStatus_1.InvoiceStatus.overdue;
        overdueInvoice.events = [...this.events, new InvoiceEvent_1.InvoiceOverdue(this.id, new Date())];
        return (0, deepFreeze_1.deepFreeze)(overdueInvoice);
    }
    void() {
        if (this.state === IncoiceStatus_1.InvoiceStatus.paid) {
            throw new Error("cannot void a paid invoice");
        }
        const voidedInvoice = this.cloneWithNewState();
        voidedInvoice.state = IncoiceStatus_1.InvoiceStatus.void;
        voidedInvoice.events = [...this.events, new InvoiceEvent_1.InvoiceVoided(this.id, new Date())];
        return (0, deepFreeze_1.deepFreeze)(voidedInvoice);
    }
    getTotal() {
        let total = Money_1.Money.zero(this.currency);
        for (const item of this.items) {
            total = total.add(item.subtotal());
        }
        return total;
    }
    getItems() {
        return [...this.items];
    }
    getStatus() {
        return this.state;
    }
    getId() {
        return this.id;
    }
    getCurrency() {
        return this.currency;
    }
    getIssueAt() {
        return this.issueAt;
    }
    getDueAt() {
        return this.dueAt;
    }
    getEvents() {
        return [...this.events];
    }
    cloneWithNewState() {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    }
}
exports.Invoice = Invoice;
//# sourceMappingURL=Invoice.js.map
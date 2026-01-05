"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceDto = exports.InvoiceItemDto = void 0;
class InvoiceItemDto {
    id;
    description;
    quantity;
    unitPriceAmount;
    subtotalAmount;
    currency;
    constructor(id, description, quantity, unitPriceAmount, subtotalAmount, currency) {
        this.id = id;
        this.description = description;
        this.quantity = quantity;
        this.unitPriceAmount = unitPriceAmount;
        this.subtotalAmount = subtotalAmount;
        this.currency = currency;
    }
}
exports.InvoiceItemDto = InvoiceItemDto;
class InvoiceDto {
    id;
    status;
    currency;
    totalAmount;
    items;
    issuedAt;
    dueAt;
    constructor(id, status, currency, totalAmount, items, issuedAt, dueAt) {
        this.id = id;
        this.status = status;
        this.currency = currency;
        this.totalAmount = totalAmount;
        this.items = items;
        this.issuedAt = issuedAt;
        this.dueAt = dueAt;
    }
}
exports.InvoiceDto = InvoiceDto;
//# sourceMappingURL=Responses.js.map
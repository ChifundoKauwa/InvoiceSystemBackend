"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceMapper = void 0;
const Invoice_1 = require("../../../domain/invoice/Invoice");
const InvoiceItem_1 = require("../../../domain/invoice/InvoiceItem");
const Money_1 = require("../../../domain/shared/Money");
const InvoiceEntity_1 = require("../entities/InvoiceEntity");
const InvoiceItemEntity_1 = require("../entities/InvoiceItemEntity");
class InvoiceMapper {
    static toPersistence(invoice) {
        const items = invoice.getItems().map(item => this.itemToPersistence(item, invoice.getId(), invoice.getCurrency()));
        return new InvoiceEntity_1.InvoiceEntity({
            id: invoice.getId(),
            status: invoice.getStatus(),
            currency: invoice.getCurrency(),
            totalAmount: invoice.getTotal().getAmount(),
            issuedAt: invoice.getIssueAt(),
            dueAt: invoice.getDueAt(),
            items,
        });
    }
    static toDomain(entity) {
        const items = entity.items.map(itemEntity => this.itemToDomain(itemEntity));
        const invoice = new Invoice_1.Invoice(entity.id, entity.currency, items, []);
        return invoice;
    }
    static itemToPersistence(item, invoiceId, currency) {
        return new InvoiceItemEntity_1.InvoiceItemEntity({
            id: item.getId(),
            invoiceId,
            description: item.getDescription(),
            quantity: 0,
            unitPriceAmount: 0,
            currency,
            subtotalAmount: item.subtotal().getAmount(),
        });
    }
    static itemToDomain(entity) {
        const unitPrice = new Money_1.Money(entity.unitPriceAmount, entity.currency);
        return new InvoiceItem_1.InvoiceItem(entity.id, unitPrice, entity.quantity, entity.description);
    }
}
exports.InvoiceMapper = InvoiceMapper;
//# sourceMappingURL=InvoiceMapper.js.map
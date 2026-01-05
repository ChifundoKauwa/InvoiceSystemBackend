"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceItem = void 0;
const Money_1 = require("../shared/Money");
class InvoiceItem {
    id;
    unitprice;
    quantity;
    description;
    constructor(id, unitprice, quantity, description) {
        if (!id || id.trim().length === 0) {
            throw new Error("id is required");
        }
        if (!unitprice) {
            throw new Error("unitprice is required");
        }
        if (!Number.isInteger(quantity) || quantity <= 0) {
            throw new Error("quantity must be a positive integer");
        }
        if (!description || description.trim().length === 0) {
            throw new Error("description is required");
        }
        this.id = id;
        this.unitprice = unitprice;
        this.quantity = quantity;
        this.description = description;
    }
    getId() {
        return this.id;
    }
    getDescription() {
        return this.description;
    }
    subtotal() {
        let totalAmount = Money_1.Money.zero(this.unitprice.getCurrency());
        for (let i = 0; i < this.quantity; i++) {
            totalAmount = totalAmount.add(this.unitprice);
        }
        return totalAmount;
    }
    equals(other) {
        return (this.id === other.id &&
            this.unitprice.equals(other.unitprice) &&
            this.quantity === other.quantity &&
            this.description === other.description);
    }
}
exports.InvoiceItem = InvoiceItem;
//# sourceMappingURL=InvoiceItem.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
class Money {
    amount;
    currency;
    constructor(amount, currency) {
        if (!Number.isInteger(amount)) {
            throw new Error("amount must be an integer");
        }
        if (amount < 0) {
            throw new Error("amount must be greater than or equal to zero");
        }
        if (!currency || currency.trim().length === 0) {
            throw new Error("currency is required");
        }
        this.amount = amount;
        this.currency = currency;
    }
    add(other) {
        if (!this.sameCurrency(other)) {
            throw new Error("currency mismatch: cannot add different currencies");
        }
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        if (!this.sameCurrency(other)) {
            throw new Error("currency mismatch: cannot subtract different currencies");
        }
        if (this.amount < other.amount) {
            throw new Error("insufficient funds");
        }
        return new Money(this.amount - other.amount, this.currency);
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    sameCurrency(other) {
        return this.currency === other.currency;
    }
    getAmount() {
        return this.amount;
    }
    getCurrency() {
        return this.currency;
    }
    static zero(currency) {
        return new Money(0, currency);
    }
}
exports.Money = Money;
//# sourceMappingURL=Money.js.map
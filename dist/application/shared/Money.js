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
        this.amount = amount;
        this.currency = currency;
    }
    add(other) {
        if (!this.sameCurrency(other)) {
            return this.currencyMismatchError();
        }
        return new Money(this.amount + other.amount, this.currency);
    }
    getCurrency() {
        return this.currency;
    }
    getAmount() {
        return this.amount;
    }
    subtract(other) {
        if (!this.sameCurrency(other)) {
            return this.currencyMismatchError();
        }
        if (this.amount < other.amount) {
            return this.insufficientFundsError();
        }
        return new Money(this.amount - other.amount, this.currency);
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    static zero(currency) {
        return new Money(0, currency);
    }
    sameCurrency(other) {
        return this.currency === other.currency;
    }
    currencyMismatchError() {
        throw new Error("currency do not match");
    }
    insufficientFundsError() {
        throw new Error("insufficient funds");
    }
}
exports.Money = Money;
//# sourceMappingURL=Money.js.map
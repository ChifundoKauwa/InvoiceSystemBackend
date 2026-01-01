/**
 * DOMAIN LAYER: Money Value Object
 * 
 * Encapsulates monetary value with currency enforcement.
 * Ensures type-safe operations across the domain.
 * Amounts are stored as integers (cents) to avoid floating-point errors.
 */
export class Money {
    private readonly amount: number;
    private readonly currency: string;

    constructor(amount: number, currency: string) {
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

    add(other: Money): Money {
        if (!this.sameCurrency(other)) {
            throw new Error("currency mismatch: cannot add different currencies");
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        if (!this.sameCurrency(other)) {
            throw new Error("currency mismatch: cannot subtract different currencies");
        }
        if (this.amount < other.amount) {
            throw new Error("insufficient funds");
        }
        return new Money(this.amount - other.amount, this.currency);
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    sameCurrency(other: Money): boolean {
        return this.currency === other.currency;
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }

    static zero(currency: string): Money {
        return new Money(0, currency);
    }
}

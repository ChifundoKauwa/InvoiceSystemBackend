export declare class Money {
    private readonly amount;
    private readonly currency;
    constructor(amount: number, currency: string);
    add(other: Money): Money;
    getCurrency(): string;
    getAmount(): number;
    subtract(other: Money): Money;
    equals(other: Money): boolean;
    static zero(currency: string): Money;
    sameCurrency(other: Money): boolean;
    currencyMismatchError(): never;
    insufficientFundsError(): never;
}

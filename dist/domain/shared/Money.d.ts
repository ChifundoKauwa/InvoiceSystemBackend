export declare class Money {
    private readonly amount;
    private readonly currency;
    constructor(amount: number, currency: string);
    add(other: Money): Money;
    subtract(other: Money): Money;
    equals(other: Money): boolean;
    sameCurrency(other: Money): boolean;
    getAmount(): number;
    getCurrency(): string;
    static zero(currency: string): Money;
}

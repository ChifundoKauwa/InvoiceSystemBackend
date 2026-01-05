import { Money } from "../shared/Money";
export declare class InvoiceItem {
    private readonly id;
    private readonly unitprice;
    private readonly quantity;
    private readonly description;
    constructor(id: string, unitprice: Money, quantity: number, description: string);
    getId(): string;
    getDescription(): string;
    subtotal(): Money;
    equals(other: InvoiceItem): boolean;
}

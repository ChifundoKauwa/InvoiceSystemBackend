import { Money } from "../shared/Money";

/**
 * DOMAIN LAYER: Invoice Item Value Object
 * 
 * Represents a line item on an invoice with quantity and unit price.
 * Immutable and validates all invariants in constructor.
 */
export class InvoiceItem {
    private readonly id: string;
    private readonly unitprice: Money;
    private readonly quantity: number;
    private readonly description: string;

    constructor(id: string, unitprice: Money, quantity: number, description: string) {
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

    getId(): string {
        return this.id;
    }

    getDescription(): string {
        return this.description;
    }

    subtotal(): Money {
        let totalAmount = Money.zero(this.unitprice.getCurrency());
        for (let i = 0; i < this.quantity; i++) {
            totalAmount = totalAmount.add(this.unitprice);
        }
        return totalAmount;
    }

    equals(other: InvoiceItem): boolean {
        return (
            this.id === other.id &&
            this.unitprice.equals(other.unitprice) &&
            this.quantity === other.quantity &&
            this.description === other.description
        );
    }
}
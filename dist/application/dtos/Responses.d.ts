export declare class InvoiceItemDto {
    readonly id: string;
    readonly description: string;
    readonly quantity: number;
    readonly unitPriceAmount: number;
    readonly subtotalAmount: number;
    readonly currency: string;
    constructor(id: string, description: string, quantity: number, unitPriceAmount: number, subtotalAmount: number, currency: string);
}
export declare class InvoiceDto {
    readonly id: string;
    readonly status: string;
    readonly currency: string;
    readonly totalAmount: number;
    readonly items: InvoiceItemDto[];
    readonly issuedAt?: Date | undefined;
    readonly dueAt?: Date | undefined;
    constructor(id: string, status: string, currency: string, totalAmount: number, items: InvoiceItemDto[], issuedAt?: Date | undefined, dueAt?: Date | undefined);
}

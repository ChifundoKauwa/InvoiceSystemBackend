export declare class CreateInvoiceItemDto {
    id: string;
    description: string;
    quantity: number;
    unitPriceAmount: number;
}
export declare class CreateInvoiceRequestDto {
    invoiceId: string;
    currency: string;
    items: CreateInvoiceItemDto[];
}
export declare class IssueInvoiceRequestDto {
    issueAt: Date;
}
export declare class PayInvoiceRequestDto {
}
export declare class MarkAsOverdueRequestDto {
}
export declare class VoidInvoiceRequestDto {
}

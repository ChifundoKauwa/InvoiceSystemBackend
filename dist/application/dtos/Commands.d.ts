export declare class IssueInvoiceCommand {
    readonly invoiceId: string;
    readonly issueAt: Date;
    constructor(invoiceId: string, issueAt?: Date);
}
export declare class PayInvoiceCommand {
    readonly invoiceId: string;
    constructor(invoiceId: string);
}
export declare class MarkAsOverdueCommand {
    readonly invoiceId: string;
    constructor(invoiceId: string);
}
export declare class VoidInvoiceCommand {
    readonly invoiceId: string;
    constructor(invoiceId: string);
}
export declare class CreateInvoiceCommand {
    readonly invoiceId: string;
    readonly currency: string;
    readonly items: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPriceAmount: number;
    }>;
    constructor(invoiceId: string, currency: string, items: Array<{
        id: string;
        description: string;
        quantity: number;
        unitPriceAmount: number;
    }>);
}

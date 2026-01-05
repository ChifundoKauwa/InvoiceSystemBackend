import { DomainEvent } from "./DomainEvent";
export declare class InvoiceIssued extends DomainEvent {
    readonly invoiceId: string;
    readonly issuedAt: Date;
    readonly dueAt: Date;
    constructor(invoiceId: string, issuedAt: Date, dueAt: Date);
}
export declare class InvoicePaid extends DomainEvent {
    readonly invoiceId: string;
    readonly paidAt: Date;
    constructor(invoiceId: string, paidAt: Date);
}
export declare class InvoiceOverdue extends DomainEvent {
    readonly invoiceId: string;
    readonly overdueAt: Date;
    constructor(invoiceId: string, overdueAt: Date);
}
export declare class InvoiceVoided extends DomainEvent {
    readonly invoiceId: string;
    readonly voidedAt: Date;
    constructor(invoiceId: string, voidedAt: Date);
}

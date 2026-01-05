export declare abstract class ApplicationException extends Error {
    constructor(message: string);
}
export declare class InvoiceNotFoundError extends ApplicationException {
    constructor(invoiceId: string);
}
export declare class InvalidInvoiceStateError extends ApplicationException {
    constructor(currentStatus: string, operation: string);
}
export declare class InvalidInvoiceDataError extends ApplicationException {
    constructor(message: string);
}
export declare class EventPublishingError extends ApplicationException {
    constructor(message: string);
}

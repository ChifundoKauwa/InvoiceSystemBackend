
 // APPLICATION LAYER: Application Exceptions
  
 // Domain-aware exceptions thrown by use cases.


export abstract class ApplicationException extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class InvoiceNotFoundError extends ApplicationException {
    constructor(invoiceId: string) {
        super(`Invoice with id '${invoiceId}' not found`);
    }
}

export class InvalidInvoiceStateError extends ApplicationException {
    constructor(currentStatus: string, operation: string) {
        super(`Cannot ${operation} invoice in ${currentStatus} state`);
    }
}

export class InvalidInvoiceDataError extends ApplicationException {
    constructor(message: string) {
        super(`Invalid invoice data: ${message}`);
    }
}

export class EventPublishingError extends ApplicationException {
    constructor(message: string) {
        super(`Failed to publish domain events: ${message}`);
    }
}

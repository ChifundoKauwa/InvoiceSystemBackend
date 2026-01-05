"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventPublishingError = exports.InvalidInvoiceDataError = exports.InvalidInvoiceStateError = exports.InvoiceNotFoundError = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.ApplicationException = ApplicationException;
class InvoiceNotFoundError extends ApplicationException {
    constructor(invoiceId) {
        super(`Invoice with id '${invoiceId}' not found`);
    }
}
exports.InvoiceNotFoundError = InvoiceNotFoundError;
class InvalidInvoiceStateError extends ApplicationException {
    constructor(currentStatus, operation) {
        super(`Cannot ${operation} invoice in ${currentStatus} state`);
    }
}
exports.InvalidInvoiceStateError = InvalidInvoiceStateError;
class InvalidInvoiceDataError extends ApplicationException {
    constructor(message) {
        super(`Invalid invoice data: ${message}`);
    }
}
exports.InvalidInvoiceDataError = InvalidInvoiceDataError;
class EventPublishingError extends ApplicationException {
    constructor(message) {
        super(`Failed to publish domain events: ${message}`);
    }
}
exports.EventPublishingError = EventPublishingError;
//# sourceMappingURL=ApplicationExceptions.js.map
/**
 * DOMAIN LAYER: Domain Events
 * 
 * These events capture important business facts about invoice state changes.
 * They're published through the event bus to decouple domain from infrastructure.
 * Events are immutable records of what happened in the past.
 */
import { DomainEvent } from "./DomainEvent";

export class InvoiceIssued extends DomainEvent {
    constructor(
        public readonly invoiceId: string,
        public readonly issuedAt: Date,
        public readonly dueAt: Date
    ) {
        super();
    }
}

export class InvoicePaid extends DomainEvent {
    constructor(public readonly invoiceId: string, public readonly paidAt: Date) {
        super();
    }
}

export class InvoiceOverdue extends DomainEvent {
    constructor(public readonly invoiceId: string, public readonly overdueAt: Date) {
        super();
    }
}

export class InvoiceVoided extends DomainEvent {
    constructor(public readonly invoiceId: string, public readonly voidedAt: Date) {
        super();
    }
}   
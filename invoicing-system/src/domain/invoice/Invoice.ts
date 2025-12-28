import { InvoiceStatus } from "./IncoiceStatus";
import { InvoiceItem } from "./InvoiceItem";
import { Money } from "../shared/Money";
import { DomainEvent } from "./DomainEvent";
import { InvoiceIssued, InvoicePaid, InvoiceOverdue, InvoiceVoided } from "./InvoiceEvent";
import { deepFreeze } from "../shared/deepFreeze";

/**
 * DOMAIN LAYER: Invoice Aggregate Root
 * 
 * Enforces invariants across the invoice lifecycle:
 * - Items must match invoice currency
 * - State transitions are controlled
 * - Events are recorded for all changes
 * - Immutable after state transitions
 */
export class Invoice {
    private state: InvoiceStatus = InvoiceStatus.draft;
    private readonly id: string;
    private readonly items: InvoiceItem[] = [];
    private events: DomainEvent[] = [];
    private issueAt: Date | undefined = undefined;
    private dueAt: Date | undefined = undefined;
    private readonly currency: string;

    constructor(id: string, currency: string, items: InvoiceItem[] = [], events: DomainEvent[] = []) {
        if (!currency || currency.trim().length === 0) {
            throw new Error("currency is required");
        }
        if (!id || id.trim().length === 0) {
            throw new Error("id is required");
        }
        if (items && items.some(i => !i.subtotal().sameCurrency(Money.zero(currency)))) {
            throw new Error("all items must have the same currency as the invoice");
        }
        this.currency = currency;
        this.id = id;
        if (items) {
            this.items.push(...items);
        }
        if (events && events.length > 0) {
            this.events.push(...events);
        }
    }

    issue(dueAt: Date): Invoice {
        if (this.state !== InvoiceStatus.draft) {
            throw new Error("can only issue draft invoices");
        }
        if (this.items.length === 0) {
            throw new Error("cannot issue invoice with no items");
        }
        if (!dueAt || !(dueAt instanceof Date)) {
            throw new Error("dueAt must be a valid Date");
        }

        const now = new Date();
        const issuedInvoice = this.cloneWithNewState();
        issuedInvoice.state = InvoiceStatus.issued;
        issuedInvoice.issueAt = now;
        issuedInvoice.dueAt = dueAt;
        issuedInvoice.events = [...this.events, new InvoiceIssued(this.id, now, dueAt)];
        return deepFreeze(issuedInvoice);
    }

    markAsPaid(): Invoice {
        if (![InvoiceStatus.issued, InvoiceStatus.overdue].includes(this.state)) {
            throw new Error("can only pay issued or overdue invoices");
        }
        const paidInvoice = this.cloneWithNewState();
        paidInvoice.state = InvoiceStatus.paid;
        paidInvoice.events = [...this.events, new InvoicePaid(this.id, new Date())];
        return deepFreeze(paidInvoice);
    }

    markAsOverdue(): Invoice {
        if (this.state !== InvoiceStatus.issued) {
            throw new Error("can only mark issued invoices as overdue");
        }
        const overdueInvoice = this.cloneWithNewState();
        overdueInvoice.state = InvoiceStatus.overdue;
        overdueInvoice.events = [...this.events, new InvoiceOverdue(this.id, new Date())];
        return deepFreeze(overdueInvoice);
    }

    void(): Invoice {
        if (this.state === InvoiceStatus.paid) {
            throw new Error("cannot void a paid invoice");
        }
        const voidedInvoice = this.cloneWithNewState();
        voidedInvoice.state = InvoiceStatus.void;
        voidedInvoice.events = [...this.events, new InvoiceVoided(this.id, new Date())];
        return deepFreeze(voidedInvoice);
    }

    getTotal(): Money {
        let total = Money.zero(this.currency);
        for (const item of this.items) {
            total = total.add(item.subtotal());
        }
        return total;
    }

    getItems(): InvoiceItem[] {
        return [...this.items];
    }

    getStatus(): InvoiceStatus {
        return this.state;
    }

    getId(): string {
        return this.id;
    }

    getCurrency(): string {
        return this.currency;
    }

    getIssueAt(): Date | undefined {
        return this.issueAt;
    }

    getDueAt(): Date | undefined {
        return this.dueAt;
    }

    getEvents(): DomainEvent[] {
        return [...this.events];
    }

    private cloneWithNewState(): Invoice {
        return Object.assign(Object.create(Object.getPrototypeOf(this)), this) as Invoice;
    }
}
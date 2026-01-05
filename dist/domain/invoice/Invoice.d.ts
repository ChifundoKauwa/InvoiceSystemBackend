import { InvoiceStatus } from "./IncoiceStatus";
import { InvoiceItem } from "./InvoiceItem";
import { Money } from "../shared/Money";
import { DomainEvent } from "./DomainEvent";
export declare class Invoice {
    private state;
    private readonly id;
    private readonly items;
    private events;
    private issueAt;
    private dueAt;
    private readonly currency;
    constructor(id: string, currency: string, items?: InvoiceItem[], events?: DomainEvent[]);
    issue(dueAt: Date): Invoice;
    markAsPaid(): Invoice;
    markAsOverdue(): Invoice;
    void(): Invoice;
    getTotal(): Money;
    getItems(): InvoiceItem[];
    getStatus(): InvoiceStatus;
    getId(): string;
    getCurrency(): string;
    getIssueAt(): Date | undefined;
    getDueAt(): Date | undefined;
    getEvents(): DomainEvent[];
    private cloneWithNewState;
}

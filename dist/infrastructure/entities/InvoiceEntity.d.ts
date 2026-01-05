import { InvoiceItemEntity } from "./InvoiceItemEntity";
export declare class InvoiceEntity {
    id: string;
    currency: string;
    state: string;
    issueAt?: Date;
    dueAt?: Date;
    items: InvoiceItemEntity[];
}

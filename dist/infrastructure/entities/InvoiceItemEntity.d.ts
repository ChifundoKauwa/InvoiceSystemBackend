import { InvoiceEntity } from "./InvoiceEntity";
export declare class InvoiceItemEntity {
    id: string;
    description: string;
    amount: number;
    invoice: InvoiceEntity;
}

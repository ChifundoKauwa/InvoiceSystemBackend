import { InvoiceItemEntity } from './InvoiceItemEntity';
export declare class InvoiceEntity {
    id: string;
    status: string;
    currency: string;
    totalAmount: number | null;
    issuedAt: Date | null;
    dueAt: Date | null;
    items: InvoiceItemEntity[];
    createdAt: Date;
    updatedAt: Date;
    constructor(partial?: Partial<InvoiceEntity>);
}

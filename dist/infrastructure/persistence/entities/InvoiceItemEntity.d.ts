import { InvoiceEntity } from './InvoiceEntity';
export declare class InvoiceItemEntity {
    id: string;
    invoiceId: string;
    description: string;
    quantity: number;
    unitPriceAmount: number;
    currency: string;
    subtotalAmount: number;
    invoice: InvoiceEntity;
    constructor(partial?: Partial<InvoiceItemEntity>);
}

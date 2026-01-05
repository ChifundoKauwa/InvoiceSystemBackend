import { Invoice } from '../../../domain/invoice/Invoice';
import { InvoiceEntity } from '../entities/InvoiceEntity';
export declare class InvoiceMapper {
    static toPersistence(invoice: Invoice): InvoiceEntity;
    static toDomain(entity: InvoiceEntity): Invoice;
    private static itemToPersistence;
    private static itemToDomain;
}

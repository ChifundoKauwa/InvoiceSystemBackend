import { Repository } from 'typeorm';
import { Invoice } from '../../../domain/invoice/Invoice';
import { InvoiceRepo } from '../../../domain/invoice/InvoiceRepo';
import { InvoiceEntity } from '../entities/InvoiceEntity';
export declare class TypeormInvoiceRepo extends InvoiceRepo {
    private readonly repository;
    constructor(repository: Repository<InvoiceEntity>);
    getById(id: string): Promise<Invoice>;
    save(invoice: Invoice): Promise<void>;
}

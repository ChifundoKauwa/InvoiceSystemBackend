import { Invoice } from "./Invoice";
export declare abstract class InvoiceRepo {
    abstract getById(id: string): Promise<Invoice>;
    abstract save(invoice: Invoice): Promise<void>;
}

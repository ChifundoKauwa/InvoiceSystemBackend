import { Money } from "../shared/Money";
import { InvoiceRepo } from "./InvoiceRepo";
export declare class PayInvoiceUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: EventBus);
    execute(command: {
        invoiceId: string;
        paymentAmount: Money;
    }): Promise<void>;
}
interface EventBus {
    publish(event: any): Promise<void>;
}
export {};

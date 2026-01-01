import { Money } from "../shared/Money";
import { InvoiceRepo } from "./InvoiceRepo";

/**
 * DOMAIN LAYER: Use Case
 * 
 * Contains domain logic for paying an invoice.
 * Depends on the InvoiceRepo interface (not the implementation).
 * No framework, no decorators, pure business logic.
 */
export class PayInvoiceUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: EventBus
    ) {}

    async execute(command: { invoiceId: string; paymentAmount: Money }): Promise<void> {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);
        
        // Execute domain logic
        const paidInvoice = invoice.markAsPaid();
        
        await this.invoiceRepo.save(paidInvoice);
        await this.eventBus.publish({
            type: "InvoicePaid",
            invoice: paidInvoice
        });
    }
}

/**
 * Domain-level abstraction for event publishing
 * Implementation details (message queue, event store) are external concerns
 */
interface EventBus {
    publish(event: any): Promise<void>;
}
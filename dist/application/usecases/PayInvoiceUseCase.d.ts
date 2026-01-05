import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { PayInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto } from "../dtos/Responses";
export declare class PayInvoiceUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: ApplicationEventBus);
    execute(command: PayInvoiceCommand): Promise<InvoiceDto>;
    private mapToDto;
}

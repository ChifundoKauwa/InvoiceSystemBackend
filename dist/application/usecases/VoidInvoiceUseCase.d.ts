import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { VoidInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto } from "../dtos/Responses";
export declare class VoidInvoiceUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: ApplicationEventBus);
    execute(command: VoidInvoiceCommand): Promise<InvoiceDto>;
    private mapToDto;
}

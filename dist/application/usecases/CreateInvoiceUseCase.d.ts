import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { CreateInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto } from "../dtos/Responses";
export declare class CreateInvoiceUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: ApplicationEventBus);
    execute(command: CreateInvoiceCommand): Promise<InvoiceDto>;
    private mapToDto;
}

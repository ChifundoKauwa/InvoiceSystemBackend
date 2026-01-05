import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { MarkAsOverdueCommand } from "../dtos/Commands";
import { InvoiceDto } from "../dtos/Responses";
export declare class MarkAsOverdueUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: ApplicationEventBus);
    execute(command: MarkAsOverdueCommand): Promise<InvoiceDto>;
    private mapToDto;
}

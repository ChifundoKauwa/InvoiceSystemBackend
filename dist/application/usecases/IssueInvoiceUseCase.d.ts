import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { IssueInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto } from "../dtos/Responses";
export declare class IssueInvoiceUseCase {
    private readonly invoiceRepo;
    private readonly eventBus;
    constructor(invoiceRepo: InvoiceRepo, eventBus: ApplicationEventBus);
    execute(command: IssueInvoiceCommand): Promise<InvoiceDto>;
    private mapToDto;
}

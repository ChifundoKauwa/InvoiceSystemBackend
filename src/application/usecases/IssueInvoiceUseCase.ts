import { Injectable } from '@nestjs/common';
import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { IssueInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto, InvoiceItemDto } from "../dtos/Responses";
import { InvoiceNotFoundError, InvalidInvoiceStateError, EventPublishingError } from "../exceptions/ApplicationExceptions";

/**
 * APPLICATION LAYER: Use Case
 * 
 * Orchestrates issuing an invoice.
 * 1. Retrieve aggregate from repository
 * 2. Delegate state transition to domain
 * 3. Persist changed aggregate
 * 4. Publish domain events to event bus
 * 
 * All invariant checks happen in domain.issue() method.
 
 */
@Injectable()
export class IssueInvoiceUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: ApplicationEventBus
    ) {}

    async execute(command: IssueInvoiceCommand): Promise<InvoiceDto> {
        // 1. Retrieve aggregate (throws if not found)
        const invoice = await this.invoiceRepo.getById(command.invoiceId);

        // 2. Calculate due date (30 days after issue)
        const dueAt = new Date(command.issueAt);
        dueAt.setDate(dueAt.getDate() + 30);

        // 3. Delegate to domain (throws if invariants violated)
        let issuedInvoice;
        try {
            issuedInvoice = invoice.issue(dueAt);
        } catch (error) {
            throw new InvalidInvoiceStateError(
                invoice.getStatus(),
                "issue"
            );
        }

        // 4. Persist changed aggregate
        await this.invoiceRepo.save(issuedInvoice);

        // 5. Publish all domain events
        try {
            await this.eventBus.publishAll(issuedInvoice.getEvents());
        } catch (error) {
            throw new EventPublishingError((error as Error).message);
        }

        return this.mapToDto(issuedInvoice);
    }

    private mapToDto(invoice: any): InvoiceDto {
        const items = invoice.getItems().map(
            (item: any) => new InvoiceItemDto(
                item.getId(),
                item.getDescription(),
                0,
                0,
                item.subtotal().getAmount(),
                invoice.getCurrency()
            )
        );

        return new InvoiceDto(
            invoice.getId(),
            invoice.getStatus(),
            invoice.getCurrency(),
            invoice.getTotal().getAmount(),
            items,
            invoice.getIssueAt(),
            invoice.getDueAt()
        );
    }
}

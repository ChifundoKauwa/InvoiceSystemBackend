import { Injectable } from '@nestjs/common';
import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { MarkAsOverdueCommand } from "../dtos/Commands";
import { InvoiceDto, InvoiceItemDto } from "../dtos/Responses";
import { InvoiceNotFoundError, InvalidInvoiceStateError, EventPublishingError } from "../exceptions/ApplicationExceptions";

/**
 * APPLICATION LAYER: Use Case
 * 
 * Orchestrates marking an invoice as overdue.
 */
@Injectable()
export class MarkAsOverdueUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: ApplicationEventBus
    ) {}

    async execute(command: MarkAsOverdueCommand): Promise<InvoiceDto> {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);

        let overdueInvoice;
        try {
            overdueInvoice = invoice.markAsOverdue();
        } catch (error) {
            throw new InvalidInvoiceStateError(
                invoice.getStatus(),
                "mark as overdue"
            );
        }

        await this.invoiceRepo.save(overdueInvoice);

        try {
            await this.eventBus.publishAll(overdueInvoice.getEvents());
        } catch (error) {
            throw new EventPublishingError((error as Error).message);
        }

        return this.mapToDto(overdueInvoice);
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

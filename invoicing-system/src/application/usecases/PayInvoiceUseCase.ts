import { Injectable } from '@nestjs/common';
import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { PayInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto, InvoiceItemDto } from "../dtos/Responses";
import { InvoiceNotFoundError, InvalidInvoiceStateError, EventPublishingError } from "../exceptions/ApplicationExceptions";

/**
 * APPLICATION LAYER: Use Case
 * 
 * Orchestrates marking an invoice as paid.
 * Same pattern as IssueInvoiceUseCase.
 */
@Injectable()
export class PayInvoiceUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: ApplicationEventBus
    ) {}

    async execute(command: PayInvoiceCommand): Promise<InvoiceDto> {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);

        let paidInvoice;
        try {
            paidInvoice = invoice.markAsPaid();
        } catch (error) {
            throw new InvalidInvoiceStateError(
                invoice.getStatus(),
                "pay"
            );
        }

        await this.invoiceRepo.save(paidInvoice);

        try {
            await this.eventBus.publishAll(paidInvoice.getEvents());
        } catch (error) {
            throw new EventPublishingError((error as Error).message);
        }

        return this.mapToDto(paidInvoice);
    }

    private mapToDto(invoice: any): InvoiceDto {
        const items = invoice.getItems().map(
            (item: any) => new InvoiceItemDto(
                item.getId(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnitPrice().getAmount(),
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

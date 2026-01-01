import { Injectable } from '@nestjs/common';
import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { VoidInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto, InvoiceItemDto } from "../dtos/Responses";
import { InvoiceNotFoundError, InvalidInvoiceStateError, EventPublishingError } from "../exceptions/ApplicationExceptions";

/**
 * APPLICATION LAYER: Use Case
 * 
 * Orchestrates voiding an invoice.
 */
@Injectable()
export class VoidInvoiceUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: ApplicationEventBus
    ) {}

    async execute(command: VoidInvoiceCommand): Promise<InvoiceDto> {
        const invoice = await this.invoiceRepo.getById(command.invoiceId);

        let voidedInvoice;
        try {
            voidedInvoice = invoice.void();
        } catch (error) {
            throw new InvalidInvoiceStateError(
                invoice.getStatus(),
                "void"
            );
        }

        await this.invoiceRepo.save(voidedInvoice);

        try {
            await this.eventBus.publishAll(voidedInvoice.getEvents());
        } catch (error) {
            throw new EventPublishingError((error as Error).message);
        }

        return this.mapToDto(voidedInvoice);
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

import { Injectable } from '@nestjs/common';
import { InvoiceRepo } from "../../domain/invoice/InvoiceRepo";
import { ApplicationEventBus } from "../ports/ApplicationEventBus";
import { CreateInvoiceCommand } from "../dtos/Commands";
import { InvoiceDto, InvoiceItemDto } from "../dtos/Responses";
import { Invoice } from "../../domain/invoice/Invoice";
import { InvoiceItem } from "../../domain/invoice/InvoiceItem";
import { Money } from "../../domain/shared/Money";
import { InvalidInvoiceDataError, EventPublishingError } from "../exceptions/ApplicationExceptions";

/**
 * APPLICATION LAYER: Use Case
 * 
 * Orchestrates creating a new draft invoice.
 * Validates business rules, constructs domain aggregate, and persists.
 
 */
@Injectable()
export class CreateInvoiceUseCase {
    constructor(
        private readonly invoiceRepo: InvoiceRepo,
        private readonly eventBus: ApplicationEventBus
    ) {}

    async execute(command: CreateInvoiceCommand): Promise<InvoiceDto> {
        try {
            // Build domain aggregate from command
            const items = command.items.map(item => {
                const unitPrice = new Money(item.unitPriceAmount, command.currency);
                return new InvoiceItem(
                    item.id,
                    unitPrice,
                    item.quantity,
                    item.description
                );
            });

            const invoice = new Invoice(command.invoiceId, command.clientId, command.currency, items);

            // Persist to repository
            await this.invoiceRepo.save(invoice);

            // Publish events (none for creation, but pattern established)
            await this.eventBus.publishAll(invoice.getEvents());

            return this.mapToDto(invoice);
        } catch (error) {
            if (error instanceof InvalidInvoiceDataError) {
                throw error;
            }
            throw new InvalidInvoiceDataError((error as Error).message);
        }
    }

    private mapToDto(invoice: Invoice): InvoiceDto {
        const items = invoice.getItems().map(
            item => new InvoiceItemDto(
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

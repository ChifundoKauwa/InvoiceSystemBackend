import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { InvoiceEntity, InvoiceItemEntity } from '../infrastructure/persistence/entities';
import { InvoiceController } from '../presentation/http/controllers/InvoiceController';
import { CreateInvoiceUseCase, IssueInvoiceUseCase, PayInvoiceUseCase, MarkAsOverdueUseCase, VoidInvoiceUseCase } from '../application/usecases';
import { TypeormInvoiceRepo } from '../infrastructure/persistence/repositories/TypeormInvoiceRepo';
import { NestEventBus } from '../infrastructure/eventbus/NestEventBus';
import { InvoiceRepo } from '../domain/invoice/InvoiceRepo';
import { ApplicationEventBus } from '../application/ports/ApplicationEventBus';

/**
 * INFRASTRUCTURE LAYER: Invoice Module
 * 
 * Wires all layers together using NestJS dependency injection.
 * 
 * Dependency Graph:
 * Controller → Use Cases → (InvoiceRepo, ApplicationEventBus) → Implementation
 * 
 * Domain layer has NO MODULE - it's pure business logic.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([InvoiceEntity, InvoiceItemEntity]),
        EventEmitterModule.forRoot(),
    ],
    controllers: [InvoiceController],
    providers: [
        // Use Cases
        CreateInvoiceUseCase,
        IssueInvoiceUseCase,
        PayInvoiceUseCase,
        MarkAsOverdueUseCase,
        VoidInvoiceUseCase,
        // Infrastructure Implementations
        {
            provide: InvoiceRepo,
            useClass: TypeormInvoiceRepo,
        },
        {
            provide: ApplicationEventBus,
            useClass: NestEventBus,
        },
    ],
    exports: [
        CreateInvoiceUseCase,
        IssueInvoiceUseCase,
        PayInvoiceUseCase,
        MarkAsOverdueUseCase,
        VoidInvoiceUseCase,
    ],
})
export class InvoiceModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../../../domain/invoice/Invoice';
import { InvoiceRepo } from '../../../domain/invoice/InvoiceRepo';
import { InvoiceEntity } from '../entities/InvoiceEntity';
import { InvoiceMapper } from '../mappers/InvoiceMapper';
import { InvoiceNotFoundError } from '../../../application/exceptions';

/**
 * INFRASTRUCTURE LAYER: Invoice Repository Implementation
 * 
 * Implements InvoiceRepo interface using TypeORM.
 * The domain layer depends on the interface, not this implementation.
 * This allows swapping TypeORM for PostgreSQL driver, in-memory, etc.
 * 
 * Responsibilities:
 * - Convert domain aggregates to/from persistence entities
 * - Execute database queries and transactions
 * - Handle persistence errors
 * 
 * @Injectable() makes this available for NestJS dependency injection
 */
@Injectable()
export class TypeormInvoiceRepo extends InvoiceRepo {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly repository: Repository<InvoiceEntity>
    ) {
        super();
    }

    /**
     * Retrieve invoice by ID
     * Throws InvoiceNotFoundError if not found (fail-fast approach)
     */
    async getById(id: string): Promise<Invoice> {
        const entity = await this.repository.findOne({
            where: { id },
            relations: ['items'],
        });

        if (!entity) {
            throw new InvoiceNotFoundError(id);
        }

        return InvoiceMapper.toDomain(entity);
    }

    /**
     * Persist invoice aggregate to database
     * Uses TypeORM's save() which handles both insert and update
     */
    async save(invoice: Invoice): Promise<void> {
        const entity = InvoiceMapper.toPersistence(invoice);
        await this.repository.save(entity);
    }
}

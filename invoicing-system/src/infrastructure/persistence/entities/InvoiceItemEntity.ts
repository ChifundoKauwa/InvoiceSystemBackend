import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { InvoiceEntity } from './InvoiceEntity';

/**
 * INFRASTRUCTURE LAYER: Invoice Item Persistence Entity
 * 
 * TypeORM entity for invoice line items.
 * Denormalized for query performance.
 * 
 * Invariants:
 * - quantity must be > 0
 * - unitPriceAmount must be >= 0
 * - currency matches parent invoice
 */
@Entity('invoice_items')
export class InvoiceItemEntity {
    @PrimaryColumn('varchar', { length: 36 })
    id!: string;

    @Column('varchar', { length: 36 })
    invoiceId!: string;

    @Column('varchar', { length: 255 })
    description!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    quantity!: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unitPriceAmount!: number;

    @Column('varchar', { length: 3 })
    currency!: string;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotalAmount!: number;

    @ManyToOne(() => InvoiceEntity, (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invoiceId' })
    invoice!: InvoiceEntity;

    constructor(partial?: Partial<InvoiceItemEntity>) {
        Object.assign(this, partial);
    }
}

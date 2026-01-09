import { Entity, PrimaryColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceItemEntity } from './InvoiceItemEntity';

/**
 * INFRASTRUCTURE LAYER: Invoice Persistence Entity
 * 
 * TypeORM entity for database mapping.
 * NOT the same as domain Invoice aggregate.
 * This is the "read model" - optimized for queries, not business logic.
 * 
 * Invariants:
 * - id (invoice number) is PRIMARY KEY - enforces UNIQUENESS at DB level
 * - status must be one of: DRAFT, ISSUED, OVERDUE, PAID, VOIDED
 * - currency cannot be null
 * - dueAt must be null if status is DRAFT
 */
@Entity('invoices')
export class InvoiceEntity {
    @PrimaryColumn('varchar', { length: 100, unique: true })
    id!: string; // Invoice Number - UNIQUE constraint enforced

    @Column('varchar', { nullable: true })
    userId?: string;

    @Column('varchar', { nullable: false })
    clientId!: string;

    @Column('varchar', { length: 10 })
    status!: string; // DRAFT, ISSUED, OVERDUE, PAID, VOIDED

    @Column('varchar', { length: 3 })
    currency!: string; // ISO 4217 currency code

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    totalAmount!: number | null;

    @Column('timestamp', { nullable: true })
    issuedAt!: Date | null;

    @Column('timestamp', { nullable: true })
    dueAt!: Date | null;

    @OneToMany(() => InvoiceItemEntity, (item) => item.invoice, {
        cascade: true,
        eager: true,
    })
    items!: InvoiceItemEntity[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    constructor(partial?: Partial<InvoiceEntity>) {
        Object.assign(this, partial);
    }
}

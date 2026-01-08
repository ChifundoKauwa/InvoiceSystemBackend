import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { InvoiceItemEntity } from "./InvoiceItemEntity";

/**
 * Persistence Layer: Database representation of Invoice
 * 
 * This entity is ONLY for database operations via TypeORM.
 * Domain logic remains in invoice/Invoice.ts (no decorators, no framework)
 * 
 * Decorators are safe here because:
 * 1. reflect-metadata is imported in run.ts BEFORE this class loads
 * 2. tsconfig enables experimentalDecorators and emitDecoratorMetadata
 * 3. This file is never imported by domain classes
 */
@Entity("invoices")
export class InvoiceEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ nullable: true })
    userId?: string;

    @Column()
    clientId!: string;

    @Column()
    currency!: string;

    @Column()
    status!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    totalAmount!: number;

    @Column({ type: "timestamp", nullable: true })
    issuedAt?: Date;

    @Column({ type: "timestamp", nullable: true })
    dueAt?: Date;

    @OneToMany(() => InvoiceItemEntity, item => item.invoice, {
        cascade: true,
        eager: true
    })
    items!: InvoiceItemEntity[];

    constructor(partial?: Partial<InvoiceEntity>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}

import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { InvoiceEntity } from "../persistence/entities/InvoiceEntity";

/**
 * Persistence Layer: Database representation of InvoiceItem
 * 
 * This entity is ONLY for database operations via TypeORM.
 * Domain logic remains in invoice/InvoiceItem.ts (no decorators, no framework)
 */
@Entity("invoice_items")
export class InvoiceItemEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    invoiceId!: string;

    @Column()
    description!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    unitPriceAmount!: number;

    @Column()
    currency!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    subtotalAmount!: number;

    @ManyToOne(() => InvoiceEntity, invoice => invoice.items)
    invoice!: InvoiceEntity;

    constructor(partial?: Partial<InvoiceItemEntity>) {
        if (partial) {
            Object.assign(this, partial);
        }
    }
}
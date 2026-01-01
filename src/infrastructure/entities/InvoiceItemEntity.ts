import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { InvoiceEntity } from "./InvoiceEntity";

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
    description!: string;

    @Column("decimal")
    amount!: number;

    @ManyToOne(() => InvoiceEntity, invoice => invoice.items)
    invoice!: InvoiceEntity;
}
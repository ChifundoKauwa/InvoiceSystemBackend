import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

/**
 * INFRASTRUCTURE LAYER: Client Database Entity
 * 
 * TypeORM entity for clients table.
 * Separates persistence concerns from domain logic.
 */
@Entity("clients")
export class ClientEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ type: "text", nullable: true })
    address?: string;

    @Column({ nullable: true })
    taxId?: string;

    @Column({ default: "active" })
    status!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

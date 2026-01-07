import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSettings {
    @PrimaryColumn()
    id: number = 1; // Always use id=1 for singleton pattern

    @Column({ default: 'Invoice System' })
    siteName: string;

    @Column({ default: 'admin@invoicesystem.com' })
    siteEmail: string;

    @Column({ default: 'INV' })
    invoicePrefix: string;

    @Column({ default: 'USD' })
    defaultCurrency: string;

    @Column({ default: 30 })
    defaultDueDays: number;

    @Column({ default: 'user' })
    defaultUserRole: string;

    @Column({ default: true })
    allowRegistration: boolean;

    @Column({ default: false })
    requireEmailVerification: boolean;

    @Column({ default: true })
    enableNotifications: boolean;

    @Column({ default: false })
    enableBackups: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}

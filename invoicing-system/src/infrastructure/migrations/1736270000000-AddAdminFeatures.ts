import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

export class AddAdminFeatures1736270000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add userId column to invoices table
        await queryRunner.addColumn(
            "invoices",
            new TableColumn({
                name: "userId",
                type: "varchar",
                isNullable: true,
            })
        );

        // Create system_settings table
        await queryRunner.createTable(
            new Table({
                name: "system_settings",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        default: 1,
                    },
                    {
                        name: "siteName",
                        type: "varchar",
                        default: "'Invoice System'",
                    },
                    {
                        name: "siteEmail",
                        type: "varchar",
                        default: "'admin@invoicesystem.com'",
                    },
                    {
                        name: "invoicePrefix",
                        type: "varchar",
                        default: "'INV'",
                    },
                    {
                        name: "defaultCurrency",
                        type: "varchar",
                        default: "'USD'",
                    },
                    {
                        name: "defaultDueDays",
                        type: "int",
                        default: 30,
                    },
                    {
                        name: "defaultUserRole",
                        type: "varchar",
                        default: "'user'",
                    },
                    {
                        name: "allowRegistration",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "requireEmailVerification",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "enableNotifications",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "enableBackups",
                        type: "boolean",
                        default: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Insert default settings (using lowercase column names for PostgreSQL)
        await queryRunner.query(`
            INSERT INTO system_settings (id, "siteName", "siteEmail", "invoicePrefix", "defaultCurrency", "defaultDueDays", "defaultUserRole", "allowRegistration", "requireEmailVerification", "enableNotifications", "enableBackups")
            VALUES (1, 'Invoice System', 'admin@invoicesystem.com', 'INV', 'USD', 30, 'user', true, false, true, false)
            ON CONFLICT (id) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove userId column from invoices table
        await queryRunner.dropColumn("invoices", "userId");

        // Drop system_settings table
        await queryRunner.dropTable("system_settings");
    }
}

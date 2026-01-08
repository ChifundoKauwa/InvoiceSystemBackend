import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class AddClientSupport1736280000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create clients table
        await queryRunner.createTable(
            new Table({
                name: "clients",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "address",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "taxId",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "varchar",
                        default: "'active'",
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
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

        // Add clientId column to invoices table
        await queryRunner.addColumn(
            "invoices",
            new TableColumn({
                name: "clientId",
                type: "varchar",
                isNullable: true, // Temporarily nullable for existing data
            })
        );

        // Add foreign key constraint
        await queryRunner.createForeignKey(
            "invoices",
            new TableForeignKey({
                columnNames: ["clientId"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "RESTRICT", // Prevent deleting clients with invoices
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        const table = await queryRunner.getTable("invoices");
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("clientId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("invoices", foreignKey);
        }

        // Remove clientId column from invoices
        await queryRunner.dropColumn("invoices", "clientId");

        // Drop clients table
        await queryRunner.dropTable("clients");
    }
}

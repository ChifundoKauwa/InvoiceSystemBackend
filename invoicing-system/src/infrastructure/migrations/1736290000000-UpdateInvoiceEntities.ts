import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateInvoiceEntities1736290000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if invoices table exists, if not create it
        const invoicesTableExists = await queryRunner.hasTable("invoices");
        
        if (!invoicesTableExists) {
            // If table doesn't exist, create it with the correct schema
            await queryRunner.query(`
                CREATE TABLE "invoices" (
                    "id" varchar PRIMARY KEY,
                    "userId" varchar,
                    "clientId" varchar NOT NULL,
                    "currency" varchar NOT NULL,
                    "status" varchar NOT NULL,
                    "totalAmount" decimal(10,2) NOT NULL,
                    "issuedAt" timestamp,
                    "dueAt" timestamp
                )
            `);
        } else {
            // If table exists, update it
            // Rename 'state' to 'status' if it exists
            const columns = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'invoices' AND column_name IN ('state', 'status')
            `);
            
            const hasState = columns.some((col: any) => col.column_name === 'state');
            const hasStatus = columns.some((col: any) => col.column_name === 'status');
            
            if (hasState && !hasStatus) {
                await queryRunner.renameColumn("invoices", "state", "status");
            }
            
            // Rename 'issueAt' to 'issuedAt' if needed
            const timeColumns = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'invoices' AND column_name IN ('issueAt', 'issuedAt')
            `);
            
            const hasIssueAt = timeColumns.some((col: any) => col.column_name === 'issueAt');
            const hasIssuedAt = timeColumns.some((col: any) => col.column_name === 'issuedAt');
            
            if (hasIssueAt && !hasIssuedAt) {
                await queryRunner.renameColumn("invoices", "issueAt", "issuedAt");
            }
            
            // Add totalAmount column if it doesn't exist
            const totalAmountExists = await queryRunner.hasColumn("invoices", "totalAmount");
            if (!totalAmountExists) {
                await queryRunner.addColumn(
                    "invoices",
                    new TableColumn({
                        name: "totalAmount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                    })
                );
            }
        }

        // Check if invoice_items table exists, if not create it
        const itemsTableExists = await queryRunner.hasTable("invoice_items");
        
        if (!itemsTableExists) {
            await queryRunner.query(`
                CREATE TABLE "invoice_items" (
                    "id" varchar PRIMARY KEY,
                    "invoiceId" varchar NOT NULL,
                    "description" varchar NOT NULL,
                    "quantity" decimal(10,2) NOT NULL,
                    "unitPriceAmount" decimal(10,2) NOT NULL,
                    "currency" varchar NOT NULL,
                    "subtotalAmount" decimal(10,2) NOT NULL
                )
            `);
        } else {
            // Update existing invoice_items table
            // Check and rename 'amount' to required columns if needed
            const itemColumns = await queryRunner.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'invoice_items'
            `);
            
            const columnNames = itemColumns.map((col: any) => col.column_name);
            
            // Add missing columns
            if (!columnNames.includes('invoiceId')) {
                await queryRunner.addColumn(
                    "invoice_items",
                    new TableColumn({
                        name: "invoiceId",
                        type: "varchar",
                        isNullable: false,
                        default: "''",
                    })
                );
            }
            
            if (!columnNames.includes('quantity')) {
                await queryRunner.addColumn(
                    "invoice_items",
                    new TableColumn({
                        name: "quantity",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 1,
                    })
                );
            }
            
            if (!columnNames.includes('unitPriceAmount')) {
                // If 'amount' exists, rename it to 'unitPriceAmount'
                if (columnNames.includes('amount')) {
                    await queryRunner.renameColumn("invoice_items", "amount", "unitPriceAmount");
                } else {
                    await queryRunner.addColumn(
                        "invoice_items",
                        new TableColumn({
                            name: "unitPriceAmount",
                            type: "decimal",
                            precision: 10,
                            scale: 2,
                            default: 0,
                        })
                    );
                }
            }
            
            if (!columnNames.includes('currency')) {
                await queryRunner.addColumn(
                    "invoice_items",
                    new TableColumn({
                        name: "currency",
                        type: "varchar",
                        default: "'USD'",
                    })
                );
            }
            
            if (!columnNames.includes('subtotalAmount')) {
                await queryRunner.addColumn(
                    "invoice_items",
                    new TableColumn({
                        name: "subtotalAmount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                        default: 0,
                    })
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert changes
        const invoicesTableExists = await queryRunner.hasTable("invoices");
        
        if (invoicesTableExists) {
            // Rename columns back
            const hasStatus = await queryRunner.hasColumn("invoices", "status");
            if (hasStatus) {
                await queryRunner.renameColumn("invoices", "status", "state");
            }
            
            const hasIssuedAt = await queryRunner.hasColumn("invoices", "issuedAt");
            if (hasIssuedAt) {
                await queryRunner.renameColumn("invoices", "issuedAt", "issueAt");
            }
            
            // Drop totalAmount column
            const hasTotalAmount = await queryRunner.hasColumn("invoices", "totalAmount");
            if (hasTotalAmount) {
                await queryRunner.dropColumn("invoices", "totalAmount");
            }
        }
        
        // Revert invoice_items changes
        const itemsTableExists = await queryRunner.hasTable("invoice_items");
        if (itemsTableExists) {
            const hasUnitPriceAmount = await queryRunner.hasColumn("invoice_items", "unitPriceAmount");
            if (hasUnitPriceAmount) {
                await queryRunner.renameColumn("invoice_items", "unitPriceAmount", "amount");
            }
            
            // Drop added columns
            const columnsToRemove = ['invoiceId', 'quantity', 'currency', 'subtotalAmount'];
            for (const columnName of columnsToRemove) {
                const hasColumn = await queryRunner.hasColumn("invoice_items", columnName);
                if (hasColumn) {
                    await queryRunner.dropColumn("invoice_items", columnName);
                }
            }
        }
    }
}

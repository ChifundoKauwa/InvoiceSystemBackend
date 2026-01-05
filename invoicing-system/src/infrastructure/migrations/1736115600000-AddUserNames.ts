import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserNames1736115600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove old lowercase columns if they exist
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "firstname",
            DROP COLUMN IF EXISTS "lastname"
        `);

        // Add new camelCase columns
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "firstName" character varying NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "lastName" character varying NOT NULL DEFAULT ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "firstName",
            DROP COLUMN IF EXISTS "lastName"
        `);
    }
}

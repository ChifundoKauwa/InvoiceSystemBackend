import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { InvoiceEntity, InvoiceItemEntity } from './persistence/entities';
import { User } from '../users/users.entity';
import { SystemSettings } from '../admin/entities/system-settings.entity';
import { ClientEntity } from './entities/ClientEntity';

/**
 * TypeORM CLI Configuration
 * Used by TypeORM CLI commands for migrations
 */

// Load environment variables
loadEnv({ path: resolve(__dirname, '../../.env') });

const ensureDatabaseUrl = (): string => {
    if (!process.env.DATABASE_URL) {
        const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
        if (DB_HOST && DB_PORT && DB_USERNAME && DB_PASSWORD && DB_NAME) {
            const encodedPassword = encodeURIComponent(DB_PASSWORD);
            return `postgresql://${DB_USERNAME}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
        }
        throw new Error('DATABASE_URL or DB credentials not found in environment');
    }
    return process.env.DATABASE_URL;
};

const databaseUrl = ensureDatabaseUrl();
const isLocalDb = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

export default new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [InvoiceEntity, InvoiceItemEntity, User, SystemSettings, ClientEntity],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    synchronize: false, // Never auto-sync when running migrations
    logging: true,
    ssl: !isLocalDb ? {
        rejectUnauthorized: false,
    } : false,
});

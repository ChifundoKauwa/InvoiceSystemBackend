import { DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { InvoiceEntity, InvoiceItemEntity } from './persistence/entities';
import { User } from '../users/users.entity';
import { SystemSettings } from '../admin/entities/system-settings.entity';

/**
 * INFRASTRUCTURE LAYER: TypeORM Configuration
 * 
 * Configures database connection.
 * Entities are explicitly listed to control what gets mapped.
 * synchronize: true for development only (not production)
 * 
 * Returns a factory function that creates the DataSource options
 * after environment variables are loaded by ConfigModule.
 */
export const getTypeOrmConfig = (): DataSourceOptions => {
    const ensureDatabaseUrl = (): string | undefined => {
        if (!process.env.DATABASE_URL) {
            const envFile = process.env.APP_ENV === 'production' ? '.env.production' : '.env';
            const projectRoot = resolve(__dirname, '..', '..');
            loadEnv({ path: resolve(projectRoot, envFile) });
        }

        if (!process.env.DATABASE_URL) {
            const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;
            if (DB_HOST && DB_PORT && DB_USERNAME && DB_PASSWORD && DB_NAME) {
                const encodedPassword = encodeURIComponent(DB_PASSWORD);
                process.env.DATABASE_URL = `postgresql://${DB_USERNAME}:${encodedPassword}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
            }
        }

        return process.env.DATABASE_URL;
    };

    const databaseUrl = ensureDatabaseUrl();

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set. Provide DATABASE_URL or all DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_NAME variables.');
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalDb = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');

    return {
        type: 'postgres',
        url: databaseUrl,
        entities: [InvoiceEntity, InvoiceItemEntity, User, SystemSettings],
        synchronize: !isProduction, // Only auto-sync in development
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true, // Auto-run migrations on startup
        logging: process.env.LOG_LEVEL === 'debug',
        dropSchema: false,
        // SSL only for cloud databases (Supabase, Neon), not for localhost
        ssl: !isLocalDb ? {
            rejectUnauthorized: false,
        } : false,
    } as DataSourceOptions;
};
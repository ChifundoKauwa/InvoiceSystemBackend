import { DataSourceOptions } from 'typeorm';
import { InvoiceEntity, InvoiceItemEntity } from './persistence/entities';

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
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    return {
        type: 'postgres',
        url: databaseUrl,
        entities: [InvoiceEntity, InvoiceItemEntity],
        synchronize: true,
        logging: true,
        dropSchema: false,
        ssl: {
            rejectUnauthorized: false, // Required for Supabase
        },
    } as DataSourceOptions;
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = void 0;
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const entities_1 = require("./persistence/entities");
const users_entity_1 = require("../users/users.entity");
const getTypeOrmConfig = () => {
    const ensureDatabaseUrl = () => {
        if (!process.env.DATABASE_URL) {
            const envFile = process.env.APP_ENV === 'production' ? '.env.production' : '.env';
            const projectRoot = (0, path_1.resolve)(__dirname, '..', '..');
            (0, dotenv_1.config)({ path: (0, path_1.resolve)(projectRoot, envFile) });
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
        entities: [entities_1.InvoiceEntity, entities_1.InvoiceItemEntity, users_entity_1.User],
        synchronize: !isProduction,
        logging: process.env.LOG_LEVEL === 'debug',
        dropSchema: false,
        ssl: !isLocalDb ? {
            rejectUnauthorized: false,
        } : false,
    };
};
exports.getTypeOrmConfig = getTypeOrmConfig;
//# sourceMappingURL=typeorm.config.js.map
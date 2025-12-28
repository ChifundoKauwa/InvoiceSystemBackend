import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceModule } from './invoice/invoice.module';
import { getTypeOrmConfig } from './infrastructure/typeorm.config';
import { GlobalExceptionFilter } from './presentation/http/filters';

/**
 * ROOT MODULE: Application Configuration
 * 
 * Configures:
 * - Environment variables
 * - Database connection
 * - Feature modules
 * - Global filters
 * 
 * All business logic is imported through InvoiceModule.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot(getTypeOrmConfig()),
        InvoiceModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: 'APP_FILTER',
            useClass: GlobalExceptionFilter,
        },
    ],
})
export class AppModule {}

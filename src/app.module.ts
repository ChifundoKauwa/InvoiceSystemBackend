import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InvoiceModule } from './invoice/invoice.module';
import { getTypeOrmConfig } from './infrastructure/typeorm.config';
import { GlobalExceptionFilter } from './presentation/http/filters';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt.guard';
import { RolesGuard } from './auth/guards/roles.guard';

/**
 * ROOT MODULE: Application Configuration
 * 
 * Configures:
 * - Environment variables
 * - Database connection
 * - Feature modules
 * - Global filters
 * - Global authentication guards
 * 
 * All business logic is imported through InvoiceModule.
 * Authentication is applied globally via JwtAuthGuard.
 * Use @Public() decorator to bypass authentication.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRoot(getTypeOrmConfig()),
        AuthModule,
        UsersModule,
        InvoiceModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: 'APP_FILTER',
            useClass: GlobalExceptionFilter,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule {}

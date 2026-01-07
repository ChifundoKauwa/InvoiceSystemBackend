import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/users.entity';
import { InvoiceEntity } from '../infrastructure/entities/InvoiceEntity';
import { SystemSettings } from './entities/system-settings.entity';

/**
 * Admin Module
 * 
 * Provides admin functionality:
 * - System statistics and dashboard
 * - User management and role assignment
 * - System-wide invoice viewing
 * - System settings management
 * 
 * All endpoints are protected by role-based guards
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([User, InvoiceEntity, SystemSettings]),
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}

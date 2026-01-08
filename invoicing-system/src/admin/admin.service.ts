import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/users.entity';
import { InvoiceEntity } from '../infrastructure/entities/InvoiceEntity';
import { SystemSettings } from './entities/system-settings.entity';
import { SystemStatsResponse } from './dtos/system-stats.dto';
import { UsersListResponse, UserResponse } from './dtos/users-list.dto';
import { UpdateUserRoleRequest, UpdateUserRoleResponse } from './dtos/update-role.dto';
import { AdminInvoicesListResponse, AdminInvoiceResponse } from './dtos/admin-invoices.dto';
import { UpdateSettingsRequest, SystemSettingsResponse } from './dtos/settings.dto';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(InvoiceEntity)
        private readonly invoiceRepository: Repository<InvoiceEntity>,
        @InjectRepository(SystemSettings)
        private readonly settingsRepository: Repository<SystemSettings>,
    ) {}

    /**
     * Get system-wide statistics for admin dashboard
     */
    async getSystemStats(): Promise<SystemStatsResponse> {
        // Get total users count
        const totalUsers = await this.userRepository.count();

        // Get total invoices count
        const totalInvoices = await this.invoiceRepository.count();

        // Calculate total revenue from PAID invoices
        const paidInvoices = await this.invoiceRepository.find({
            where: { status: 'paid' },
            relations: ['items'],
        });

        let totalRevenue = 0;
        paidInvoices.forEach(invoice => {
            totalRevenue += invoice.totalAmount;
        });

        // Count overdue invoices
        const overdueInvoices = await this.invoiceRepository.count({
            where: { status: 'overdue' },
        });

        // Get recent users (last 5)
        const recentUsers = await this.userRepository.find({
            order: { createdAt: 'DESC' },
            take: 5,
            select: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
        });

        // Get recent invoices (last 5)
        const recentInvoices = await this.invoiceRepository.find({
            order: { issuedAt: 'DESC' },
            take: 5,
            select: ['id', 'currency', 'status', 'issuedAt'],
        });

        return {
            totalUsers,
            totalInvoices,
            totalRevenue,
            overdueInvoices,
            recentUsers: recentUsers.map(user => ({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            })),
            recentInvoices: recentInvoices.map(invoice => ({
                id: invoice.id,
                currency: invoice.currency,
                status: invoice.status,
                issuedAt: invoice.issuedAt,
            })),
        };
    }

    /**
     * Get all users in the system
     */
    async getAllUsers(): Promise<UsersListResponse> {
        const users = await this.userRepository.find({
            order: { createdAt: 'DESC' },
        });

        const userResponses: UserResponse[] = users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));

        return {
            users: userResponses,
            total: users.length,
        };
    }

    /**
     * Update a user's role
     */
    async updateUserRole(
        userId: string,
        updateDto: UpdateUserRoleRequest,
        currentUserId: string
    ): Promise<UpdateUserRoleResponse> {
        // Prevent users from changing their own role
        if (userId === currentUserId) {
            throw new BadRequestException('You cannot change your own role');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role = updateDto.role;
        await this.userRepository.save(user);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            message: `User role updated to ${updateDto.role} successfully`,
        };
    }

    /**
     * Get all invoices across all users
     */
    async getAllInvoices(): Promise<AdminInvoicesListResponse> {
        const invoices = await this.invoiceRepository.find({
            relations: ['items'],
            order: { issuedAt: 'DESC' },
        });

        const adminInvoices: AdminInvoiceResponse[] = [];

        for (const invoice of invoices) {
            // Use totalAmount from entity
            const totalAmount = invoice.totalAmount;

            // Get user info if userId exists
            let userEmail = 'Unknown';
            let userName = 'Unknown User';
            if (invoice.userId) {
                const user = await this.userRepository.findOne({ 
                    where: { id: invoice.userId },
                    select: ['email', 'firstName', 'lastName']
                });
                if (user) {
                    userEmail = user.email;
                    userName = `${user.firstName} ${user.lastName}`;
                }
            }

            adminInvoices.push({
                id: invoice.id,
                userId: invoice.userId,
                userEmail,
                userName,
                currency: invoice.currency,
                status: invoice.status,
                issuedAt: invoice.issuedAt,
                dueAt: invoice.dueAt,
                items: invoice.items.map(item => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPriceAmount,
                })),
                totalAmount,
            });
        }

        return {
            invoices: adminInvoices,
            total: adminInvoices.length,
        };
    }

    /**
     * Get system settings
     */
    async getSettings(): Promise<SystemSettingsResponse> {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

        // Create default settings if they don't exist
        if (!settings) {
            settings = this.settingsRepository.create({
                id: 1,
                siteName: 'Invoice System',
                siteEmail: 'admin@invoicesystem.com',
                invoicePrefix: 'INV',
                defaultCurrency: 'USD',
                defaultDueDays: 30,
                defaultUserRole: 'user',
                allowRegistration: true,
                requireEmailVerification: false,
                enableNotifications: true,
                enableBackups: false,
            });
            settings = await this.settingsRepository.save(settings);
        }

        return {
            siteName: settings.siteName,
            siteEmail: settings.siteEmail,
            invoicePrefix: settings.invoicePrefix,
            defaultCurrency: settings.defaultCurrency,
            defaultDueDays: settings.defaultDueDays,
            defaultUserRole: settings.defaultUserRole,
            allowRegistration: settings.allowRegistration,
            requireEmailVerification: settings.requireEmailVerification,
            enableNotifications: settings.enableNotifications,
            enableBackups: settings.enableBackups,
        };
    }

    /**
     * Update system settings
     */
    async updateSettings(updateDto: UpdateSettingsRequest): Promise<SystemSettingsResponse> {
        let settings = await this.settingsRepository.findOne({ where: { id: 1 } });

        if (!settings) {
            settings = this.settingsRepository.create({ id: 1 });
        }

        // Update only provided fields
        Object.keys(updateDto).forEach(key => {
            if (updateDto[key] !== undefined && settings) {
                settings[key] = updateDto[key];
            }
        });

        settings = await this.settingsRepository.save(settings);

        return {
            siteName: settings.siteName,
            siteEmail: settings.siteEmail,
            invoicePrefix: settings.invoicePrefix,
            defaultCurrency: settings.defaultCurrency,
            defaultDueDays: settings.defaultDueDays,
            defaultUserRole: settings.defaultUserRole,
            allowRegistration: settings.allowRegistration,
            requireEmailVerification: settings.requireEmailVerification,
            enableNotifications: settings.enableNotifications,
            enableBackups: settings.enableBackups,
            message: 'Settings updated successfully',
        };
    }
}

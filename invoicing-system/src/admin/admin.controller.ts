import { Controller, Get, Put, Param, Body, Request, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/users.entity';
import { UpdateUserRoleRequest } from './dtos/update-role.dto';
import { UpdateSettingsRequest } from './dtos/settings.dto';

/**
 * Admin Controller
 * 
 * Handles all admin-related endpoints:
 * - System statistics
 * - User management
 * - System-wide invoice viewing
 * - System settings
 * 
 * All endpoints require admin or manager role
 */
@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    /**
     * GET /admin/stats
     * Get system-wide statistics for dashboard
     * Access: Admin, Manager
     */
    @Get('stats')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getStats() {
        return this.adminService.getSystemStats();
    }

    /**
     * GET /admin/users
     * Get all users in the system
     * Access: Admin, Manager
     */
    @Get('users')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getAllUsers() {
        return this.adminService.getAllUsers();
    }

    /**
     * PUT /admin/users/:id/role
     * Update a user's role
     * Access: Admin only
     */
    @Put('users/:id/role')
    @Roles(UserRole.ADMIN)
    async updateUserRole(
        @Param('id') userId: string,
        @Body() updateDto: UpdateUserRoleRequest,
        @Request() req: any
    ) {
        const currentUserId = req.user.sub; // JWT payload contains user id as 'sub'
        return this.adminService.updateUserRole(userId, updateDto, currentUserId);
    }

    /**
     * GET /admin/invoices
     * Get all invoices across all users
     * Access: Admin, Manager
     */
    @Get('invoices')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    async getAllInvoices() {
        return this.adminService.getAllInvoices();
    }

    /**
     * GET /admin/settings
     * Get system settings
     * Access: Admin only
     */
    @Get('settings')
    @Roles(UserRole.ADMIN)
    async getSettings() {
        return this.adminService.getSettings();
    }

    /**
     * PUT /admin/settings
     * Update system settings
     * Access: Admin only
     */
    @Put('settings')
    @Roles(UserRole.ADMIN)
    async updateSettings(@Body() updateDto: UpdateSettingsRequest) {
        return this.adminService.updateSettings(updateDto);
    }
}

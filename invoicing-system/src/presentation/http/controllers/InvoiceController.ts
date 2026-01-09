import { Controller, Post, Get, Body, Param, HttpStatus, HttpCode, UseGuards } from '@nestjs/common';
import { CreateInvoiceUseCase, IssueInvoiceUseCase, PayInvoiceUseCase, MarkAsOverdueUseCase, VoidInvoiceUseCase } from '../../../application/usecases';
import { CreateInvoiceCommand, IssueInvoiceCommand, PayInvoiceCommand, MarkAsOverdueCommand, VoidInvoiceCommand } from '../../../application/dtos';
import { InvoiceDto } from '../../../application/dtos/Responses';
import { CreateInvoiceRequestDto, IssueInvoiceRequestDto, PayInvoiceRequestDto, MarkAsOverdueRequestDto, VoidInvoiceRequestDto } from '../dtos/RequestDtos';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../users/users.entity';

/**
 * PRESENTATION LAYER: Invoice Controller
 * 
 * Thin HTTP handler layer with role-based authorization.
 * - Receives HTTP requests
 * - Maps to application commands
 * - Delegates to use cases
 * - Returns HTTP responses
 * 
 * Authorization is handled at the presentation layer (not in domain).
 * All business logic is in use cases (application layer).
 * All error handling via global exception filter.
 * Controller is pure orchestration.
 * 
 * Role Requirements:
 * - Create/Issue/Void: MANAGER or ADMIN
 * - Pay/Mark Overdue: Any authenticated user
 */
@Controller('invoices')
export class InvoiceController {
    constructor(
        private readonly createInvoiceUseCase: CreateInvoiceUseCase,
        private readonly issueInvoiceUseCase: IssueInvoiceUseCase,
        private readonly payInvoiceUseCase: PayInvoiceUseCase,
        private readonly markAsOverdueUseCase: MarkAsOverdueUseCase,
        private readonly voidInvoiceUseCase: VoidInvoiceUseCase,
    ) {}

    /**
     * POST /invoices
     * Create a new draft invoice
     * Requires: MANAGER or ADMIN role
     */
    @Post()
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createInvoice(@Body() dto: CreateInvoiceRequestDto): Promise<InvoiceDto> {
        // Generate unique invoice number with retry logic
        const invoiceNumber = this.generateInvoiceNumber();
        
        console.log('=== CREATE INVOICE REQUEST ===');
        console.log('Generated Invoice Number:', invoiceNumber);
        console.log('Client ID:', dto.clientId);
        console.log('Currency:', dto.currency);
        console.log('Items:', dto.items?.length);
        console.log('==============================');
        
        try {
            const command = new CreateInvoiceCommand(
                invoiceNumber,
                dto.clientId,
                dto.currency,
                dto.items
            );
            return await this.createInvoiceUseCase.execute(command);
        } catch (error: any) {
            // If duplicate key error, retry with new invoice number (extremely rare)
            if (error.code === '23505' || error.message?.includes('duplicate')) {
                console.warn('Invoice number collision detected, retrying...');
                const retryInvoiceNumber = this.generateInvoiceNumber();
                const command = new CreateInvoiceCommand(
                    retryInvoiceNumber,
                    dto.clientId,
                    dto.currency,
                    dto.items
                );
                return await this.createInvoiceUseCase.execute(command);
            }
            throw error;
        }
    }

    /**
     * POST /invoices/:id/issue
     * Transition invoice to ISSUED state
     * Calculates 30-day due date automatically
     * Requires: MANAGER or ADMIN role
     */
    @Post(':id/issue')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async issueInvoice(
        @Param('id') invoiceId: string,
        @Body() dto?: IssueInvoiceRequestDto,
    ): Promise<InvoiceDto> {
        const command = new IssueInvoiceCommand(invoiceId, dto?.issueAt || new Date());
        return this.issueInvoiceUseCase.execute(command);
    }

    /**
     * POST /invoices/:id/pay
     * Transition invoice to PAID state
     * Requires: Any authenticated user
     */
    @Post(':id/pay')
    @HttpCode(HttpStatus.OK)
    async payInvoice(@Param('id') invoiceId: string): Promise<InvoiceDto> {
        const command = new PayInvoiceCommand(invoiceId);
        return this.payInvoiceUseCase.execute(command);
    }

    /**
     * POST /invoices/:id/overdue
     * Transition issued invoice to OVERDUE state
     * Requires: Any authenticated user
     */
    @Post(':id/overdue')
    @HttpCode(HttpStatus.OK)
    async markAsOverdue(@Param('id') invoiceId: string): Promise<InvoiceDto> {
        const command = new MarkAsOverdueCommand(invoiceId);
        return this.markAsOverdueUseCase.execute(command);
    }

    /**
     * POST /invoices/:id/void
     * Transition invoice to VOIDED state
     * Cannot void a paid invoice
     * Requires: MANAGER or ADMIN role
     */
    @Post(':id/void')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async voidInvoice(@Param('id') invoiceId: string): Promise<InvoiceDto> {
        const command = new VoidInvoiceCommand(invoiceId);
        return this.voidInvoiceUseCase.execute(command);
    }

    /**
     * Generate unique invoice number
     * Format: INV-YYYYMMDD-NNNN
     * Backend is single source of truth for invoice numbers
     */
    private generateInvoiceNumber(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `INV-${year}${month}${day}-${random}-${timestamp}`;
    }
}

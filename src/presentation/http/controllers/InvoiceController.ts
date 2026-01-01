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
        const command = new CreateInvoiceCommand(
            dto.invoiceId,
            dto.currency,
            dto.items
        );
        return this.createInvoiceUseCase.execute(command);
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
}

import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../users/users.entity';
import { CreateClientUseCase, UpdateClientUseCase, GetClientUseCase, ListClientsUseCase, ArchiveClientUseCase } from '../../../application/client';
import { CreateClientCommand, UpdateClientCommand, ArchiveClientCommand } from '../../../application/client/ClientCommands';
import { CreateClientRequestDto, UpdateClientRequestDto } from '../dtos/ClientRequestDtos';

/**
 * PRESENTATION LAYER: Client Controller
 * 
 * Manages client (customer) resources.
 * All endpoints require authentication.
 * Create/Update/Delete require MANAGER or ADMIN role.
 */
@Controller('clients')
export class ClientController {
    constructor(
        private readonly createClientUseCase: CreateClientUseCase,
        private readonly updateClientUseCase: UpdateClientUseCase,
        private readonly getClientUseCase: GetClientUseCase,
        private readonly listClientsUseCase: ListClientsUseCase,
        private readonly archiveClientUseCase: ArchiveClientUseCase
    ) {}

    /**
     * POST /clients
     * Create a new client
     * Requires: MANAGER or ADMIN role
     */
    @Post()
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createClient(@Body() dto: CreateClientRequestDto) {
        const command = new CreateClientCommand(
            dto.clientId,
            dto.name,
            dto.email,
            dto.phone,
            dto.address,
            dto.taxId
        );
        return this.createClientUseCase.execute(command);
    }

    /**
     * GET /clients
     * List all clients
     * Requires: Any authenticated user
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    async listClients() {
        return this.listClientsUseCase.execute();
    }

    /**
     * GET /clients/:id
     * Get client by ID
     * Requires: Any authenticated user
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getClient(@Param('id') id: string) {
        return this.getClientUseCase.execute(id);
    }

    /**
     * PUT /clients/:id
     * Update client information
     * Requires: MANAGER or ADMIN role
     */
    @Put(':id')
    @Roles(UserRole.MANAGER, UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async updateClient(@Param('id') id: string, @Body() dto: UpdateClientRequestDto) {
        const command = new UpdateClientCommand(
            id,
            dto.name,
            dto.email,
            dto.phone,
            dto.address,
            dto.taxId
        );
        return this.updateClientUseCase.execute(command);
    }

    /**
     * DELETE /clients/:id
     * Archive (soft delete) a client
     * Requires: ADMIN role only
     */
    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.NO_CONTENT)
    async archiveClient(@Param('id') id: string) {
        const command = new ArchiveClientCommand(id);
        await this.archiveClientUseCase.execute(command);
    }
}

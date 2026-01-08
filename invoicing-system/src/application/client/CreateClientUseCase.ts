import { Injectable } from '@nestjs/common';
import { ClientRepo } from '../../domain/client/ClientRepo';
import { Client } from '../../domain/client/Client';
import { CreateClientCommand } from './ClientCommands';
import { ClientDto } from './ClientResponses';

/**
 * APPLICATION LAYER: Create Client Use Case
 */
@Injectable()
export class CreateClientUseCase {
    constructor(private readonly clientRepo: ClientRepo) {}

    async execute(command: CreateClientCommand): Promise<ClientDto> {
        // Check if client with email already exists
        const existing = await this.clientRepo.findByEmail(command.email);
        if (existing) {
            throw new Error(`Client with email ${command.email} already exists`);
        }

        // Create domain aggregate
        const client = new Client(
            command.clientId,
            command.name,
            command.email,
            command.phone,
            command.address,
            command.taxId
        );

        // Persist
        await this.clientRepo.save(client);

        return this.mapToDto(client);
    }

    private mapToDto(client: Client): ClientDto {
        return new ClientDto(
            client.getId(),
            client.getName(),
            client.getEmail(),
            client.getPhone(),
            client.getAddress(),
            client.getTaxId(),
            client.getStatus()
        );
    }
}

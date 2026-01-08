import { Injectable } from '@nestjs/common';
import { ClientRepo } from '../../domain/client/ClientRepo';
import { UpdateClientCommand } from './ClientCommands';
import { ClientDto } from './ClientResponses';

/**
 * APPLICATION LAYER: Update Client Use Case
 */
@Injectable()
export class UpdateClientUseCase {
    constructor(private readonly clientRepo: ClientRepo) {}

    async execute(command: UpdateClientCommand): Promise<ClientDto> {
        // Get existing client
        const client = await this.clientRepo.getById(command.clientId);

        // Update domain aggregate
        const updated = client.updateContactInfo(
            command.name,
            command.email,
            command.phone,
            command.address,
            command.taxId
        );

        // Persist
        await this.clientRepo.save(updated);

        return this.mapToDto(updated);
    }

    private mapToDto(client: any): ClientDto {
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

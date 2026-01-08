import { Injectable } from '@nestjs/common';
import { ClientRepo } from '../../domain/client/ClientRepo';
import { ClientDto } from './ClientResponses';

/**
 * APPLICATION LAYER: List Clients Use Case
 */
@Injectable()
export class ListClientsUseCase {
    constructor(private readonly clientRepo: ClientRepo) {}

    async execute(): Promise<ClientDto[]> {
        const clients = await this.clientRepo.findAll();
        
        return clients.map(client => new ClientDto(
            client.getId(),
            client.getName(),
            client.getEmail(),
            client.getPhone(),
            client.getAddress(),
            client.getTaxId(),
            client.getStatus()
        ));
    }
}

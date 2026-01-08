import { Injectable } from '@nestjs/common';
import { ClientRepo } from '../../domain/client/ClientRepo';
import { ClientDto } from './ClientResponses';

/**
 * APPLICATION LAYER: Get Client Use Case
 */
@Injectable()
export class GetClientUseCase {
    constructor(private readonly clientRepo: ClientRepo) {}

    async execute(clientId: string): Promise<ClientDto> {
        const client = await this.clientRepo.getById(clientId);
        
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

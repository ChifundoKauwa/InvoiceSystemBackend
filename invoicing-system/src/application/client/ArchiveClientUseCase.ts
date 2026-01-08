import { Injectable } from '@nestjs/common';
import { ClientRepo } from '../../domain/client/ClientRepo';
import { ArchiveClientCommand } from './ClientCommands';

/**
 * APPLICATION LAYER: Archive Client Use Case
 */
@Injectable()
export class ArchiveClientUseCase {
    constructor(private readonly clientRepo: ClientRepo) {}

    async execute(command: ArchiveClientCommand): Promise<void> {
        const client = await this.clientRepo.getById(command.clientId);
        const archived = client.archive();
        await this.clientRepo.save(archived);
    }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientEntity } from '../infrastructure/entities/ClientEntity';
import { ClientController } from '../presentation/http/controllers/ClientController';
import {
    CreateClientUseCase,
    UpdateClientUseCase,
    GetClientUseCase,
    ListClientsUseCase,
    ArchiveClientUseCase,
} from '../application/client';
import { TypeormClientRepo } from '../infrastructure/persistence/repositories/TypeormClientRepo';
import { ClientRepo } from '../domain/client/ClientRepo';

/**
 * Client Module
 * 
 * Provides client (customer) management functionality.
 * Wires together domain, application, and infrastructure layers.
 */
@Module({
    imports: [TypeOrmModule.forFeature([ClientEntity])],
    controllers: [ClientController],
    providers: [
        // Use Cases
        CreateClientUseCase,
        UpdateClientUseCase,
        GetClientUseCase,
        ListClientsUseCase,
        ArchiveClientUseCase,
        // Repository
        {
            provide: ClientRepo,
            useClass: TypeormClientRepo,
        },
    ],
    exports: [
        ClientRepo,
        GetClientUseCase,
        ListClientsUseCase,
    ],
})
export class ClientModule {}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../../domain/client/Client';
import { ClientRepo } from '../../../domain/client/ClientRepo';
import { ClientEntity } from '../../entities/ClientEntity';
import { ClientMapper } from '../mappers/ClientMapper';

/**
 * INFRASTRUCTURE LAYER: Client Repository Implementation
 * 
 * Implements ClientRepo using TypeORM.
 */
@Injectable()
export class TypeormClientRepo extends ClientRepo {
    constructor(
        @InjectRepository(ClientEntity)
        private readonly repository: Repository<ClientEntity>
    ) {
        super();
    }

    async getById(id: string): Promise<Client> {
        const entity = await this.repository.findOne({ where: { id } });
        if (!entity) {
            throw new Error(`Client not found: ${id}`);
        }
        return ClientMapper.toDomain(entity);
    }

    async save(client: Client): Promise<void> {
        const entity = ClientMapper.toPersistence(client);
        await this.repository.save(entity);
    }

    async findAll(): Promise<Client[]> {
        const entities = await this.repository.find({
            order: { createdAt: 'DESC' }
        });
        return entities.map(ClientMapper.toDomain);
    }

    async findByEmail(email: string): Promise<Client | null> {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? ClientMapper.toDomain(entity) : null;
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}

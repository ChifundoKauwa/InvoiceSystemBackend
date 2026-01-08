import { Client } from "../../../domain/client/Client";
import { ClientStatus } from "../../../domain/client/ClientStatus";
import { ClientEntity } from "../../entities/ClientEntity";

/**
 * INFRASTRUCTURE LAYER: Client Mapper
 * 
 * Converts between domain Client and persistence ClientEntity.
 */
export class ClientMapper {
    static toDomain(entity: ClientEntity): Client {
        return new Client(
            entity.id,
            entity.name,
            entity.email,
            entity.phone,
            entity.address,
            entity.taxId,
            entity.status as ClientStatus,
            [] // Events are not persisted
        );
    }

    static toPersistence(client: Client): ClientEntity {
        const entity = new ClientEntity();
        entity.id = client.getId();
        entity.name = client.getName();
        entity.email = client.getEmail();
        entity.phone = client.getPhone();
        entity.address = client.getAddress();
        entity.taxId = client.getTaxId();
        entity.status = client.getStatus();
        return entity;
    }
}

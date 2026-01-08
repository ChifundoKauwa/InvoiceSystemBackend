import { Client } from "./Client";

/**
 * DOMAIN LAYER: Client Repository Interface
 * 
 * Abstract repository for client persistence.
 * Domain defines the contract, infrastructure implements it.
 */
export abstract class ClientRepo {
    abstract getById(id: string): Promise<Client>;
    abstract save(client: Client): Promise<void>;
    abstract findAll(): Promise<Client[]>;
    abstract findByEmail(email: string): Promise<Client | null>;
    abstract delete(id: string): Promise<void>;
}

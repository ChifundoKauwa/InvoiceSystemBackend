import { ClientStatus } from "./ClientStatus";
import { DomainEvent } from "../invoice/DomainEvent";
import { ClientCreated, ClientUpdated, ClientArchived } from "./ClientEvent";

/**
 * DOMAIN LAYER: Client Aggregate Root
 * 
 * Represents a client (customer) who receives invoices.
 * Enforces invariants:
 * - Valid email format
 * - Cannot modify archived clients
 * - Immutable after operations (returns new instance)
 */
export class Client {
    private readonly id: string;
    private name: string;
    private email: string;
    private phone?: string;
    private address?: string;
    private taxId?: string;
    private status: ClientStatus;
    private events: DomainEvent[] = [];

    constructor(
        id: string,
        name: string,
        email: string,
        phone?: string,
        address?: string,
        taxId?: string,
        status: ClientStatus = ClientStatus.Active,
        events: DomainEvent[] = []
    ) {
        if (!id || id.trim().length === 0) {
            throw new Error("Client ID is required");
        }
        if (!name || name.trim().length === 0) {
            throw new Error("Client name is required");
        }
        if (!email || email.trim().length === 0) {
            throw new Error("Client email is required");
        }
        if (!this.isValidEmail(email)) {
            throw new Error("Invalid email format");
        }

        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.taxId = taxId;
        this.status = status;
        
        if (events && events.length > 0) {
            this.events = [...events];
        } else {
            this.events = [new ClientCreated(id, name, email)];
        }
    }

    /**
     * Update client contact information
     */
    updateContactInfo(name: string, email: string, phone?: string, address?: string, taxId?: string): Client {
        if (this.status === ClientStatus.Archived) {
            throw new Error("Cannot update archived client");
        }
        if (!name || name.trim().length === 0) {
            throw new Error("Client name is required");
        }
        if (!email || email.trim().length === 0) {
            throw new Error("Client email is required");
        }
        if (!this.isValidEmail(email)) {
            throw new Error("Invalid email format");
        }

        const updated = new Client(
            this.id,
            name,
            email,
            phone,
            address,
            taxId,
            this.status,
            [...this.events, new ClientUpdated(this.id)]
        );
        return updated;
    }

    /**
     * Archive the client (soft delete)
     */
    archive(): Client {
        if (this.status === ClientStatus.Archived) {
            throw new Error("Client is already archived");
        }

        const archived = new Client(
            this.id,
            this.name,
            this.email,
            this.phone,
            this.address,
            this.taxId,
            ClientStatus.Archived,
            [...this.events, new ClientArchived(this.id)]
        );
        return archived;
    }

    /**
     * Reactivate an inactive client
     */
    activate(): Client {
        if (this.status === ClientStatus.Active) {
            throw new Error("Client is already active");
        }
        if (this.status === ClientStatus.Archived) {
            throw new Error("Cannot reactivate archived client");
        }

        const activated = new Client(
            this.id,
            this.name,
            this.email,
            this.phone,
            this.address,
            this.taxId,
            ClientStatus.Active,
            [...this.events, new ClientUpdated(this.id)]
        );
        return activated;
    }

    /**
     * Deactivate the client
     */
    deactivate(): Client {
        if (this.status === ClientStatus.Inactive) {
            throw new Error("Client is already inactive");
        }
        if (this.status === ClientStatus.Archived) {
            throw new Error("Cannot deactivate archived client");
        }

        const deactivated = new Client(
            this.id,
            this.name,
            this.email,
            this.phone,
            this.address,
            this.taxId,
            ClientStatus.Inactive,
            [...this.events, new ClientUpdated(this.id)]
        );
        return deactivated;
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Getters
    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getEmail(): string {
        return this.email;
    }

    getPhone(): string | undefined {
        return this.phone;
    }

    getAddress(): string | undefined {
        return this.address;
    }

    getTaxId(): string | undefined {
        return this.taxId;
    }

    getStatus(): ClientStatus {
        return this.status;
    }

    getEvents(): DomainEvent[] {
        return [...this.events];
    }

    isActive(): boolean {
        return this.status === ClientStatus.Active;
    }

    isArchived(): boolean {
        return this.status === ClientStatus.Archived;
    }
}

import { DomainEvent } from "../invoice/DomainEvent";

/**
 * DOMAIN LAYER: Client Domain Events
 */

export class ClientCreated extends DomainEvent {
    constructor(
        public readonly clientId: string,
        public readonly name: string,
        public readonly email: string,
        public readonly occurredAt: Date = new Date()
    ) {
        super();
    }
}

export class ClientUpdated extends DomainEvent {
    constructor(
        public readonly clientId: string,
        public readonly occurredAt: Date = new Date()
    ) {
        super();
    }
}

export class ClientArchived extends DomainEvent {
    constructor(
        public readonly clientId: string,
        public readonly occurredAt: Date = new Date()
    ) {
        super();
    }
}

import { DomainEvent } from "../../domain/invoice/DomainEvent";

/**
 * APPLICATION LAYER: Event Bus Interface
 * 
 * Abstracts event publishing from the domain.
 * Use cases publish domain events through this interface.
 * Implementation (NestJS events, message queue) is infrastructure concern.
 */
export abstract class ApplicationEventBus {
    abstract publish(event: DomainEvent): Promise<void>;
    abstract publishAll(events: DomainEvent[]): Promise<void>;
}

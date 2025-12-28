/**
 * DOMAIN LAYER: Base Domain Event
 * 
 * All domain events inherit from this abstract class.
 * Records when the event occurred for audit and replay purposes.
 */
export abstract class DomainEvent {
    readonly occurredAt: Date;
    constructor() {
        this.occurredAt = new Date();
    }
}
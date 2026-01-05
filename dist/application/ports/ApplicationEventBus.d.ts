import { DomainEvent } from "../../domain/invoice/DomainEvent";
export declare abstract class ApplicationEventBus {
    abstract publish(event: DomainEvent): Promise<void>;
    abstract publishAll(events: DomainEvent[]): Promise<void>;
}

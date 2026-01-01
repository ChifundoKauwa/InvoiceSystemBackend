import { Injectable, Inject } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import { ApplicationEventBus } from '../../application/ports/ApplicationEventBus';

/**
 * INFRASTRUCTURE LAYER: Event Bus Implementation
 * 
 * Bridges domain events to NestJS event-emitter.
 * Application layer publishes through ApplicationEventBus interface.
 * Infrastructure wires it to actual message queue/event system.
 * 
 * Currently uses NestJS event-emitter (synchronous).
 * Can be swapped for RabbitMQ, Kafka, etc.
 */
@Injectable()
export class NestEventBus extends ApplicationEventBus {
    constructor(private readonly eventEmitter: EventEmitter2) {
        super();
    }

    async publish(event: any): Promise<void> {
        const eventName = event.constructor.name;
        this.eventEmitter.emit(eventName, event);
    }

    async publishAll(events: any[]): Promise<void> {
        for (const event of events) {
            await this.publish(event);
        }
    }
}

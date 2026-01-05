import { EventEmitter2 } from 'eventemitter2';
import { ApplicationEventBus } from '../../application/ports/ApplicationEventBus';
export declare class NestEventBus extends ApplicationEventBus {
    private readonly eventEmitter;
    constructor(eventEmitter: EventEmitter2);
    publish(event: any): Promise<void>;
    publishAll(events: any[]): Promise<void>;
}

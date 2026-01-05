"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestEventBus = void 0;
const common_1 = require("@nestjs/common");
const eventemitter2_1 = require("eventemitter2");
const ApplicationEventBus_1 = require("../../application/ports/ApplicationEventBus");
let NestEventBus = class NestEventBus extends ApplicationEventBus_1.ApplicationEventBus {
    eventEmitter;
    constructor(eventEmitter) {
        super();
        this.eventEmitter = eventEmitter;
    }
    async publish(event) {
        const eventName = event.constructor.name;
        this.eventEmitter.emit(eventName, event);
    }
    async publishAll(events) {
        for (const event of events) {
            await this.publish(event);
        }
    }
};
exports.NestEventBus = NestEventBus;
exports.NestEventBus = NestEventBus = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [eventemitter2_1.EventEmitter2])
], NestEventBus);
//# sourceMappingURL=NestEventBus.js.map
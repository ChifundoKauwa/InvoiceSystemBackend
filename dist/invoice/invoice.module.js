"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_emitter_1 = require("@nestjs/event-emitter");
const entities_1 = require("../infrastructure/persistence/entities");
const InvoiceController_1 = require("../presentation/http/controllers/InvoiceController");
const usecases_1 = require("../application/usecases");
const TypeormInvoiceRepo_1 = require("../infrastructure/persistence/repositories/TypeormInvoiceRepo");
const NestEventBus_1 = require("../infrastructure/eventbus/NestEventBus");
const InvoiceRepo_1 = require("../domain/invoice/InvoiceRepo");
const ApplicationEventBus_1 = require("../application/ports/ApplicationEventBus");
let InvoiceModule = class InvoiceModule {
};
exports.InvoiceModule = InvoiceModule;
exports.InvoiceModule = InvoiceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([entities_1.InvoiceEntity, entities_1.InvoiceItemEntity]),
            event_emitter_1.EventEmitterModule.forRoot(),
        ],
        controllers: [InvoiceController_1.InvoiceController],
        providers: [
            usecases_1.CreateInvoiceUseCase,
            usecases_1.IssueInvoiceUseCase,
            usecases_1.PayInvoiceUseCase,
            usecases_1.MarkAsOverdueUseCase,
            usecases_1.VoidInvoiceUseCase,
            {
                provide: InvoiceRepo_1.InvoiceRepo,
                useClass: TypeormInvoiceRepo_1.TypeormInvoiceRepo,
            },
            {
                provide: ApplicationEventBus_1.ApplicationEventBus,
                useClass: NestEventBus_1.NestEventBus,
            },
        ],
        exports: [
            usecases_1.CreateInvoiceUseCase,
            usecases_1.IssueInvoiceUseCase,
            usecases_1.PayInvoiceUseCase,
            usecases_1.MarkAsOverdueUseCase,
            usecases_1.VoidInvoiceUseCase,
        ],
    })
], InvoiceModule);
//# sourceMappingURL=invoice.module.js.map
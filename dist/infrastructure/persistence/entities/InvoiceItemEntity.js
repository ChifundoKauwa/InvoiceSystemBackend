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
exports.InvoiceItemEntity = void 0;
const typeorm_1 = require("typeorm");
const InvoiceEntity_1 = require("./InvoiceEntity");
let InvoiceItemEntity = class InvoiceItemEntity {
    id;
    invoiceId;
    description;
    quantity;
    unitPriceAmount;
    currency;
    subtotalAmount;
    invoice;
    constructor(partial) {
        Object.assign(this, partial);
    }
};
exports.InvoiceItemEntity = InvoiceItemEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 36 }),
    __metadata("design:type", String)
], InvoiceItemEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 36 }),
    __metadata("design:type", String)
], InvoiceItemEntity.prototype, "invoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 255 }),
    __metadata("design:type", String)
], InvoiceItemEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('int'),
    __metadata("design:type", Number)
], InvoiceItemEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], InvoiceItemEntity.prototype, "unitPriceAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 3 }),
    __metadata("design:type", String)
], InvoiceItemEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint'),
    __metadata("design:type", Number)
], InvoiceItemEntity.prototype, "subtotalAmount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => InvoiceEntity_1.InvoiceEntity, (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'invoiceId' }),
    __metadata("design:type", InvoiceEntity_1.InvoiceEntity)
], InvoiceItemEntity.prototype, "invoice", void 0);
exports.InvoiceItemEntity = InvoiceItemEntity = __decorate([
    (0, typeorm_1.Entity)('invoice_items'),
    __metadata("design:paramtypes", [Object])
], InvoiceItemEntity);
//# sourceMappingURL=InvoiceItemEntity.js.map
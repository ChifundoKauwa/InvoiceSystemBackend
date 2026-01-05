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
exports.InvoiceEntity = void 0;
const typeorm_1 = require("typeorm");
const InvoiceItemEntity_1 = require("./InvoiceItemEntity");
let InvoiceEntity = class InvoiceEntity {
    id;
    status;
    currency;
    totalAmount;
    issuedAt;
    dueAt;
    items;
    createdAt;
    updatedAt;
    constructor(partial) {
        Object.assign(this, partial);
    }
};
exports.InvoiceEntity = InvoiceEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('varchar', { length: 36 }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 10 }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)('varchar', { length: 3 }),
    __metadata("design:type", String)
], InvoiceEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('bigint', { nullable: true }),
    __metadata("design:type", Object)
], InvoiceEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Object)
], InvoiceEntity.prototype, "issuedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('timestamp', { nullable: true }),
    __metadata("design:type", Object)
], InvoiceEntity.prototype, "dueAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => InvoiceItemEntity_1.InvoiceItemEntity, (item) => item.invoice, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], InvoiceEntity.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvoiceEntity.prototype, "updatedAt", void 0);
exports.InvoiceEntity = InvoiceEntity = __decorate([
    (0, typeorm_1.Entity)('invoices'),
    __metadata("design:paramtypes", [Object])
], InvoiceEntity);
//# sourceMappingURL=InvoiceEntity.js.map
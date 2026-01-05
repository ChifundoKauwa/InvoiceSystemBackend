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
exports.AccessToken = void 0;
const swagger_1 = require("@nestjs/swagger");
class AccessToken {
    token;
    tokenType;
    expiresIn;
    expiresAt;
    constructor(token, expiresIn) {
        this.token = token;
        this.tokenType = 'Bearer';
        this.expiresIn = expiresIn;
        this.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
    }
}
exports.AccessToken = AccessToken;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The JWT access token string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    }),
    __metadata("design:type", String)
], AccessToken.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token type (always Bearer for JWT)',
        example: 'Bearer',
        default: 'Bearer',
    }),
    __metadata("design:type", String)
], AccessToken.prototype, "tokenType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Token expiration time in seconds from issuance',
        example: 3600,
    }),
    __metadata("design:type", Number)
], AccessToken.prototype, "expiresIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ISO 8601 timestamp when the token expires',
        example: '2026-01-02T12:00:00.000Z',
    }),
    __metadata("design:type", String)
], AccessToken.prototype, "expiresAt", void 0);
//# sourceMappingURL=AccessToken.js.map
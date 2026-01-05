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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const users_entity_1 = require("../users/users.entity");
const login_response_dto_1 = require("./dtos/login-response.dto");
const register_response_dto_1 = require("./dtos/register-response.dto");
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.isActive) {
            return null;
        }
        const isValid = await this.usersService.validatePassword(password, user.password);
        if (!isValid) {
            return null;
        }
        return user;
    }
    async login(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
        };
        const response = new login_response_dto_1.LoginResponseDto();
        response.accessToken = await this.jwtService.signAsync(payload);
        response.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        return response;
    }
    async register(registerDto) {
        const user = await this.usersService.create(registerDto.email, registerDto.password, registerDto.role ?? users_entity_1.UserRole.USER);
        const response = new register_response_dto_1.RegisterResponseDto();
        response.id = user.id;
        response.email = user.email;
        response.role = user.role;
        response.createdAt = user.createdAt;
        return response;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
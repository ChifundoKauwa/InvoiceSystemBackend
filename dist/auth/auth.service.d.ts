import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/users.entity';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(user: User): Promise<LoginResponseDto>;
    register(registerDto: RegisterRequestDto): Promise<RegisterResponseDto>;
}

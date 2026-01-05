import { BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<LoginResponseDto | BadRequestException>;
    register(registerBody: RegisterRequestDto): Promise<RegisterResponseDto | BadRequestException>;
}

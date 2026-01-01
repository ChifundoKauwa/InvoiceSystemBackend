import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/users.entity';
import { RegisterRequestDto } from './dtos/register-request.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { RegisterResponseDto } from './dtos/register-response.dto';
import { JwtPayload } from './types/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
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

  async login(user: User): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const response = new LoginResponseDto();
    response.accessToken = await this.jwtService.signAsync(payload);
    response.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return response;
  }

  async register(registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.role ?? UserRole.USER,
    );

    const response = new RegisterResponseDto();
    response.id = user.id;
    response.email = user.email;
    response.role = user.role;
    response.createdAt = user.createdAt;

    return response;
  }
}

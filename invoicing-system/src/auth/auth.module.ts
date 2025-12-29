import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const secret = configService.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production';
                const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '24h';
                return {
                    secret,
                    signOptions: { expiresIn: expiresIn as any },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

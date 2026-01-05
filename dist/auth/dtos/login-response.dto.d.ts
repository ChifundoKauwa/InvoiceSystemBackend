import { UserRole } from '../../users/users.entity';
export declare class LoginResponseDto {
    accessToken: string;
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
}

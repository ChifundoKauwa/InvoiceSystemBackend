import { UserRole } from '../../users/users.entity';
export declare class RegisterRequestDto {
    email: string;
    password: string;
    role?: UserRole;
}

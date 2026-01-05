import { UserRole } from '../../users/users.entity';
export declare class RegisterResponseDto {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

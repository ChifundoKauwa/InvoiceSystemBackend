import { UserRole } from '../../users/users.entity';

export class RegisterResponseDto {
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

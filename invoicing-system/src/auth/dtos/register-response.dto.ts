import { UserRole } from '../../users/users.entity';

export class RegisterResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

import { UserRole } from '../../users/users.entity';

export class UserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class UsersListResponse {
    users: UserResponse[];
    total: number;
}

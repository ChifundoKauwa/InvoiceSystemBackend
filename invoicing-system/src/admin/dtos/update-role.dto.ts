import { IsEnum } from 'class-validator';
import { UserRole } from '../../users/users.entity';

export class UpdateUserRoleRequest {
    @IsEnum(UserRole, { message: 'Role must be one of: user, manager, admin' })
    role: UserRole;
}

export class UpdateUserRoleResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    message: string;
}

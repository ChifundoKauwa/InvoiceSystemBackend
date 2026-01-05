import { Repository } from 'typeorm';
import { User, UserRole } from './users.entity';
export declare class UsersService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    create(email: string, password: string, role?: UserRole): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    updateRole(userId: string, role: UserRole): Promise<User>;
    deactivate(userId: string): Promise<User>;
}

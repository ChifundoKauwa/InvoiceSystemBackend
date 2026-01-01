import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(email: string, password: string, role: UserRole = UserRole.USER): Promise<User> {
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            role,
        });

        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async updateRole(userId: string, role: UserRole): Promise<User> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.role = role;
        return this.userRepository.save(user);
    }

    async deactivate(userId: string): Promise<User> {
        const user = await this.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.isActive = false;
        return this.userRepository.save(user);
    }
}

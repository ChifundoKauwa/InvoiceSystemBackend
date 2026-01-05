export declare enum UserRole {
    ADMIN = "admin",
    MANAGER = "manager",
    USER = "user"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

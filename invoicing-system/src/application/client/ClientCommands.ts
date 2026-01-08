import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

/**
 * APPLICATION LAYER: Client Commands
 */

export class CreateClientCommand {
    constructor(
        public readonly clientId: string,
        public readonly name: string,
        public readonly email: string,
        public readonly phone?: string,
        public readonly address?: string,
        public readonly taxId?: string
    ) {
        if (!clientId || clientId.trim().length === 0) {
            throw new Error("clientId is required");
        }
        if (!name || name.trim().length === 0) {
            throw new Error("name is required");
        }
        if (!email || email.trim().length === 0) {
            throw new Error("email is required");
        }
    }
}

export class UpdateClientCommand {
    constructor(
        public readonly clientId: string,
        public readonly name: string,
        public readonly email: string,
        public readonly phone?: string,
        public readonly address?: string,
        public readonly taxId?: string
    ) {
        if (!clientId || clientId.trim().length === 0) {
            throw new Error("clientId is required");
        }
        if (!name || name.trim().length === 0) {
            throw new Error("name is required");
        }
        if (!email || email.trim().length === 0) {
            throw new Error("email is required");
        }
    }
}

export class ArchiveClientCommand {
    constructor(public readonly clientId: string) {
        if (!clientId || clientId.trim().length === 0) {
            throw new Error("clientId is required");
        }
    }
}

import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

/**
 * PRESENTATION LAYER: Client HTTP Request DTOs
 */

export class CreateClientRequestDto {
    @IsString()
    @IsOptional()
    clientId?: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    taxId?: string;
}

export class UpdateClientRequestDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    taxId?: string;
}

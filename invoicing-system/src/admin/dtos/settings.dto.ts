import { IsString, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdateSettingsRequest {
    @IsOptional()
    @IsString()
    siteName?: string;

    @IsOptional()
    @IsString()
    siteEmail?: string;

    @IsOptional()
    @IsString()
    invoicePrefix?: string;

    @IsOptional()
    @IsString()
    defaultCurrency?: string;

    @IsOptional()
    @IsNumber()
    defaultDueDays?: number;

    @IsOptional()
    @IsString()
    defaultUserRole?: string;

    @IsOptional()
    @IsBoolean()
    allowRegistration?: boolean;

    @IsOptional()
    @IsBoolean()
    requireEmailVerification?: boolean;

    @IsOptional()
    @IsBoolean()
    enableNotifications?: boolean;

    @IsOptional()
    @IsBoolean()
    enableBackups?: boolean;
}

export class SystemSettingsResponse {
    siteName: string;
    siteEmail: string;
    invoicePrefix: string;
    defaultCurrency: string;
    defaultDueDays: number;
    defaultUserRole: string;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    enableNotifications: boolean;
    enableBackups: boolean;
    message?: string;
}

import { IsString, IsNotEmpty, IsDate, ArrayNotEmpty, ValidateNested, IsOptional } from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * PRESENTATION LAYER: HTTP Request DTOs
 * 
 * Validate and document HTTP request payloads.
 * NestJS pipes use these for automatic validation.
 * Separates HTTP concerns from domain/application.
 */

export class CreateInvoiceItemDto {
    @IsString()
    @IsOptional()
    id?: string;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsNotEmpty()
    quantity!: number;

    @IsNotEmpty()
    unitPriceAmount!: number;
}

export class CreateInvoiceRequestDto {
    // invoiceNumber is NOT sent by frontend - backend generates it
    
    @IsString()
    @IsNotEmpty({ message: 'Client is required' })
    clientId!: string;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items!: CreateInvoiceItemDto[];
}

export class IssueInvoiceRequestDto {
    @IsDate()
    @Type(() => Date)
    issueAt: Date;
}

export class PayInvoiceRequestDto {}

export class MarkAsOverdueRequestDto {}

export class VoidInvoiceRequestDto {}

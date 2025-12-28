/**
 * APPLICATION LAYER: DTOs for Responses
 * 
 * Response models for use cases.
 * Safe to expose to API consumers.
 */

export class InvoiceItemDto {
    constructor(
        public readonly id: string,
        public readonly description: string,
        public readonly quantity: number,
        public readonly unitPriceAmount: number,
        public readonly subtotalAmount: number,
        public readonly currency: string
    ) {}
}

export class InvoiceDto {
    constructor(
        public readonly id: string,
        public readonly status: string,
        public readonly currency: string,
        public readonly totalAmount: number,
        public readonly items: InvoiceItemDto[],
        public readonly issuedAt?: Date,
        public readonly dueAt?: Date
    ) {}
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export class AdminInvoiceResponse {
    id: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    currency: string;
    status: string;
    issuedAt?: Date;
    dueAt?: Date;
    items: InvoiceItem[];
    totalAmount: number;
}

export class AdminInvoicesListResponse {
    invoices: AdminInvoiceResponse[];
    total: number;
}

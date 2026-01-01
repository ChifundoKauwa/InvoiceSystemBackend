
 // APPLICATION LAYER: DTOs for Invoice Commands


export class IssueInvoiceCommand {
    constructor(
        public readonly invoiceId: string,
        public readonly issueAt: Date = new Date()
    ) {
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
        if (!issueAt || !(issueAt instanceof Date)) {
            throw new Error("issueAt must be a valid Date");
        }
    }
}

export class PayInvoiceCommand {
    constructor(public readonly invoiceId: string) {
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}

export class MarkAsOverdueCommand {
    constructor(public readonly invoiceId: string) {
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}

export class VoidInvoiceCommand {
    constructor(public readonly invoiceId: string) {
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
    }
}

export class CreateInvoiceCommand {
    constructor(
        public readonly invoiceId: string,
        public readonly currency: string,
        public readonly items: Array<{
            id: string;
            description: string;
            quantity: number;
            unitPriceAmount: number;
        }>
    ) {
        if (!invoiceId || invoiceId.trim().length === 0) {
            throw new Error("invoiceId is required");
        }
        if (!currency || currency.trim().length === 0) {
            throw new Error("currency is required");
        }
        if (!items || items.length === 0) {
            throw new Error("items cannot be empty");
        }
    }
}

/**
 * DOMAIN LAYER: Invoice Status Enum
 * 
 * Represents the lifecycle states of an invoice.
 * Each state transition is guarded by domain invariants.
 */
export enum InvoiceStatus {
    draft = 'DRAFT',
    issued = 'ISSUED',
    overdue = 'OVERDUE',
    paid = 'PAID',
    void = 'VOIDED'
}
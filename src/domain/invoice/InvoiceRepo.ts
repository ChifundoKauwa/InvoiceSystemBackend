import { Invoice } from "./Invoice";

/**
 * DOMAIN LAYER: Repository Interface
 * 
 * This interface defines the contract for invoice persistence.
 * The domain layer NEVER knows about TypeORM, databases, or implementation details.
 * It only depends on this contract.
 * 
 * Implementation lives in infrastructure layer (adapters).
 * This is the dependency inversion principle in action.
 */
export abstract class InvoiceRepo {
    abstract getById(id: string): Promise<Invoice>;
    abstract save(invoice: Invoice): Promise<void>;
}
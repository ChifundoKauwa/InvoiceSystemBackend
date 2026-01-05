import { CreateInvoiceUseCase, IssueInvoiceUseCase, PayInvoiceUseCase, MarkAsOverdueUseCase, VoidInvoiceUseCase } from '../../../application/usecases';
import { InvoiceDto } from '../../../application/dtos/Responses';
import { CreateInvoiceRequestDto, IssueInvoiceRequestDto } from '../dtos/RequestDtos';
export declare class InvoiceController {
    private readonly createInvoiceUseCase;
    private readonly issueInvoiceUseCase;
    private readonly payInvoiceUseCase;
    private readonly markAsOverdueUseCase;
    private readonly voidInvoiceUseCase;
    constructor(createInvoiceUseCase: CreateInvoiceUseCase, issueInvoiceUseCase: IssueInvoiceUseCase, payInvoiceUseCase: PayInvoiceUseCase, markAsOverdueUseCase: MarkAsOverdueUseCase, voidInvoiceUseCase: VoidInvoiceUseCase);
    createInvoice(dto: CreateInvoiceRequestDto): Promise<InvoiceDto>;
    issueInvoice(invoiceId: string, dto?: IssueInvoiceRequestDto): Promise<InvoiceDto>;
    payInvoice(invoiceId: string): Promise<InvoiceDto>;
    markAsOverdue(invoiceId: string): Promise<InvoiceDto>;
    voidInvoice(invoiceId: string): Promise<InvoiceDto>;
}

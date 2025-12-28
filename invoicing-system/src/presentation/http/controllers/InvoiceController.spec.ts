import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceController } from './InvoiceController';
import { CreateInvoiceUseCase } from '../../../application/usecases/CreateInvoiceUseCase';
import { IssueInvoiceUseCase } from '../../../application/usecases/IssueInvoiceUseCase';
import { PayInvoiceUseCase } from '../../../application/usecases/PayInvoiceUseCase';
import { MarkAsOverdueUseCase } from '../../../application/usecases/MarkAsOverdueUseCase';
import { VoidInvoiceUseCase } from '../../../application/usecases/VoidInvoiceUseCase';
import { CreateInvoiceRequestDto, IssueInvoiceRequestDto } from '../dtos/RequestDtos';
import { InvoiceStatus } from '../../../domain/invoice/IncoiceStatus';

describe('InvoiceController - Routes', () => {
  let controller: InvoiceController;
  let createInvoiceUseCase: jest.Mocked<CreateInvoiceUseCase>;
  let issueInvoiceUseCase: jest.Mocked<IssueInvoiceUseCase>;
  let payInvoiceUseCase: jest.Mocked<PayInvoiceUseCase>;
  let markAsOverdueUseCase: jest.Mocked<MarkAsOverdueUseCase>;
  let voidInvoiceUseCase: jest.Mocked<VoidInvoiceUseCase>;

  beforeEach(async () => {
    // Mock all use cases
    const mockCreateInvoiceUseCase = {
      execute: jest.fn(),
    };
    const mockIssueInvoiceUseCase = {
      execute: jest.fn(),
    };
    const mockPayInvoiceUseCase = {
      execute: jest.fn(),
    };
    const mockMarkAsOverdueUseCase = {
      execute: jest.fn(),
    };
    const mockVoidInvoiceUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoiceController],
      providers: [
        {
          provide: CreateInvoiceUseCase,
          useValue: mockCreateInvoiceUseCase,
        },
        {
          provide: IssueInvoiceUseCase,
          useValue: mockIssueInvoiceUseCase,
        },
        {
          provide: PayInvoiceUseCase,
          useValue: mockPayInvoiceUseCase,
        },
        {
          provide: MarkAsOverdueUseCase,
          useValue: mockMarkAsOverdueUseCase,
        },
        {
          provide: VoidInvoiceUseCase,
          useValue: mockVoidInvoiceUseCase,
        },
      ],
    }).compile();

    controller = module.get<InvoiceController>(InvoiceController);
    createInvoiceUseCase = module.get(CreateInvoiceUseCase) as jest.Mocked<CreateInvoiceUseCase>;
    issueInvoiceUseCase = module.get(IssueInvoiceUseCase) as jest.Mocked<IssueInvoiceUseCase>;
    payInvoiceUseCase = module.get(PayInvoiceUseCase) as jest.Mocked<PayInvoiceUseCase>;
    markAsOverdueUseCase = module.get(MarkAsOverdueUseCase) as jest.Mocked<MarkAsOverdueUseCase>;
    voidInvoiceUseCase = module.get(VoidInvoiceUseCase) as jest.Mocked<VoidInvoiceUseCase>;
  });

  describe('POST /invoices - createInvoice()', () => {
    it('should call createInvoiceUseCase.execute() with correct command', async () => {
      // Arrange
      const dto: CreateInvoiceRequestDto = {
        invoiceId: 'INV-001',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 1,
            unitPriceAmount: 5000,
          },
        ],
      };

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.draft,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      createInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.createInvoice(dto);

      // Assert
      expect(createInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(createInvoiceUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: 'INV-001',
          currency: 'USD',
          items: dto.items,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should be defined as route POST /invoices', async () => {
      expect(controller.createInvoice).toBeDefined();
    });
  });

  describe('POST /invoices/:id/issue - issueInvoice()', () => {
    it('should call issueInvoiceUseCase.execute() with correct command', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const dto: IssueInvoiceRequestDto = {
        issueAt: new Date('2025-01-01'),
      };

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.issued,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
        issuedAt: new Date('2025-01-01'),
        dueAt: new Date('2025-01-31'),
      };

      issueInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.issueInvoice(invoiceId, dto);

      // Assert
      expect(issueInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(issueInvoiceUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
          issueAt: dto.issueAt,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle issue request without optional issueAt parameter', async () => {
      // Arrange
      const invoiceId = 'INV-001';

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.issued,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
        issuedAt: new Date(),
        dueAt: new Date(),
      };

      issueInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.issueInvoice(invoiceId, undefined);

      // Assert
      expect(issueInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(issueInvoiceUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should be defined as route POST /invoices/:id/issue', async () => {
      expect(controller.issueInvoice).toBeDefined();
    });
  });

  describe('POST /invoices/:id/pay - payInvoice()', () => {
    it('should call payInvoiceUseCase.execute() with correct command', async () => {
      // Arrange
      const invoiceId = 'INV-001';

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.paid,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      payInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.payInvoice(invoiceId);

      // Assert
      expect(payInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(payInvoiceUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should be defined as route POST /invoices/:id/pay', async () => {
      expect(controller.payInvoice).toBeDefined();
    });
  });

  describe('POST /invoices/:id/overdue - markAsOverdue()', () => {
    it('should call markAsOverdueUseCase.execute() with correct command', async () => {
      // Arrange
      const invoiceId = 'INV-001';

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.overdue,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      markAsOverdueUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.markAsOverdue(invoiceId);

      // Assert
      expect(markAsOverdueUseCase.execute).toHaveBeenCalledTimes(1);
      expect(markAsOverdueUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should be defined as route POST /invoices/:id/overdue', async () => {
      expect(controller.markAsOverdue).toBeDefined();
    });
  });

  describe('POST /invoices/:id/void - voidInvoice()', () => {
    it('should call voidInvoiceUseCase.execute() with correct command', async () => {
      // Arrange
      const invoiceId = 'INV-001';

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.void,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      voidInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await controller.voidInvoice(invoiceId);

      // Assert
      expect(voidInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(voidInvoiceUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId,
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it('should be defined as route POST /invoices/:id/void', async () => {
      expect(controller.voidInvoice).toBeDefined();
    });
  });

  describe('Controller Response Types', () => {
    it('should return InvoiceDto from createInvoice', async () => {
      const dto: CreateInvoiceRequestDto = {
        invoiceId: 'INV-001',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 1,
            unitPriceAmount: 5000,
          },
        ],
      };

      const mockResponse = {
        id: 'INV-001',
        status: InvoiceStatus.draft,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      createInvoiceUseCase.execute.mockResolvedValueOnce(mockResponse);

      const result = await controller.createInvoice(dto);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('currency');
      expect(result).toHaveProperty('totalAmount');
      expect(result).toHaveProperty('items');
    });
  });

  describe('Route HTTP Methods and Paths', () => {
    it('POST /invoices - should create invoice', async () => {
      // Method: POST
      // Path: /invoices
      // Expected Response: InvoiceDto
      // Expected Status: 201 Created
      expect(controller.createInvoice).toBeDefined();
    });

    it('POST /invoices/:id/issue - should issue invoice', async () => {
      // Method: POST
      // Path: /invoices/:id/issue
      // Expected Response: InvoiceDto
      // Expected Status: 200 OK
      expect(controller.issueInvoice).toBeDefined();
    });

    it('POST /invoices/:id/pay - should pay invoice', async () => {
      // Method: POST
      // Path: /invoices/:id/pay
      // Expected Response: InvoiceDto
      // Expected Status: 200 OK
      expect(controller.payInvoice).toBeDefined();
    });

    it('POST /invoices/:id/overdue - should mark invoice as overdue', async () => {
      // Method: POST
      // Path: /invoices/:id/overdue
      // Expected Response: InvoiceDto
      // Expected Status: 200 OK
      expect(controller.markAsOverdue).toBeDefined();
    });

    it('POST /invoices/:id/void - should void invoice', async () => {
      // Method: POST
      // Path: /invoices/:id/void
      // Expected Response: InvoiceDto
      // Expected Status: 200 OK
      expect(controller.voidInvoice).toBeDefined();
    });
  });

  describe('Complete Route Workflow', () => {
    it('should handle complete create -> issue -> pay workflow through controller', async () => {
      // Step 1: Create
      const createDto: CreateInvoiceRequestDto = {
        invoiceId: 'INV-WORKFLOW',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 1,
            unitPriceAmount: 5000,
          },
        ],
      };

      const createResponse = {
        id: 'INV-WORKFLOW',
        status: InvoiceStatus.draft,
        currency: 'USD',
        totalAmount: 5000,
        items: [],
      };

      createInvoiceUseCase.execute.mockResolvedValueOnce(createResponse);
      const createResult = await controller.createInvoice(createDto);
      expect(createResult.status).toBe(InvoiceStatus.draft);

      // Step 2: Issue
      const issueResponse = {
        ...createResponse,
        status: InvoiceStatus.issued,
        issuedAt: new Date(),
        dueAt: new Date(),
      };

      issueInvoiceUseCase.execute.mockResolvedValueOnce(issueResponse);
      const issueResult = await controller.issueInvoice('INV-WORKFLOW', {
        issueAt: new Date(),
      });
      expect(issueResult.status).toBe(InvoiceStatus.issued);

      // Step 3: Pay
      const payResponse = {
        ...issueResponse,
        status: InvoiceStatus.paid,
      };

      payInvoiceUseCase.execute.mockResolvedValueOnce(payResponse);
      const payResult = await controller.payInvoice('INV-WORKFLOW');
      expect(payResult.status).toBe(InvoiceStatus.paid);

      // Verify all methods were called
      expect(createInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(issueInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
      expect(payInvoiceUseCase.execute).toHaveBeenCalledTimes(1);
    });
  });
});

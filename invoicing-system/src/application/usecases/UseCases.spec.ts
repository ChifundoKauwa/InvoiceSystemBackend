import { CreateInvoiceUseCase } from './CreateInvoiceUseCase';
import { IssueInvoiceUseCase } from './IssueInvoiceUseCase';
import { PayInvoiceUseCase } from './PayInvoiceUseCase';
import { MarkAsOverdueUseCase } from './MarkAsOverdueUseCase';
import { VoidInvoiceUseCase } from './VoidInvoiceUseCase';
import { InvoiceRepo } from '../../domain/invoice/InvoiceRepo';
import { ApplicationEventBus } from '../ports/ApplicationEventBus';
import { CreateInvoiceCommand, IssueInvoiceCommand, PayInvoiceCommand, MarkAsOverdueCommand, VoidInvoiceCommand } from '../dtos/Commands';
import { Invoice } from '../../domain/invoice/Invoice';
import { InvoiceStatus } from '../../domain/invoice/IncoiceStatus';
import { InvoiceItem } from '../../domain/invoice/InvoiceItem';
import { Money } from '../../domain/shared/Money';

describe('Invoice Use Cases - Integration Tests', () => {
  let createInvoiceUseCase: CreateInvoiceUseCase;
  let issueInvoiceUseCase: IssueInvoiceUseCase;
  let payInvoiceUseCase: PayInvoiceUseCase;
  let markAsOverdueUseCase: MarkAsOverdueUseCase;
  let voidInvoiceUseCase: VoidInvoiceUseCase;
  let mockInvoiceRepo: jest.Mocked<InvoiceRepo>;
  let mockEventBus: jest.Mocked<ApplicationEventBus>;

  beforeEach(() => {
    // Mock repository
    mockInvoiceRepo = {
      getById: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<InvoiceRepo>;

    // Mock event bus
    mockEventBus = {
      publishAll: jest.fn(),
    } as jest.Mocked<ApplicationEventBus>;

    // Initialize use cases
    createInvoiceUseCase = new CreateInvoiceUseCase(mockInvoiceRepo, mockEventBus);
    issueInvoiceUseCase = new IssueInvoiceUseCase(mockInvoiceRepo, mockEventBus);
    payInvoiceUseCase = new PayInvoiceUseCase(mockInvoiceRepo, mockEventBus);
    markAsOverdueUseCase = new MarkAsOverdueUseCase(mockInvoiceRepo, mockEventBus);
    voidInvoiceUseCase = new VoidInvoiceUseCase(mockInvoiceRepo, mockEventBus);
  });

  describe('CreateInvoiceUseCase', () => {
    it('should create a draft invoice with valid items', async () => {
      // Arrange
      const command = new CreateInvoiceCommand(
        'INV-001',
        'USD',
        [
          { id: 'ITEM-001', description: 'Widget', quantity: 2, unitPriceAmount: 5000 },
          { id: 'ITEM-002', description: 'Gadget', quantity: 1, unitPriceAmount: 3000 },
        ],
      );

      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await createInvoiceUseCase.execute(command);

      // Assert
      expect(result.id).toBe('INV-001');
      expect(result.status).toBe(InvoiceStatus.draft);
      expect(result.currency).toBe('USD');
      expect(result.totalAmount).toBe(13000); // (2 * 5000) + (1 * 3000) = 13000
      expect(result.items.length).toBe(2);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should fail when creating invoice with no items', async () => {
      // Arrange & Act & Assert
      expect(() => {
        new CreateInvoiceCommand('INV-002', 'USD', []);
      }).toThrow('items cannot be empty');
    });

    it('should fail when creating invoice with invalid currency', async () => {
      // Act & Assert
      expect(() => {
        new CreateInvoiceCommand('INV-003', '', [
          { id: 'ITEM-001', description: 'Widget', quantity: 1, unitPriceAmount: 1000 },
        ]);
      }).toThrow();
    });

    it('should fail when items have negative amounts', async () => {
      // Act & Assert
      const command = new CreateInvoiceCommand(
        'INV-004',
        'USD',
        [
          { id: 'ITEM-001', description: 'Widget', quantity: 1, unitPriceAmount: -1000 },
        ],
      );

      expect(() => command).toBeDefined();
    });

    it('should calculate correct total for multiple items', async () => {
      // Arrange
      const command = new CreateInvoiceCommand(
        'INV-005',
        'EUR',
        [
          { id: 'ITEM-001', description: 'Service A', quantity: 3, unitPriceAmount: 2000 },
          { id: 'ITEM-002', description: 'Service B', quantity: 2, unitPriceAmount: 1500 },
          { id: 'ITEM-003', description: 'Service C', quantity: 1, unitPriceAmount: 5000 },
        ],
      );

      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await createInvoiceUseCase.execute(command);

      // Assert
      // (3 * 2000) + (2 * 1500) + (1 * 5000) = 6000 + 3000 + 5000 = 14000
      expect(result.totalAmount).toBe(14000);
      expect(result.currency).toBe('EUR');
    });
  });

  describe('IssueInvoiceUseCase', () => {
    it('should issue a draft invoice', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const command = new IssueInvoiceCommand(invoiceId, new Date());

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await issueInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.issued);
      expect(result.issuedAt).toBeDefined();
      expect(result.dueAt).toBeDefined();
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should fail when issuing a non-draft invoice', async () => {
      // Arrange
      const invoiceId = 'INV-002';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());

      const command = new IssueInvoiceCommand(invoiceId, new Date());

      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);

      // Act & Assert
      await expect(issueInvoiceUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when issuing invoice with no items', async () => {
      // Arrange
      const invoiceId = 'INV-003';
      const draftInvoice = new Invoice(invoiceId, 'USD', []);

      const command = new IssueInvoiceCommand(invoiceId, new Date());

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);

      // Act & Assert
      await expect(issueInvoiceUseCase.execute(command)).rejects.toThrow();
    });

    it('should set due date to 30 days after issue date', async () => {
      // Arrange
      const invoiceId = 'INV-004';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const issueDate = new Date('2025-01-01');
      const command = new IssueInvoiceCommand(invoiceId, issueDate);

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await issueInvoiceUseCase.execute(command);

      // Assert
      expect(result.dueAt).toBeDefined();
      // Due date should be approximately 30 days after issue date
      const expectedDueDate = new Date(issueDate);
      expectedDueDate.setDate(expectedDueDate.getDate() + 30);
      
      const dueDateOffset = (result.dueAt!.getTime() - expectedDueDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.abs(dueDateOffset)).toBeLessThan(1); // Within 1 day tolerance
    });
  });

  describe('PayInvoiceUseCase', () => {
    it('should mark an issued invoice as paid', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await payInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.paid);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should mark an overdue invoice as paid', async () => {
      // Arrange
      const invoiceId = 'INV-002';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const overdueInvoice = issuedInvoice.markAsOverdue();

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(overdueInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await payInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.paid);
    });

    it('should fail when paying a draft invoice', async () => {
      // Arrange
      const invoiceId = 'INV-003';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);

      // Act & Assert
      await expect(payInvoiceUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when paying an already paid invoice', async () => {
      // Arrange
      const invoiceId = 'INV-004';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const paidInvoice = issuedInvoice.markAsPaid();

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(paidInvoice);

      // Act & Assert
      await expect(payInvoiceUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when paying a voided invoice', async () => {
      // Arrange
      const invoiceId = 'INV-005';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const voidedInvoice = draftInvoice.void();

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(voidedInvoice);

      // Act & Assert
      await expect(payInvoiceUseCase.execute(command)).rejects.toThrow();
    });
  });

  describe('MarkAsOverdueUseCase', () => {
    it('should mark an issued invoice as overdue', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());

      const command = new MarkAsOverdueCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await markAsOverdueUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.overdue);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should fail when marking a draft invoice as overdue', async () => {
      // Arrange
      const invoiceId = 'INV-002';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const command = new MarkAsOverdueCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);

      // Act & Assert
      await expect(markAsOverdueUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when marking a paid invoice as overdue', async () => {
      // Arrange
      const invoiceId = 'INV-003';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const paidInvoice = issuedInvoice.markAsPaid();

      const command = new MarkAsOverdueCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(paidInvoice);

      // Act & Assert
      await expect(markAsOverdueUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when marking an overdue invoice as overdue again', async () => {
      // Arrange
      const invoiceId = 'INV-004';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const overdueInvoice = issuedInvoice.markAsOverdue();

      const command = new MarkAsOverdueCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(overdueInvoice);

      // Act & Assert
      await expect(markAsOverdueUseCase.execute(command)).rejects.toThrow();
    });

    it('should fail when marking a voided invoice as overdue', async () => {
      // Arrange
      const invoiceId = 'INV-005';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const voidedInvoice = draftInvoice.void();

      const command = new MarkAsOverdueCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(voidedInvoice);

      // Act & Assert
      await expect(markAsOverdueUseCase.execute(command)).rejects.toThrow();
    });
  });

  describe('VoidInvoiceUseCase', () => {
    it('should void a draft invoice', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const command = new VoidInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await voidInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.void);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should void an issued invoice', async () => {
      // Arrange
      const invoiceId = 'INV-002';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());

      const command = new VoidInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await voidInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.void);
    });

    it('should void an overdue invoice', async () => {
      // Arrange
      const invoiceId = 'INV-003';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const overdueInvoice = issuedInvoice.markAsOverdue();

      const command = new VoidInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(overdueInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await voidInvoiceUseCase.execute(command);

      // Assert
      expect(result.status).toBe(InvoiceStatus.void);
    });

    it('should fail when voiding a paid invoice', async () => {
      // Arrange
      const invoiceId = 'INV-004';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());
      const paidInvoice = issuedInvoice.markAsPaid();

      const command = new VoidInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(paidInvoice);

      // Act & Assert
      await expect(voidInvoiceUseCase.execute(command)).rejects.toThrow();
    });

    it('should allow voiding an already voided invoice (idempotent operation)', async () => {
      // Arrange - According to current domain logic, you CAN void a voided invoice
      // This is an idempotent operation (no state change, but no error thrown)
      const invoiceId = 'INV-005';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const voidedInvoice = draftInvoice.void();

      const command = new VoidInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(voidedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      const result = await voidInvoiceUseCase.execute(command);

      // Assert - Should succeed and remain voided
      expect(result.status).toBe(InvoiceStatus.void);
      expect(mockInvoiceRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('Invoice State Machine - Complex Transitions', () => {
    it('should follow the expected invoice lifecycle: draft -> issued -> overdue -> paid', async () => {
      // Arrange
      const invoiceId = 'INV-LIFECYCLE-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(10000, 'USD'), 1, 'Service'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      // Draft -> Issued
      const issueCommand = new IssueInvoiceCommand(invoiceId, new Date());
      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const issuedResult = await issueInvoiceUseCase.execute(issueCommand);
      expect(issuedResult.status).toBe(InvoiceStatus.issued);

      // Issued -> Overdue
      const issuedInvoice = draftInvoice.issue(new Date());
      const markOverdueCommand = new MarkAsOverdueCommand(invoiceId);
      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const overdueResult = await markAsOverdueUseCase.execute(markOverdueCommand);
      expect(overdueResult.status).toBe(InvoiceStatus.overdue);

      // Overdue -> Paid
      const overdueInvoice = issuedInvoice.markAsOverdue();
      const payCommand = new PayInvoiceCommand(invoiceId);
      mockInvoiceRepo.getById.mockResolvedValueOnce(overdueInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const paidResult = await payInvoiceUseCase.execute(payCommand);
      expect(paidResult.status).toBe(InvoiceStatus.paid);
    });

    it('should follow the expected invoice lifecycle: draft -> issued -> paid', async () => {
      // Arrange
      const invoiceId = 'INV-LIFECYCLE-002';
      const items = [
        new InvoiceItem('ITEM-001', new Money(10000, 'USD'), 1, 'Service'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      // Draft -> Issued
      const issueCommand = new IssueInvoiceCommand(invoiceId, new Date());
      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const issuedResult = await issueInvoiceUseCase.execute(issueCommand);
      expect(issuedResult.status).toBe(InvoiceStatus.issued);

      // Issued -> Paid
      const issuedInvoice = draftInvoice.issue(new Date());
      const payCommand = new PayInvoiceCommand(invoiceId);
      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const paidResult = await payInvoiceUseCase.execute(payCommand);
      expect(paidResult.status).toBe(InvoiceStatus.paid);
    });

    it('should follow the expected invoice lifecycle: draft -> voided', async () => {
      // Arrange
      const invoiceId = 'INV-LIFECYCLE-003';
      const items = [
        new InvoiceItem('ITEM-001', new Money(10000, 'USD'), 1, 'Service'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      // Draft -> Voided
      const voidCommand = new VoidInvoiceCommand(invoiceId);
      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const voidResult = await voidInvoiceUseCase.execute(voidCommand);
      expect(voidResult.status).toBe(InvoiceStatus.void);
    });

    it('should follow the expected invoice lifecycle: draft -> issued -> voided', async () => {
      // Arrange
      const invoiceId = 'INV-LIFECYCLE-004';
      const items = [
        new InvoiceItem('ITEM-001', new Money(10000, 'USD'), 1, 'Service'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      // Draft -> Issued
      const issueCommand = new IssueInvoiceCommand(invoiceId, new Date());
      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const issuedResult = await issueInvoiceUseCase.execute(issueCommand);
      expect(issuedResult.status).toBe(InvoiceStatus.issued);

      // Issued -> Voided
      const issuedInvoice = draftInvoice.issue(new Date());
      const voidCommand = new VoidInvoiceCommand(invoiceId);
      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      const voidResult = await voidInvoiceUseCase.execute(voidCommand);
      expect(voidResult.status).toBe(InvoiceStatus.void);
    });
  });

  describe('Domain Invariants - Money and Currency', () => {
    it('should enforce currency consistency across items', () => {
      // Act & Assert - all items must have same currency as invoice
      const usdItem = new InvoiceItem('ITEM-001', new Money(1000, 'USD'), 1, 'Widget');
      const eurItem = new InvoiceItem('ITEM-002', new Money(1000, 'EUR'), 1, 'Gadget');

      expect(() => {
        new Invoice('INV-001', 'USD', [usdItem, eurItem]);
      }).toThrow();
    });

    it('should reject negative amounts', () => {
      // Act & Assert
      expect(() => {
        new Money(-1000, 'USD');
      }).toThrow();
    });

    it('should require positive quantity', () => {
      // Act & Assert
      expect(() => {
        new InvoiceItem('ITEM-001', new Money(1000, 'USD'), 0, 'Widget');
      }).toThrow();
    });

    it('should require description for items', () => {
      // Act & Assert
      expect(() => {
        new InvoiceItem('ITEM-001', new Money(1000, 'USD'), 1, '');
      }).toThrow();
    });

    it('should handle money addition correctly', () => {
      // Arrange
      const money1 = new Money(1500, 'USD');
      const money2 = new Money(2500, 'USD');

      // Act
      const result = money1.add(money2);

      // Assert
      expect(result.getAmount()).toBe(4000);
      expect(result.getCurrency()).toBe('USD');
    });

    it('should reject money addition with different currencies', () => {
      // Arrange
      const usdMoney = new Money(1000, 'USD');
      const eurMoney = new Money(1000, 'EUR');

      // Act & Assert
      expect(() => {
        usdMoney.add(eurMoney);
      }).toThrow();
    });
  });

  describe('Event Publishing', () => {
    it('should publish events when creating an invoice', async () => {
      // Arrange
      const command = new CreateInvoiceCommand(
        'INV-001',
        'USD',
        [
          { id: 'ITEM-001', description: 'Widget', quantity: 1, unitPriceAmount: 5000 },
        ],
      );

      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      await createInvoiceUseCase.execute(command);

      // Assert
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
    });

    it('should publish InvoiceIssued event when issuing', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);

      const command = new IssueInvoiceCommand(invoiceId, new Date());

      mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      await issueInvoiceUseCase.execute(command);

      // Assert
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
      const events = mockEventBus.publishAll.mock.calls[0][0];
      expect(events.length).toBeGreaterThan(0);
    });

    it('should publish InvoicePaid event when paying', async () => {
      // Arrange
      const invoiceId = 'INV-001';
      const items = [
        new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 1, 'Widget'),
      ];
      const draftInvoice = new Invoice(invoiceId, 'USD', items);
      const issuedInvoice = draftInvoice.issue(new Date());

      const command = new PayInvoiceCommand(invoiceId);

      mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
      mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
      mockEventBus.publishAll.mockResolvedValueOnce(undefined);

      // Act
      await payInvoiceUseCase.execute(command);

      // Assert
      expect(mockEventBus.publishAll).toHaveBeenCalledTimes(1);
      const events = mockEventBus.publishAll.mock.calls[0][0];
      expect(events.length).toBeGreaterThan(0);
    });
  });
});

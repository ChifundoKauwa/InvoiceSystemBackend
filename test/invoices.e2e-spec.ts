import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from '../infrastructure/typeorm.config';
import { InvoiceEntity, InvoiceItemEntity } from '../infrastructure/persistence/entities';
import { InvoiceStatus } from '../domain/invoice/IncoiceStatus';

/**
 * E2E Tests for Invoice Controller Routes
 * 
 * Tests all HTTP endpoints to ensure:
 * - Routes are properly mapped
 * - Request/response handling works
 * - Status codes are correct
 * - Business logic is accessible via HTTP
 */
describe('InvoiceController Routes (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Create test module with in-memory database
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /invoices - Create Invoice', () => {
    it('should create a new invoice with status 201', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-001',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Consulting Services',
            quantity: 5,
            unitPriceAmount: 10000,
          },
          {
            id: 'ITEM-002',
            description: 'Software License',
            quantity: 2,
            unitPriceAmount: 5000,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload)
        .expect(201);

      expect(response.body).toHaveProperty('id', 'INV-E2E-001');
      expect(response.body).toHaveProperty('status', InvoiceStatus.draft);
      expect(response.body).toHaveProperty('currency', 'USD');
      expect(response.body).toHaveProperty('totalAmount', 60000); // (5*10000) + (2*5000)
      expect(response.body.items).toHaveLength(2);
    });

    it('should return 400 when invoice ID is missing', async () => {
      const invalidPayload = {
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 1,
            unitPriceAmount: 1000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 when currency is missing', async () => {
      const invalidPayload = {
        invoiceId: 'INV-TEST',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 1,
            unitPriceAmount: 1000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 when items array is empty', async () => {
      const invalidPayload = {
        invoiceId: 'INV-TEST',
        currency: 'USD',
        items: [],
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(invalidPayload)
        .expect(400);
    });

    it('should return 400 when item description is missing', async () => {
      const invalidPayload = {
        invoiceId: 'INV-TEST',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            quantity: 1,
            unitPriceAmount: 1000,
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(invalidPayload)
        .expect(400);
    });

    it('should calculate total correctly for multiple items', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-CALC',
        currency: 'EUR',
        items: [
          { id: 'I1', description: 'Item 1', quantity: 3, unitPriceAmount: 2000 },
          { id: 'I2', description: 'Item 2', quantity: 2, unitPriceAmount: 1500 },
          { id: 'I3', description: 'Item 3', quantity: 1, unitPriceAmount: 5000 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload)
        .expect(201);

      // (3*2000) + (2*1500) + (1*5000) = 6000 + 3000 + 5000 = 14000
      expect(response.body.totalAmount).toBe(14000);
    });
  });

  describe('POST /invoices/:id/issue - Issue Invoice', () => {
    let invoiceId: string;

    beforeAll(async () => {
      // Create an invoice first
      const createPayload = {
        invoiceId: 'INV-E2E-ISSUE',
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

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      invoiceId = response.body.id;
    });

    it('should issue a draft invoice with status 200', async () => {
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('id', invoiceId);
      expect(response.body).toHaveProperty('status', InvoiceStatus.issued);
      expect(response.body).toHaveProperty('issuedAt');
      expect(response.body).toHaveProperty('dueAt');
    });

    it('should calculate due date 30 days after issue', async () => {
      // Create another invoice to test due date
      const createPayload = {
        invoiceId: 'INV-E2E-DUE-DATE',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      const issueDate = new Date('2025-01-01');
      const issuePayload = { issueAt: issueDate };

      const issueResponse = await request(app.getHttpServer())
        .post(`/invoices/${createResponse.body.id}/issue`)
        .send(issuePayload)
        .expect(200);

      const dueDate = new Date(issueResponse.body.dueAt);
      const expectedDueDate = new Date(issueDate);
      expectedDueDate.setDate(expectedDueDate.getDate() + 30);

      const daysDifference =
        (dueDate.getTime() - expectedDueDate.getTime()) / (1000 * 60 * 60 * 24);
      expect(Math.abs(daysDifference)).toBeLessThan(1);
    });

    it('should return 500 when trying to issue already issued invoice', async () => {
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({})
        .expect(500);
    });

    it('should return 500 when invoice not found', async () => {
      await request(app.getHttpServer())
        .post('/invoices/NONEXISTENT/issue')
        .send({})
        .expect(500);
    });
  });

  describe('POST /invoices/:id/pay - Pay Invoice', () => {
    let invoiceId: string;

    beforeAll(async () => {
      // Create and issue an invoice
      const createPayload = {
        invoiceId: 'INV-E2E-PAY',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      invoiceId = createResponse.body.id;

      // Issue it
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});
    });

    it('should mark issued invoice as paid with status 200', async () => {
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/pay`)
        .expect(200);

      expect(response.body).toHaveProperty('id', invoiceId);
      expect(response.body).toHaveProperty('status', InvoiceStatus.paid);
    });

    it('should return 500 when trying to pay already paid invoice', async () => {
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/pay`)
        .expect(500);
    });

    it('should return 500 when trying to pay draft invoice', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-PAY-DRAFT',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      await request(app.getHttpServer())
        .post(`/invoices/${createResponse.body.id}/pay`)
        .expect(500);
    });
  });

  describe('POST /invoices/:id/overdue - Mark As Overdue', () => {
    let invoiceId: string;

    beforeAll(async () => {
      // Create and issue an invoice
      const createPayload = {
        invoiceId: 'INV-E2E-OVERDUE',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      invoiceId = createResponse.body.id;

      // Issue it
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});
    });

    it('should mark issued invoice as overdue with status 200', async () => {
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/overdue`)
        .expect(200);

      expect(response.body).toHaveProperty('id', invoiceId);
      expect(response.body).toHaveProperty('status', InvoiceStatus.overdue);
    });

    it('should return 500 when trying to mark draft invoice as overdue', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-OVERDUE-DRAFT',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      await request(app.getHttpServer())
        .post(`/invoices/${createResponse.body.id}/overdue`)
        .expect(500);
    });

    it('should return 500 when trying to mark already overdue invoice as overdue', async () => {
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/overdue`)
        .expect(500);
    });

    it('should be able to pay overdue invoice', async () => {
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/pay`)
        .expect(200);

      expect(response.body).toHaveProperty('status', InvoiceStatus.paid);
    });
  });

  describe('POST /invoices/:id/void - Void Invoice', () => {
    it('should void a draft invoice with status 200', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-VOID-DRAFT',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      const response = await request(app.getHttpServer())
        .post(`/invoices/${createResponse.body.id}/void`)
        .expect(200);

      expect(response.body).toHaveProperty('status', InvoiceStatus.void);
    });

    it('should void an issued invoice with status 200', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-VOID-ISSUED',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      const invoiceId = createResponse.body.id;

      // Issue it first
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});

      // Then void it
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/void`)
        .expect(200);

      expect(response.body).toHaveProperty('status', InvoiceStatus.void);
    });

    it('should void an overdue invoice with status 200', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-VOID-OVERDUE',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      const invoiceId = createResponse.body.id;

      // Issue it first
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});

      // Mark as overdue
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/overdue`)
        .send({});

      // Then void it
      const response = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/void`)
        .expect(200);

      expect(response.body).toHaveProperty('status', InvoiceStatus.void);
    });

    it('should return 500 when trying to void paid invoice', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-VOID-PAID',
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

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      const invoiceId = createResponse.body.id;

      // Issue it
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});

      // Pay it
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/pay`)
        .send({});

      // Try to void it
      await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/void`)
        .expect(500);
    });
  });

  describe('Route Response Format Validation', () => {
    it('should return consistent response structure for all endpoints', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-FORMAT',
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

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload)
        .expect(201);

      const requiredFields = [
        'id',
        'status',
        'currency',
        'totalAmount',
        'items',
      ];

      requiredFields.forEach(field => {
        expect(response.body).toHaveProperty(field);
      });

      // Verify items structure
      expect(Array.isArray(response.body.items)).toBe(true);
      if (response.body.items.length > 0) {
        const itemFields = [
          'id',
          'description',
          'quantity',
          'unitPriceAmount',
          'subtotalAmount',
          'currency',
        ];
        itemFields.forEach(field => {
          expect(response.body.items[0]).toHaveProperty(field);
        });
      }
    });

    it('should return correct HTTP status codes for success', async () => {
      const createPayload = {
        invoiceId: 'INV-E2E-STATUS',
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

      // POST /invoices should return 201 Created
      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload);

      expect(createResponse.status).toBe(201);

      const invoiceId = createResponse.body.id;

      // Other POST operations should return 200 OK
      const issueResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({});

      expect(issueResponse.status).toBe(200);
    });
  });

  describe('Complete Invoice Workflow (End-to-End)', () => {
    it('should handle complete invoice lifecycle: create -> issue -> overdue -> pay', async () => {
      // Step 1: Create invoice
      const createPayload = {
        invoiceId: 'INV-E2E-WORKFLOW',
        currency: 'USD',
        items: [
          {
            id: 'ITEM-001',
            description: 'Consulting',
            quantity: 10,
            unitPriceAmount: 10000,
          },
        ],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload)
        .expect(201);

      const invoiceId = createResponse.body.id;
      expect(createResponse.body.status).toBe(InvoiceStatus.draft);
      expect(createResponse.body.totalAmount).toBe(100000);

      // Step 2: Issue invoice
      const issueResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({})
        .expect(200);

      expect(issueResponse.body.status).toBe(InvoiceStatus.issued);
      expect(issueResponse.body.issuedAt).toBeDefined();
      expect(issueResponse.body.dueAt).toBeDefined();

      // Step 3: Mark as overdue
      const overdueResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/overdue`)
        .send({})
        .expect(200);

      expect(overdueResponse.body.status).toBe(InvoiceStatus.overdue);

      // Step 4: Pay invoice
      const payResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/pay`)
        .send({})
        .expect(200);

      expect(payResponse.body.status).toBe(InvoiceStatus.paid);
    });

    it('should handle complete invoice lifecycle: create -> issue -> void', async () => {
      // Step 1: Create invoice
      const createPayload = {
        invoiceId: 'INV-E2E-WORKFLOW-VOID',
        currency: 'EUR',
        items: [
          {
            id: 'ITEM-001',
            description: 'Service',
            quantity: 5,
            unitPriceAmount: 5000,
          },
        ],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createPayload)
        .expect(201);

      const invoiceId = createResponse.body.id;
      expect(createResponse.body.status).toBe(InvoiceStatus.draft);

      // Step 2: Issue invoice
      const issueResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/issue`)
        .send({})
        .expect(200);

      expect(issueResponse.body.status).toBe(InvoiceStatus.issued);

      // Step 3: Void invoice
      const voidResponse = await request(app.getHttpServer())
        .post(`/invoices/${invoiceId}/void`)
        .send({})
        .expect(200);

      expect(voidResponse.body.status).toBe(InvoiceStatus.void);
    });
  });
});

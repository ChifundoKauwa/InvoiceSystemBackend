import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import supertest from 'supertest';
import { InvoiceController } from './InvoiceController';
import { CreateInvoiceUseCase, IssueInvoiceUseCase, PayInvoiceUseCase, MarkAsOverdueUseCase, VoidInvoiceUseCase } from '../../../application/usecases';
import { InvoiceRepo } from '../../../domain/invoice/InvoiceRepo';
import { ApplicationEventBus } from '../../../application/ports/ApplicationEventBus';
import { Invoice } from '../../../domain/invoice/Invoice';
import { InvoiceItem } from '../../../domain/invoice/InvoiceItem';
import { Money } from '../../../domain/shared/Money';

describe('InvoiceController Routes (E2E)', () => {
    let app: INestApplication;
    let mockInvoiceRepo: jest.Mocked<InvoiceRepo>;
    let mockEventBus: jest.Mocked<ApplicationEventBus>;

    beforeAll(async () => {
        // Create mocks for dependencies
        mockInvoiceRepo = {
            getById: jest.fn(),
            save: jest.fn(),
        } as jest.Mocked<InvoiceRepo>;

        mockEventBus = {
            publishAll: jest.fn(),
        } as jest.Mocked<ApplicationEventBus>;

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [InvoiceController],
            providers: [
                CreateInvoiceUseCase,
                IssueInvoiceUseCase,
                PayInvoiceUseCase,
                MarkAsOverdueUseCase,
                VoidInvoiceUseCase,
                {
                    provide: InvoiceRepo,
                    useValue: mockInvoiceRepo,
                },
                {
                    provide: ApplicationEventBus,
                    useValue: mockEventBus,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        
        // Add validation pipe (same as main.ts)
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }),
        );

        // Set global prefix (same as main.ts)
        app.setGlobalPrefix('api/v1');

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/v1/invoices', () => {
        it('should create a draft invoice', async () => {
            mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
            mockEventBus.publishAll.mockResolvedValueOnce(undefined);

            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices')
                .send({
                    invoiceId: 'INV-001',
                    currency: 'USD',
                    items: [
                        {
                            id: 'ITEM-001',
                            description: 'Widget',
                            quantity: 2,
                            unitPriceAmount: 5000,
                        },
                    ],
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBe('INV-001');
            expect(response.body.status).toBe('DRAFT');
        });

        it('should fail with missing invoiceId', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices')
                .send({
                    currency: 'USD',
                    items: [
                        {
                            id: 'ITEM-001',
                            description: 'Widget',
                            quantity: 2,
                            unitPriceAmount: 5000,
                        },
                    ],
                });

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/v1/invoices/:id/issue', () => {
        it('should issue an invoice', async () => {
            const items = [
                new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
            ];
            const draftInvoice = new Invoice('INV-001', 'USD', items);

            mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
            mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
            mockEventBus.publishAll.mockResolvedValueOnce(undefined);

            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices/INV-001/issue')
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('ISSUED');
        });
    });

    describe('POST /api/v1/invoices/:id/pay', () => {
        it('should mark invoice as paid', async () => {
            const items = [
                new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
            ];
            const draftInvoice = new Invoice('INV-001', 'USD', items);
            const issuedInvoice = draftInvoice.issue(new Date());

            mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
            mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
            mockEventBus.publishAll.mockResolvedValueOnce(undefined);

            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices/INV-001/pay');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('PAID');
        });
    });

    describe('POST /api/v1/invoices/:id/overdue', () => {
        it('should mark invoice as overdue', async () => {
            const items = [
                new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
            ];
            const draftInvoice = new Invoice('INV-001', 'USD', items);
            const issuedInvoice = draftInvoice.issue(new Date());

            mockInvoiceRepo.getById.mockResolvedValueOnce(issuedInvoice);
            mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
            mockEventBus.publishAll.mockResolvedValueOnce(undefined);

            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices/INV-001/overdue');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('OVERDUE');
        });
    });

    describe('POST /api/v1/invoices/:id/void', () => {
        it('should void an invoice', async () => {
            const items = [
                new InvoiceItem('ITEM-001', new Money(5000, 'USD'), 2, 'Widget'),
            ];
            const draftInvoice = new Invoice('INV-001', 'USD', items);

            mockInvoiceRepo.getById.mockResolvedValueOnce(draftInvoice);
            mockInvoiceRepo.save.mockResolvedValueOnce(undefined);
            mockEventBus.publishAll.mockResolvedValueOnce(undefined);

            const response = await supertest(app.getHttpServer())
                .post('/api/v1/invoices/INV-001/void');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('VOIDED');
        });
    });
});

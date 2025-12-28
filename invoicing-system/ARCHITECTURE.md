# Invoicing System - Domain-First Architecture

## Architecture Overview

This is a production-ready invoicing system built with **strict domain-first architecture** using NestJS, TypeORM, and pure domain-driven design principles.

### Layer Structure

```
┌─────────────────────────────────────────┐
│   PRESENTATION (HTTP)                   │
│  • InvoiceController (thin handlers)    │
│  • GlobalExceptionFilter (error mapping)|
│  • RequestDtos (validation)             │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   APPLICATION (Orchestration)           │
│  • Use Cases (command handlers)         │
│  • Commands & DTOs                      │
│  • ApplicationEventBus (interface)      │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   DOMAIN (Pure Business Logic)          │
│  • Invoice (aggregate root)             │
│  • InvoiceItem (value object)           │
│  • Money (value object)                 │
│  • Domain Events                        │
│  • InvoiceRepo (interface)              │
└──────────────────┬──────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│   INFRASTRUCTURE (Technical Details)    │
│  • TypeormInvoiceRepo (implementation)  │
│  • NestEventBus (event publisher)       │
│  • InvoiceEntity (ORM mapping)          │
│  • TypeORM Configuration                │
│  • Module wiring (DI)                   │
└─────────────────────────────────────────┘
```

## Key Architecture Rules Enforced

1. ✅ **Business rules live ONLY in domain layer**
   - No business logic in controllers, services, or repositories
   - All invariants checked in domain entities

2. ✅ **Domain is pure TypeScript**
   - No NestJS decorators
   - No TypeORM/database concerns
   - No framework dependencies

3. ✅ **NestJS is application + infrastructure shell**
   - Controllers are thin HTTP handlers only
   - All DI via NestJS modules
   - Infrastructure adapters implement domain interfaces

4. ✅ **Persistence is an adapter, not source of truth**
   - Repository interface in domain
   - TypeORM repository in infrastructure
   - Can swap database implementations

5. ✅ **Controllers are transport-only**
   - Map HTTP requests to commands
   - Delegate to use cases
   - Map responses to DTOs

6. ✅ **Use cases orchestrate domain behavior**
   - Retrieve aggregates
   - Call domain methods
   - Persist changes
   - Publish events

7. ✅ **Rich domain models, no anemic objects**
   - Business logic in Invoice entity
   - State validation in domain
   - Immutability enforced via deepFreeze

## File Structure

```
src/
├── domain/                          # Pure business logic (no framework)
│   ├── invoice/
│   │   ├── Invoice.ts              # Aggregate root
│   │   ├── InvoiceItem.ts          # Value object
│   │   ├── InvoiceStatus.ts        # Status enum
│   │   ├── InvoiceRepo.ts          # Repository interface
│   │   ├── DomainEvent.ts          # Event base class
│   │   └── InvoiceEvent.ts         # Specific events
│   └── shared/
│       ├── Money.ts                # Money value object
│       └── deepFreeze.ts           # Immutability utility
│
├── application/                     # Orchestration layer (no framework)
│   ├── usecases/
│   │   ├── CreateInvoiceUseCase.ts
│   │   ├── IssueInvoiceUseCase.ts
│   │   ├── PayInvoiceUseCase.ts
│   │   ├── MarkAsOverdueUseCase.ts
│   │   └── VoidInvoiceUseCase.ts
│   ├── dtos/
│   │   ├── Commands.ts             # Request commands
│   │   └── Responses.ts            # Response DTOs
│   ├── exceptions/
│   │   └── ApplicationExceptions.ts # Domain-aware errors
│   └── ports/
│       └── ApplicationEventBus.ts  # Event bus interface
│
├── infrastructure/                  # Technical implementation
│   ├── persistence/
│   │   ├── entities/               # TypeORM mappings
│   │   │   ├── InvoiceEntity.ts
│   │   │   └── InvoiceItemEntity.ts
│   │   ├── mappers/
│   │   │   └── InvoiceMapper.ts    # Domain ↔ Entity conversion
│   │   └── repositories/
│   │       └── TypeormInvoiceRepo.ts # InvoiceRepo implementation
│   ├── eventbus/
│   │   └── NestEventBus.ts         # ApplicationEventBus implementation
│   └── typeorm.config.ts           # Database configuration
│
└── presentation/                    # HTTP layer
    └── http/
        ├── controllers/
        │   └── InvoiceController.ts # Thin HTTP handlers
        ├── filters/
        │   └── GlobalExceptionFilter.ts # Error mapping
        └── dtos/
            └── RequestDtos.ts      # HTTP request validation

invoice.module.ts                    # Feature module wiring
app.module.ts                        # Root module
main.ts                              # Bootstrap
```

## Invoice Lifecycle

```
DRAFT → ISSUED → (OVERDUE) → PAID
                              ↓
                            VOIDED (not from PAID)
```

### Status Transitions

- **DRAFT** (initial)
  - Can add items
  - Can issue to ISSUED
  - Can void directly

- **ISSUED**
  - Has issuedAt and dueAt dates
  - Can transition to OVERDUE
  - Can transition to PAID
  - Can void

- **OVERDUE**
  - Due date has passed
  - Can transition to PAID
  - Can void

- **PAID** (terminal)
  - Cannot void (payment already accepted)
  - No further transitions

- **VOIDED** (terminal)
  - Cannot be paid

## API Endpoints

All endpoints return JSON. Timestamps are ISO 8601 format.

### Create Invoice (DRAFT)
```
POST /api/v1/invoices
Content-Type: application/json

{
  "invoiceId": "INV-001",
  "currency": "USD",
  "items": [
    {
      "id": "ITEM-1",
      "description": "Consulting Services",
      "quantity": 10,
      "unitPriceAmount": 5000
    }
  ]
}

Response: 201 Created
{
  "id": "INV-001",
  "status": "DRAFT",
  "currency": "USD",
  "totalAmount": 50000,
  "items": [...],
  "issuedAt": null,
  "dueAt": null
}
```

### Issue Invoice
```
POST /api/v1/invoices/:id/issue
Content-Type: application/json

{
  "issueAt": "2025-12-26T00:00:00Z"
}

Response: 200 OK
{
  "id": "INV-001",
  "status": "ISSUED",
  "currency": "USD",
  "totalAmount": 50000,
  "items": [...],
  "issuedAt": "2025-12-26T00:00:00Z",
  "dueAt": "2026-01-25T00:00:00Z"  # 30 days later, auto-calculated
}
```

### Pay Invoice
```
POST /api/v1/invoices/:id/pay

Response: 200 OK
{
  "id": "INV-001",
  "status": "PAID",
  ...
}
```

### Mark As Overdue
```
POST /api/v1/invoices/:id/overdue

Response: 200 OK
{
  "id": "INV-001",
  "status": "OVERDUE",
  ...
}
```

### Void Invoice
```
POST /api/v1/invoices/:id/void

Response: 200 OK
{
  "id": "INV-001",
  "status": "VOIDED",
  ...
}
```

## Error Handling

All errors return consistent JSON format:

```json
{
  "error": {
    "type": "ErrorType",
    "message": "Human-readable message",
    "statusCode": 400
  }
}
```

### Error Types

| Error | HTTP Status | Cause |
|-------|-------------|-------|
| `InvoiceNotFound` | 404 | Invoice ID doesn't exist |
| `InvalidInvoiceState` | 409 | Operation invalid for current status |
| `InvalidInvoiceData` | 400 | Data validation failed |
| `EventPublishingError` | 500 | Failed to publish events |

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Install missing packages** (if not already done):
```bash
npm install --save \
  @nestjs/config \
  @nestjs/event-emitter \
  @nestjs/typeorm \
  typeorm \
  pg \
  class-validator \
  class-transformer \
  reflect-metadata
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

4. **Create database:**
```bash
# Using PostgreSQL CLI
createdb invoicing_db
```

5. **Start application:**
```bash
# Development mode with watch
npm run start:dev

# Production build
npm run build
npm run start:prod
```

6. **Test API:**
```bash
# Create invoice
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "INV-001",
    "currency": "USD",
    "items": [{
      "id": "ITEM-1",
      "description": "Service",
      "quantity": 1,
      "unitPriceAmount": 10000
    }]
  }'

# Issue invoice
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/issue \
  -H "Content-Type: application/json" \
  -d '{"issueAt": "2025-12-26T00:00:00Z"}'

# Pay invoice
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/pay
```

## Design Patterns Used

### 1. Aggregate Pattern
- `Invoice` is the aggregate root
- `InvoiceItem` is part of the aggregate
- All changes go through the aggregate

### 2. Value Object Pattern
- `Money` encapsulates amount + currency
- Immutable and compared by value
- Domain logic in value objects

### 3. Repository Pattern
- `InvoiceRepo` interface in domain
- `TypeormInvoiceRepo` implementation in infrastructure
- Decouples domain from persistence

### 4. Dependency Inversion
- Domain depends on interfaces
- Infrastructure implements interfaces
- NestJS wires implementations via DI

### 5. Command/Query Separation
- Commands (create, issue, pay, void) handled by use cases
- No queries yet (can be added later)

### 6. Event-Driven Architecture
- Domain events captured during operations
- Published through event bus
- Decouples concerns

### 7. Exception-Driven Flow
- Repository throws on not found
- Domain throws on invariant violations
- Use cases catch and re-throw as application exceptions
- Controller doesn't need null checks

## Testing Strategy (Next Steps)

### Unit Tests
- Domain entities (Invoice, Money, InvoiceItem)
- Use cases (with mocked dependencies)
- Mappers

### Integration Tests
- Full flow: HTTP → Controller → UseCase → Repo → DB

### Example Unit Test
```typescript
describe('Invoice.issue', () => {
    it('should transition DRAFT to ISSUED with due date 30 days later', () => {
        const invoice = new Invoice('INV-001', 'USD', [item]);
        const issueAt = new Date('2025-12-26');
        
        const issued = invoice.issue(issueAt);
        
        expect(issued.getStatus()).toBe(InvoiceStatus.issued);
        expect(issued.getIssueAt()).toEqual(issueAt);
        expect(issued.getDueAt()).toEqual(new Date('2026-01-25'));
    });
});
```

## Future Enhancements

1. **Event Sourcing**
   - Store all domain events
   - Reconstruct aggregates from events
   - Audit trail

2. **CQRS**
   - Separate read and write models
   - Optimize queries with projections
   - Event handlers update read model

3. **Sagas & Workflows**
   - Handle multi-step business processes
   - Send notifications
   - Integration with external systems

4. **Domain Events Listeners**
   - Send emails on invoice issued
   - Update analytics
   - Trigger reminders for overdue

5. **API Documentation**
   - Swagger/OpenAPI generation
   - Interactive docs

6. **Authentication & Authorization**
   - JWT tokens
   - Role-based access control
   - Multi-tenant support

## Architecture Principles

This implementation follows:
- **Domain-Driven Design (DDD)** - Business rules in domain
- **Clean Architecture** - Layers depend inward
- **SOLID Principles**
  - Single Responsibility: Each class has one reason to change
  - Open/Closed: Open for extension, closed for modification
  - Liskov Substitution: Implementations are substitutable
  - Interface Segregation: Small, focused interfaces
  - Dependency Inversion: Depend on abstractions

- **12-Factor App** - Environment-based configuration
- **Ports & Adapters** - Infrastructure is pluggable

## Why This Architecture?

### Testability
- Domain logic tested without framework
- Use cases tested with mocked dependencies
- Integration tests test all layers

### Maintainability
- Clear separation of concerns
- Each layer has single responsibility
- Easy to locate and modify business rules

### Scalability
- Add new use cases without changing existing code
- Swap persistence implementation (PostgreSQL → MongoDB)
- Add new event handlers without touching domain

### Framework Independence
- Domain layer has zero framework dependencies
- Can reuse domain in CLI, workers, libraries
- Easy to migrate away from NestJS if needed

## Troubleshooting

### Database Connection Error
```
Check .env file:
- DB_HOST: localhost (or your server)
- DB_PORT: 5432
- DB_USERNAME: postgres
- DB_PASSWORD: your_password
- DB_NAME: invoicing_db

Ensure PostgreSQL is running:
  psql -U postgres
```

### Module Not Found Errors
```
Ensure all imports use correct paths:
- Domain imports: import { Invoice } from '../domain/...'
- Application imports: import { IssueInvoiceUseCase } from '../application/...'
- Infrastructure imports: import { TypeormInvoiceRepo } from '../infrastructure/...'
```

### TypeORM Synchronization Issues
```
If schema is out of sync:
1. Stop the application
2. Delete the database: dropdb invoicing_db
3. Recreate: createdb invoicing_db
4. Start app (synchronize: true will recreate schema)
```

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)

---

**Built with discipline. Engineered for production.**

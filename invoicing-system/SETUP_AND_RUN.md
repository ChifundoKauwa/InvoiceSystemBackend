# Setup & Run Guide - Invoicing System

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=invoicing_db
```

### 3. Create Database
```bash
createdb invoicing_db
```

(Or using PostgreSQL CLI: `psql -U postgres -c "CREATE DATABASE invoicing_db;"`)

### 4. Start Application
**Development mode (with auto-reload):**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000/api/v1`

---

## API Endpoints

### 1. Create Invoice (DRAFT)
```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

**Response (201 Created):**
```json
{
  "id": "INV-001",
  "status": "DRAFT",
  "currency": "USD",
  "totalAmount": 50000,
  "items": [
    {
      "id": "ITEM-1",
      "description": "Consulting Services",
      "quantity": 10,
      "unitPriceAmount": 5000,
      "subtotalAmount": 50000,
      "currency": "USD"
    }
  ],
  "issuedAt": null,
  "dueAt": null
}
```

### 2. Issue Invoice
```bash
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/issue \
  -H "Content-Type: application/json" \
  -d '{
    "issueAt": "2025-12-26T00:00:00Z"
  }'
```

**Response (200 OK):**
```json
{
  "id": "INV-001",
  "status": "ISSUED",
  "currency": "USD",
  "totalAmount": 50000,
  "items": [...],
  "issuedAt": "2025-12-26T00:00:00.000Z",
  "dueAt": "2026-01-25T00:00:00.000Z"
}
```

Note: `dueAt` is automatically calculated as 30 days after `issueAt`.

### 3. Pay Invoice
```bash
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/pay
```

**Response (200 OK):**
```json
{
  "id": "INV-001",
  "status": "PAID",
  ...
}
```

### 4. Mark as Overdue
```bash
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/overdue
```

### 5. Void Invoice
```bash
curl -X POST http://localhost:3000/api/v1/invoices/INV-001/void
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "type": "ErrorType",
    "message": "Human-readable error message",
    "statusCode": 404
  }
}
```

### Common Errors

**404 Not Found - Invoice doesn't exist:**
```json
{
  "error": {
    "type": "InvoiceNotFound",
    "message": "Invoice with id 'NONEXISTENT' not found",
    "statusCode": 404
  }
}
```

**409 Conflict - Invalid state transition:**
```json
{
  "error": {
    "type": "InvalidInvoiceState",
    "message": "Cannot pay invoice in DRAFT state",
    "statusCode": 409
  }
}
```

**400 Bad Request - Invalid input:**
```json
{
  "error": {
    "type": "InvalidInvoiceData",
    "message": "Invalid invoice data: currency is required",
    "statusCode": 400
  }
}
```

---

## Architecture & Null Safety

### Critical Domain Rule: NO NULL VALUES

The domain layer enforces a strict no-null rule:

1. **Invoice constructor** - Throws if:
   - `id` is null or empty
   - `currency` is null or empty
   - Items have mismatched currency

2. **InvoiceRepo.getById()** - Throws `InvoiceNotFoundError` if not found (never returns null)

3. **All state transitions** - Validate preconditions:
   - Cannot issue non-draft invoice
   - Cannot pay non-issued/overdue invoice
   - Cannot void paid invoice

4. **All getters return typed values**:
   - `getId(): string` - Never null
   - `getStatus(): InvoiceStatus` - Never null
   - `getCurrency(): string` - Never null
   - `getIssueAt(): Date | undefined` - Can be undefined until issued
   - `getDueAt(): Date | undefined` - Can be undefined until issued

### Fail-Fast Pattern

The repository throws on not found, requiring no null checks in use cases:

```typescript
// This throws InvoiceNotFoundError if not found - no null check needed
const invoice = await this.invoiceRepo.getById(command.invoiceId);

// Can immediately call domain methods
const issuedInvoice = invoice.issue(dueAt);
```

---

## File Structure

```
src/
├── domain/                              # Pure business logic
│   ├── invoice/
│   │   ├── Invoice.ts                  # Aggregate root (NO NULLS)
│   │   ├── InvoiceItem.ts              # Value object
│   │   ├── InvoiceStatus.ts            # Status enum
│   │   ├── InvoiceRepo.ts              # Interface (throws on not found)
│   │   └── ...Events.ts
│   └── shared/
│       ├── Money.ts                    # Value object (NO NULLS)
│       └── deepFreeze.ts
│
├── application/                         # Orchestration (NO FRAMEWORK)
│   ├── usecases/
│   │   ├── CreateInvoiceUseCase.ts
│   │   ├── IssueInvoiceUseCase.ts
│   │   ├── PayInvoiceUseCase.ts
│   │   ├── MarkAsOverdueUseCase.ts
│   │   └── VoidInvoiceUseCase.ts
│   ├── dtos/
│   │   ├── Commands.ts                 # Request command objects (validate inputs)
│   │   └── Responses.ts                # Response DTOs
│   ├── exceptions/
│   │   └── ApplicationExceptions.ts    # Domain-aware errors
│   └── ports/
│       └── ApplicationEventBus.ts      # Event bus interface
│
├── infrastructure/                      # TECHNICAL DETAILS ONLY
│   ├── persistence/
│   │   ├── entities/                   # TypeORM mappings
│   │   ├── mappers/
│   │   │   └── InvoiceMapper.ts        # Domain ↔ Entity conversion
│   │   └── repositories/
│   │       └── TypeormInvoiceRepo.ts   # InvoiceRepo implementation
│   ├── eventbus/
│   │   └── NestEventBus.ts             # Event bus implementation
│   └── typeorm.config.ts
│
└── presentation/                        # HTTP LAYER
    └── http/
        ├── controllers/
        │   └── InvoiceController.ts    # Thin HTTP handlers
        ├── filters/
        │   └── GlobalExceptionFilter.ts
        └── dtos/
            └── RequestDtos.ts          # HTTP request validation

invoice.module.ts                        # Feature module
app.module.ts                            # Root module
main.ts                                  # Bootstrap
```

---

## Scripts

```bash
# Development with auto-reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

---

## Troubleshooting

### "Cannot connect to database"
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
- Check `.env` file has correct credentials
- Verify database exists: `psql -U postgres -l | grep invoicing_db`

### "Module not found" errors
- Verify npm install completed: `npm install`
- Clear TypeScript cache: `rm -rf dist/`
- Rebuild: `npm run build`

### "Port 3000 already in use"
- Change in `main.ts`: `const port = 3001;`
- Or kill process: `lsof -i :3000` then `kill -9 <PID>`

### TypeORM schema out of sync
- Drop and recreate database:
  ```bash
  dropdb invoicing_db
  createdb invoicing_db
  npm run start:dev   # Will auto-create schema
  ```

---

## Testing Examples

### Test Create → Issue → Pay Flow
```bash
# 1. Create invoice
INVOICE_ID="INV-$(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d "{
    \"invoiceId\": \"$INVOICE_ID\",
    \"currency\": \"USD\",
    \"items\": [{
      \"id\": \"ITEM-1\",
      \"description\": \"Test\",
      \"quantity\": 1,
      \"unitPriceAmount\": 10000
    }]
  }")
echo "Created: $CREATE_RESPONSE"

# 2. Issue invoice
ISSUE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/invoices/$INVOICE_ID/issue \
  -H "Content-Type: application/json" \
  -d '{"issueAt": "2025-12-26T00:00:00Z"}')
echo "Issued: $ISSUE_RESPONSE"

# 3. Pay invoice
PAY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/invoices/$INVOICE_ID/pay)
echo "Paid: $PAY_RESPONSE"
```

---

## Next Steps

1. **Add Event Listeners** - Handle domain events (email on issued, etc.)
2. **Add Queries** - Read invoices, list invoices, search
3. **Add Migrations** - Use TypeORM CLI or Knex for schema management
4. **Add Authentication** - JWT or OAuth2
5. **Add API Documentation** - Swagger/OpenAPI
6. **Add Logging** - Winston or Pino
7. **Add Metrics** - Prometheus
8. **Add Tests** - Unit, integration, e2e tests

---

## Architecture Philosophy

This system demonstrates:
- **Domain-Driven Design** - Business logic owns structure
- **Clean Architecture** - Layers depend inward only
- **SOLID Principles** - Single responsibility, open/closed, etc.
- **Null Safety** - Fail-fast, no defensive null checks
- **Immutability** - Aggregates frozen after transitions
- **Type Safety** - Full TypeScript type checking
- **Framework Independence** - Domain logic doesn't know about NestJS

The domain layer is **completely framework-agnostic** and could run on:
- NestJS (current)
- Express
- Fastify
- CLI
- Lambda functions
- Worker threads

---

**Built with discipline. Production-ready architecture.**

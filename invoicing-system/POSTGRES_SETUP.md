# PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

### Windows
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)
- Accept default settings
- Remember the **postgres** password you set during installation
- Default port: 5432

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

---

## Step 2: Create the Database

### Option A: Using psql (Command Line)

**Open PowerShell or Terminal and run:**
```bash
psql -U postgres
```
Enter your postgres password when prompted.

**Then create the database:**
```sql
CREATE DATABASE invoicing_db;
\q
```

### Option B: Using pgAdmin (GUI)

1. Download [pgAdmin](https://www.pgadmin.org/)
2. Launch pgAdmin and login
3. Right-click "Databases" → "Create" → "Database"
4. Name it `invoicing_db`
5. Click "Save"

### Option C: Using Windows Command (PowerShell)
```powershell
$env:PGPASSWORD="password"
createdb -U postgres -h localhost invoicing_db
```

---

## Step 3: Update .env File

The `.env` file is already configured correctly. Verify it matches your PostgreSQL setup:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password        # Change this to YOUR postgres password
DB_NAME=invoicing_db
```

**If you used a different password during PostgreSQL installation, update:**
```env
DB_PASSWORD=your_actual_password
```

---

## Step 4: Start the Application

**Development mode (with auto-reload):**
```bash
npm run start:dev
```

**What happens:**
1. NestJS connects to PostgreSQL
2. TypeORM auto-creates `invoices` and `invoice_items` tables
3. Application starts on `http://localhost:3000`
4. Ready to receive requests

---

## Step 5: Verify Connection

### Option A: Check Logs
When you run `npm run start:dev`, you'll see:
```
[Nest] 1234  12/26/2025, 3:00:00 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1234  12/26/2025, 3:00:01 PM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
[Nest] 1234  12/26/2025, 3:00:01 PM     LOG [InstanceLoader] InvoiceModule dependencies initialized
[Nest] 1234  12/26/2025, 3:00:01 PM     LOG [NestApplication] Nest application successfully started
Listening on port 3000
```

### Option B: Test with API Request
```bash
curl -X POST http://localhost:3000/api/v1/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceId": "INV-TEST-001",
    "currency": "USD",
    "items": [
      {
        "id": "ITEM-1",
        "description": "Test",
        "quantity": 1,
        "unitPriceAmount": 10000
      }
    ]
  }'
```

**Success response:**
```json
{
  "id": "INV-TEST-001",
  "status": "DRAFT",
  "currency": "USD",
  "totalAmount": 10000,
  "items": [...]
}
```

### Option C: Check Database with pgAdmin
1. Open pgAdmin
2. Expand "Databases" → "invoicing_db"
3. Expand "Schemas" → "public" → "Tables"
4. You should see:
   - `invoices` table
   - `invoice_items` table

---

## Troubleshooting

### "Connection refused"
```
error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** PostgreSQL is not running
- Windows: Start PostgreSQL service from Services
- macOS: `brew services start postgresql`
- Linux: `sudo service postgresql start`

### "password authentication failed"
```
error: password authentication failed for user "postgres"
```
**Solution:** Wrong password in `.env`
- Update `DB_PASSWORD=your_correct_password`

### "database invoicing_db does not exist"
```
error: database "invoicing_db" does not exist
```
**Solution:** Create the database using psql:
```bash
psql -U postgres -c "CREATE DATABASE invoicing_db;"
```

### "port 5432 is already in use"
```
error: listen EADDRINUSE :::5432
```
**Solution:** PostgreSQL is already running on another port or process
- Find process: `lsof -i :5432` (macOS/Linux) or `netstat -ano | findstr :5432` (Windows)
- Kill it: `kill -9 <PID>` (macOS/Linux) or `taskkill /PID <PID> /F` (Windows)

### Tables not auto-creating
If `synchronize: false` in env:
1. Manually create tables using SQL:
```sql
-- Run this in psql connected to invoicing_db

CREATE TABLE invoices (
    id VARCHAR PRIMARY KEY,
    status VARCHAR NOT NULL,
    currency VARCHAR NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP,
    "dueAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_items (
    id VARCHAR PRIMARY KEY,
    "invoiceId" VARCHAR NOT NULL REFERENCES invoices(id),
    description VARCHAR NOT NULL,
    quantity INTEGER NOT NULL,
    "unitPriceAmount" INTEGER NOT NULL,
    currency VARCHAR NOT NULL,
    "subtotalAmount" INTEGER NOT NULL
);
```

2. Or change `.env` to:
```env
NODE_ENV=development
```
This enables `synchronize: true` which auto-creates tables.

---

## Verify Everything Works

Once connected, the database will have:

**invoices table:**
| Column | Type |
|--------|------|
| id | VARCHAR (PRIMARY KEY) |
| status | VARCHAR (DRAFT, ISSUED, OVERDUE, PAID, VOIDED) |
| currency | VARCHAR (USD, EUR, GBP, etc.) |
| totalAmount | INTEGER (cents) |
| issuedAt | TIMESTAMP (nullable) |
| dueAt | TIMESTAMP (nullable) |
| createdAt | TIMESTAMP |
| updatedAt | TIMESTAMP |

**invoice_items table:**
| Column | Type |
|--------|------|
| id | VARCHAR (PRIMARY KEY) |
| invoiceId | VARCHAR (FOREIGN KEY) |
| description | VARCHAR |
| quantity | INTEGER |
| unitPriceAmount | INTEGER (cents) |
| currency | VARCHAR |
| subtotalAmount | INTEGER (cents) |

---

## Production Setup

For production, update `.env`:

```env
NODE_ENV=production
DB_HOST=your-rds-endpoint.amazonaws.com    # Use managed database (AWS RDS, etc.)
DB_PORT=5432
DB_USERNAME=prod_user
DB_PASSWORD=strong_random_password_here
DB_NAME=invoicing_db
```

**Critical:** In production:
- Set `synchronize: false` (manual migrations only)
- Use strong passwords
- Use managed databases (AWS RDS, Azure Database for PostgreSQL)
- Enable SSL connections
- Set up automated backups
- Use connection pooling (PgBouncer)

---

## Next Steps

Once PostgreSQL is connected:
1. ✅ Test the 5 API endpoints
2. ✅ Add more business logic
3. ✅ Set up automated testing
4. ✅ Deploy to production

See [SETUP_AND_RUN.md](SETUP_AND_RUN.md) for full API documentation.

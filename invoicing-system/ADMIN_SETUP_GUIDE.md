# Quick Start Guide for Admin Features

## Prerequisites
- Node.js and npm installed
- PostgreSQL database running
- Environment variables configured in `.env`

## Setup Steps

### 1. Install Dependencies
```bash
cd invoicing-system
npm install
```

### 2. Run Database Migration
The new admin features require database changes. Run the migration:

```bash
npm run typeorm migration:run
```

This will:
- Add `userId` column to the `invoices` table
- Create `system_settings` table with default values

### 3. Create an Admin User

After starting the application, you can create an admin user in two ways:

#### Option A: Register and Manually Update (Recommended for First Admin)
```bash
# 1. Register a new user via API
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'

# 2. Connect to PostgreSQL and update the role
psql -U your_db_user -d your_db_name
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
\q
```

#### Option B: Direct SQL Insert
```sql
-- Connect to your database
psql -U your_db_user -d your_db_name

-- Insert admin user (replace with bcrypt hashed password)
INSERT INTO users (id, "firstName", "lastName", email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Admin',
  'User',
  'admin@example.com',
  '$2b$10$YourBcryptHashedPasswordHere',
  'admin',
  true,
  NOW(),
  NOW()
);
```

### 4. Start the Application
```bash
npm run start:dev
```

### 5. Test Admin Endpoints

#### Login to Get Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!"
  }'
```

Save the `access_token` from the response.

#### Test System Stats
```bash
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Get All Users
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Get All Invoices
```bash
curl -X GET http://localhost:3000/admin/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Get Settings
```bash
curl -X GET http://localhost:3000/admin/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Test Update User Role
```bash
curl -X PUT http://localhost:3000/admin/users/USER_ID_HERE/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "manager"}'
```

#### Test Update Settings
```bash
curl -X PUT http://localhost:3000/admin/settings \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "siteName": "My Company Invoices",
    "defaultCurrency": "EUR",
    "defaultDueDays": 15
  }'
```

## Available Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/admin/stats` | Admin, Manager | Get system statistics |
| GET | `/admin/users` | Admin, Manager | Get all users |
| PUT | `/admin/users/:id/role` | Admin | Update user role |
| GET | `/admin/invoices` | Admin, Manager | Get all invoices |
| GET | `/admin/settings` | Admin | Get system settings |
| PUT | `/admin/settings` | Admin | Update system settings |

## Role Hierarchy

1. **User** (default)
   - Can view their own invoices
   - Cannot access admin endpoints

2. **Manager**
   - Can view system stats
   - Can view all users
   - Can view all invoices
   - Cannot change roles or settings

3. **Admin**
   - Full access to all endpoints
   - Can manage user roles
   - Can configure system settings

## Troubleshooting

### Migration Issues
If migration fails:
```bash
# Check migration status
npm run typeorm migration:show

# Revert last migration if needed
npm run typeorm migration:revert
```

### Authentication Issues
- Ensure JWT_SECRET is set in `.env`
- Token expires after configured time
- Check that user has correct role in database

### Database Issues
- Verify PostgreSQL is running
- Check database connection in `.env`
- Ensure user has proper permissions

## Integration with Frontend

The backend is now fully compatible with the frontend admin dashboard. The frontend should make requests to these endpoints using the user's JWT token in the Authorization header:

```javascript
const response = await fetch('http://localhost:3000/admin/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Notes

- All admin endpoints require authentication (JWT token)
- Role guards automatically enforce access control
- Admins cannot change their own role (safety measure)
- System settings use singleton pattern (always id = 1)
- Invoice-user relationships are tracked via `userId` field

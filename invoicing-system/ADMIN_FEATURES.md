# Admin Module Documentation

## Overview

The Admin Module provides comprehensive administrative functionality for the Invoice System, including user management, system-wide invoice viewing, role assignment, and system configuration.

## Features

### 1. System Statistics Dashboard
- **Endpoint**: `GET /admin/stats`
- **Access**: Admin, Manager
- **Description**: Provides system-wide statistics including:
  - Total users count
  - Total invoices count
  - Total revenue (from paid invoices)
  - Overdue invoices count
  - Recent users (last 5)
  - Recent invoices (last 5)

**Response Example**:
```json
{
  "totalUsers": 25,
  "totalInvoices": 150,
  "totalRevenue": 45000.00,
  "overdueInvoices": 5,
  "recentUsers": [...],
  "recentInvoices": [...]
}
```

### 2. User Management
- **Endpoint**: `GET /admin/users`
- **Access**: Admin, Manager
- **Description**: Retrieves all users in the system with their details

**Response Example**:
```json
{
  "users": [
    {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-07T00:00:00Z"
    }
  ],
  "total": 25
}
```

### 3. Role Assignment
- **Endpoint**: `PUT /admin/users/:id/role`
- **Access**: Admin only
- **Description**: Updates a user's role (user, manager, or admin)

**Request Body**:
```json
{
  "role": "manager"
}
```

**Response Example**:
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "manager",
  "message": "User role updated to manager successfully"
}
```

**Rules**:
- Admins cannot change their own role
- Only valid roles are: user, manager, admin

### 4. System-Wide Invoice Viewing
- **Endpoint**: `GET /admin/invoices`
- **Access**: Admin, Manager
- **Description**: Retrieves all invoices across all users

**Response Example**:
```json
{
  "invoices": [
    {
      "id": "INV-001",
      "userId": "uuid",
      "userEmail": "john@example.com",
      "userName": "John Doe",
      "currency": "USD",
      "state": "issued",
      "issueAt": "2026-01-01T00:00:00Z",
      "dueAt": "2026-01-31T00:00:00Z",
      "items": [...],
      "totalAmount": 1000.00
    }
  ],
  "total": 150
}
```

### 5. System Settings Management
- **Endpoint**: `GET /admin/settings`
- **Access**: Admin only
- **Description**: Retrieves current system settings

- **Endpoint**: `PUT /admin/settings`
- **Access**: Admin only
- **Description**: Updates system settings

**Request Body** (all fields optional):
```json
{
  "siteName": "My Invoice System",
  "siteEmail": "admin@example.com",
  "invoicePrefix": "INV",
  "defaultCurrency": "USD",
  "defaultDueDays": 30,
  "defaultUserRole": "user",
  "allowRegistration": true,
  "requireEmailVerification": false,
  "enableNotifications": true,
  "enableBackups": false
}
```

## User Roles

The system supports three roles with different permissions:

### User (default)
- Basic access
- Can view their own invoices
- Cannot access admin endpoints

### Manager
- Can view system statistics
- Can view all users
- Can view all invoices
- Cannot change user roles
- Cannot modify system settings

### Admin
- Full system access
- All Manager permissions plus:
- Can change user roles
- Can modify system settings
- Cannot change their own role (safety measure)

## Database Changes

### New Column: `invoices.userId`
- Type: `varchar`
- Nullable: `true`
- Purpose: Links invoices to users for admin tracking

### New Table: `system_settings`
- Singleton pattern (id always = 1)
- Stores all system configuration
- Automatically created with default values on first access

## Authentication & Authorization

All admin endpoints are protected by:
1. **JWT Authentication** - Must have valid token
2. **Role-Based Guards** - Must have required role(s)

Example request:
```bash
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Migration

A migration file has been created to add the new features:
- `1736270000000-AddAdminFeatures.ts`

Run migrations with:
```bash
npm run typeorm migration:run
```

## Integration with Frontend

The backend is fully compatible with the frontend admin dashboard that expects:

### Routes:
- `/admin` - Dashboard with statistics
- `/admin/users` - User management
- `/admin/invoices` - All invoices view
- `/admin/settings` - System configuration

### Frontend Routes Mapping:
- `GET /admin/stats` → Dashboard stats
- `GET /admin/users` → Users list
- `PUT /admin/users/:id/role` → Role assignment
- `GET /admin/invoices` → All invoices
- `GET /admin/settings` → Settings form
- `PUT /admin/settings` → Save settings

## Error Handling

The module includes proper error handling:
- `NotFoundException` - When user/resource not found
- `BadRequestException` - When trying to change own role
- `ForbiddenException` - When user lacks required role (handled by RolesGuard)

## Testing

To test the admin endpoints:

1. **Register/Login as Admin**:
```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "password": "admin123"
  }'

# Then manually update role in database or use SQL:
# UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

2. **Get Stats**:
```bash
curl -X GET http://localhost:3000/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Update User Role**:
```bash
curl -X PUT http://localhost:3000/admin/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "manager"}'
```

## Notes

- The system uses the existing role system already in the User entity
- All role guards were already in place (RolesGuard, @Roles decorator)
- The InvoiceEntity now tracks which user created each invoice
- Settings are stored in a dedicated table with singleton pattern
- Frontend and backend are fully synchronized with role-based access control

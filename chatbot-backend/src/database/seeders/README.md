# Database Seeders

This directory contains database seeders for populating the application with initial data.

## Available Seeders

### RoleSeeder
Creates the following roles with structured permissions:

- **Super Admin**: Full access to all resources
- **Admin**: Limited administrative access
- **User**: Basic user access

### UserSeeder
Creates a super admin user with the following credentials:
- Email: `admin@example.com`
- Password: `admin123`
- Role: Super Admin

## Permission Structure

Permissions are now stored in a structured format with boolean values:

```typescript
{
  users: {
    create: true,
    read: true,
    update: true,
    delete: false
  },
  roles: {
    create: false,
    read: true,
    update: false,
    delete: false
  }
}
```

This makes it easier to:
- Check specific permissions
- Override role permissions with user-specific permissions
- Handle permission logic in middleware and controllers

## Usage

### Run All Seeders
```bash
npm run seed
```

### Run Specific Seeder
```bash
npm run seed:role    # Run only role seeder
npm run seed:user    # Run only user seeder
```

### Using Permissions in Code

```typescript
import { hasPermission, requirePermission } from '@/app/utils/permissions';

// Check permission in controller
const canCreateUser = hasPermission(userPermissions, 'users', 'create');

// Use middleware in routes
router.post('/users', 
  requirePermission('users', 'create'), 
  userController.create
);
```

## Available Permission Resources

- `users`: User management
- `roles`: Role management  
- `settings`: Application settings
- `analytics`: Analytics and reporting
- `system`: System administration
- `profile`: User profile management
- `chat`: Chat functionality

## Available Permission Actions

- `create`: Create new records
- `read`: View records
- `update`: Modify existing records
- `delete`: Remove records
- `export`: Export data
- `manage`: Full management access
- `backup`: System backup
- `restore`: System restore

## Security Notes

⚠️ **Important**: The default super admin password is `admin123`. Please change this password immediately after first login for security purposes. 
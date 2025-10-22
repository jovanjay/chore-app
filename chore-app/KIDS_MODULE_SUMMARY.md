# Kids Module Implementation Summary

## Overview
Created a Kids entity with a **one-to-many relationship** from User entity. A user with `userType = 'parent'` can have one or more kids, but a user with `userType = 'child'` cannot have kids.

**Important:** When a parent creates a kid, the system automatically creates a User account (with `userType = 'child'`) so the kid can login to the application with their own credentials.

## Database Schema

### Kids Entity (`kids.entity.ts`)
```typescript
- id: UUID (Primary Key)
- name: string (required)
- dateOfBirth: Date (optional)
- age: number (optional)
- gender: 'male' | 'female' | 'other' (optional)
- notes: text (optional)
- active: boolean (default: true)
- createdAt: timestamp
- updatedAt: timestamp
- parentId: UUID (Foreign Key to User - references parent)
- parent: User (ManyToOne relationship - parent user)
- userId: UUID (Foreign Key to User - references kid's user account)
- user: User (ManyToOne relationship - kid's login account)
```

### User Entity Updates
- Updated `userType` enum: `'parent' | 'child' | 'admin' | 'user'`
- Added `kids: Kids[]` (OneToMany relationship)
- Default userType changed to `'parent'`

### Relationship Details

**Parent Relationship:**
- **Type**: One-to-Many (User -> Kids)
- **Cascade**: ON DELETE CASCADE (when parent is deleted, kids are deleted)
- **Foreign Key**: `parentId` references `User.id` (parent user)

**Kid User Account Relationship:**
- **Type**: One-to-One (Kids -> User)
- **Cascade**: ON DELETE CASCADE (when kid's user account is deleted, kid record is deleted)
- **Foreign Key**: `userId` references `User.id` (kid's login account)
- **User Type**: Automatically set to `'child'`

## API Endpoints

All endpoints require JWT authentication (`@UseGuards(JwtAuthGuard)`).

### 1. Create Kid
```
POST /kids
Body: CreateKidDto
```

**Validation Rules:**
- Only users with `userType = 'parent'` can create kids
- Returns 403 Forbidden if userType is not 'parent'

### 2. Get All Kids
```
GET /kids
```

**Features:**
- Returns all kids for the authenticated parent
- Ordered by createdAt (DESC)
- Returns 403 Forbidden if userType is not 'parent'

### 3. Get Single Kid
```
GET /kids/:id
```

**Features:**
- Returns kid only if it belongs to the authenticated parent
- Returns 404 Not Found if kid doesn't exist or doesn't belong to parent
- Returns 403 Forbidden if userType is not 'parent'

### 4. Update Kid
```
PATCH /kids/:id
Body: UpdateKidDto
```

**Features:**
- Updates kid only if it belongs to the authenticated parent
- All fields are optional in UpdateKidDto
- Returns 404 Not Found if kid doesn't exist or doesn't belong to parent

### 5. Delete Kid
```
DELETE /kids/:id
```

**Features:**
- Deletes kid only if it belongs to the authenticated parent
- Also deletes the kid's user account
- Returns 404 Not Found if kid doesn't exist or doesn't belong to parent

### 6. Get My Profile (For Kids)
```
GET /kids/me/profile
```

**Features:**
- Allows kids to view their own profile
- Only accessible by users with `userType = 'child'`
- Returns kid's information including parent details
- Returns 403 Forbidden if userType is not 'child'

## DTOs

### CreateKidDto
```typescript
{
  name: string;              // Required - Kid's full name
  email: string;             // Required - Kid's login email (must be unique)
  password: string;          // Required - Kid's login password (min 6 characters)
  dateOfBirth?: string;      // Optional (ISO date string, e.g., "2015-05-15")
  age?: number;              // Optional (0-18)
  gender?: 'male' | 'female' | 'other';  // Optional
  notes?: string;            // Optional
}
```

### UpdateKidDto
```typescript
{
  name?: string;             // Optional
  dateOfBirth?: string;      // Optional (ISO date string)
  age?: number;              // Optional (0-18)
  gender?: 'male' | 'female' | 'other';  // Optional
  notes?: string;            // Optional
  active?: boolean;          // Optional
}
```

## Validation & Security

### Business Rules Enforced:
1. ✅ Only users with `userType = 'parent'` can perform CRUD operations on kids
2. ✅ Users with `userType = 'child'` cannot create or manage kids
3. ✅ Parents can only see and manage their own kids
4. ✅ All endpoints require JWT authentication
5. ✅ Age must be between 0 and 18
6. ✅ Gender must be one of: 'male', 'female', 'other'
7. ✅ Email must be unique across all users
8. ✅ Password must be at least 6 characters long
9. ✅ Password is automatically hashed using bcryptjs
10. ✅ Kid's user account automatically created with `userType = 'child'`
11. ✅ Kids can view their own profile via `/kids/me/profile`

### Error Responses:
- `401 Unauthorized` - No JWT token or invalid token
- `403 Forbidden` - User is not a parent (or not a child for profile endpoint)
- `404 Not Found` - Kid not found or doesn't belong to parent
- `400 Bad Request` - Validation errors (invalid email, weak password, etc.)
- `409 Conflict` - Email already exists

## Module Structure

```
src/modules/kids/
├── dto/
│   ├── create-kid.dto.ts    # DTO for creating a kid
│   └── update-kid.dto.ts    # DTO for updating a kid
├── kids.controller.ts        # REST API endpoints
├── kids.module.ts            # Module definition
├── kids.provider.ts          # TypeORM repository provider
└── kids.service.ts           # Business logic
```

## Example Usage

### 1. Register as a Parent
```bash
POST /auth/register
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

### 2. Login
```bash
POST /auth/login
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}
```

### 3. Create a Kid (Creates User Account Automatically)
```bash
POST /kids
Authorization: Bearer <parent_jwt_token>
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecureKidPass123",
  "dateOfBirth": "2015-05-15",
  "age": 8,
  "gender": "male",
  "notes": "Loves soccer"
}
```

**What Happens:**
1. System creates a User account with:
   - email: "john.doe@example.com"
   - password: (hashed) "SecureKidPass123"
   - userType: "child"
   - firstName: "John"
   - lastName: "Doe"
2. System creates a Kids record linked to:
   - Parent (via parentId)
   - Kid's user account (via userId)

### 4. Get All Kids
```bash
GET /kids
Authorization: Bearer <jwt_token>
```

### 5. Update a Kid
```bash
PATCH /kids/<kid_id>
Authorization: Bearer <jwt_token>
{
  "age": 9,
  "notes": "Now plays basketball too"
}
```

### 6. Delete a Kid (Also Deletes User Account)
```bash
DELETE /kids/<kid_id>
Authorization: Bearer <parent_jwt_token>
```

### 7. Kid Login & View Profile
```bash
# Kid logs in with their credentials
POST /auth/login
{
  "email": "john.doe@example.com",
  "password": "SecureKidPass123"
}

# Response includes JWT token
# Kid can then view their profile
GET /kids/me/profile
Authorization: Bearer <kid_jwt_token>
```

## Database Tables Created

After synchronization (automatically with TypeORM), the following tables exist:

1. **user** - User accounts (with userType field)
2. **kids** - Kids records (with parentId foreign key)

## Notes

- The relationship ensures referential integrity
- TypeORM's `synchronize: true` automatically creates/updates tables
- In production, use migrations instead of synchronize
- The `onDelete: 'CASCADE'` ensures orphan records are cleaned up


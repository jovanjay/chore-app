# Kids Login Implementation - Quick Reference

## Overview
Kids are also users in the system! When a parent creates a kid, the system automatically creates a user account so the kid can login to the app.

## How It Works

### 1. Parent Creates a Kid
When a parent creates a kid, they provide:
- **name**: Kid's full name
- **email**: Kid's login email (must be unique)
- **password**: Kid's login password (min 6 characters)
- Optional: dateOfBirth, age, gender, notes

**What Happens Behind the Scenes:**
1. ✅ System creates a **User** account:
   - Email: The provided email
   - Password: Hashed with bcryptjs
   - UserType: Automatically set to `'child'`
   - FirstName & LastName: Extracted from name
   
2. ✅ System creates a **Kids** record:
   - Links to parent (via parentId)
   - Links to kid's user account (via userId)
   - Stores kid-specific info (age, gender, etc.)

### 2. Kid Can Login
The kid can now login using their credentials:

```bash
POST /auth/login
{
  "email": "kid@example.com",
  "password": "kidpassword"
}
```

Response includes JWT token with `userType = 'child'`

### 3. Kid Can View Their Profile
```bash
GET /kids/me/profile
Authorization: Bearer <kid_jwt_token>
```

Returns:
- Kid's information
- Parent information
- User account details

## Example Workflow

### Parent's Perspective

**Step 1: Parent Registers**
```bash
POST /auth/register
{
  "email": "parent@example.com",
  "password": "ParentPass123!",
  "confirmPassword": "ParentPass123!"
}
```

**Step 2: Parent Logs In**
```bash
POST /auth/login
{
  "email": "parent@example.com",
  "password": "ParentPass123!"
}
# Receives JWT token
```

**Step 3: Parent Creates Kid**
```bash
POST /kids
Authorization: Bearer <parent_jwt_token>
{
  "name": "Emma Johnson",
  "email": "emma.johnson@example.com",
  "password": "EmmaPass123",
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art"
}
```

**Response:**
```json
{
  "id": "kid-uuid",
  "name": "Emma Johnson",
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art",
  "parentId": "parent-uuid",
  "userId": "emma-user-uuid",
  "active": true,
  "createdAt": "2025-10-21T...",
  "updatedAt": "2025-10-21T..."
}
```

**Step 4: Parent Views All Kids**
```bash
GET /kids
Authorization: Bearer <parent_jwt_token>
```

### Kid's Perspective

**Step 1: Kid Logs In**
```bash
POST /auth/login
{
  "email": "emma.johnson@example.com",
  "password": "EmmaPass123"
}
```

**Response:**
```json
{
  "access_token": "kid-jwt-token",
  "user": {
    "id": "emma-user-uuid",
    "email": "emma.johnson@example.com",
    "userType": "child",
    "firstName": "Emma",
    "lastName": "Johnson"
  }
}
```

**Step 2: Kid Views Their Profile**
```bash
GET /kids/me/profile
Authorization: Bearer <kid_jwt_token>
```

**Response:**
```json
{
  "id": "kid-uuid",
  "name": "Emma Johnson",
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art",
  "parentId": "parent-uuid",
  "userId": "emma-user-uuid",
  "user": {
    "id": "emma-user-uuid",
    "email": "emma.johnson@example.com",
    "userType": "child",
    "firstName": "Emma",
    "lastName": "Johnson"
  },
  "parent": {
    "id": "parent-uuid",
    "email": "parent@example.com",
    "userType": "parent",
    "firstName": "...",
    "lastName": "..."
  }
}
```

## Database Relationships

```
User (Parent)
  ├─ userType: "parent"
  └─ kids: []
      ├─ Kid 1
      │   ├─ parentId → User (Parent)
      │   └─ userId → User (Kid 1 Account)
      │       └─ userType: "child"
      └─ Kid 2
          ├─ parentId → User (Parent)
          └─ userId → User (Kid 2 Account)
              └─ userType: "child"
```

## Security Features

### For Parents:
- ✅ Can only view/edit/delete their own kids
- ✅ Cannot access other parents' kids
- ✅ Email uniqueness enforced (no duplicate accounts)

### For Kids:
- ✅ Can only view their own profile
- ✅ Cannot create or manage other kids
- ✅ Cannot access parent's CRUD operations

### Password Security:
- ✅ Minimum 6 characters
- ✅ Automatically hashed with bcryptjs (10 rounds)
- ✅ Never stored in plain text
- ✅ Never returned in API responses

## Common Scenarios

### Scenario 1: Parent Deletes a Kid
When a parent deletes a kid:
1. Kid's user account is deleted
2. Kid record is deleted
3. Kid can no longer login
4. All data is removed (CASCADE)

### Scenario 2: Duplicate Email
If parent tries to create a kid with an existing email:
- ❌ Returns `409 Conflict`
- ❌ Kid is not created
- ✅ Error message: "Email already exists"

### Scenario 3: Weak Password
If password is less than 6 characters:
- ❌ Returns `400 Bad Request`
- ❌ Kid is not created
- ✅ Error message: "Password must be at least 6 characters long"

## Testing Tips

### Test Parent Flow
1. Register as parent
2. Login as parent
3. Create multiple kids
4. List all kids
5. Update a kid
6. Delete a kid

### Test Kid Flow
1. Use kid credentials from parent creation
2. Login as kid
3. View profile
4. Try to create another kid (should fail with 403)
5. Try to view parent's kids list (should fail with 403)

### Test Security
1. Try to create kid without login (should fail with 401)
2. Try to use kid's token to create another kid (should fail with 403)
3. Try duplicate email (should fail with 409)
4. Try weak password (should fail with 400)

## API Endpoints Summary

| Endpoint | Method | User Type | Description |
|----------|--------|-----------|-------------|
| `/auth/register` | POST | - | Register new user |
| `/auth/login` | POST | - | Login (parent or kid) |
| `/kids` | POST | parent | Create kid + user account |
| `/kids` | GET | parent | List all parent's kids |
| `/kids/:id` | GET | parent | Get specific kid |
| `/kids/:id` | PATCH | parent | Update kid |
| `/kids/:id` | DELETE | parent | Delete kid + user account |
| `/kids/me/profile` | GET | child | Kid views own profile |

## Notes

- Kids automatically get `userType = 'child'` on creation
- Kids cannot be upgraded to parent (security)
- Password changes not yet implemented (future feature)
- Email changes not yet implemented (future feature)
- Parent cannot change kid's email/password after creation (future feature)


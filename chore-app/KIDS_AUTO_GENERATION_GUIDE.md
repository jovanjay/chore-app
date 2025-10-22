# Kids Auto-Generated Email & Password Guide

## Overview

The system automatically generates email and password for kids when a parent creates them. This simplifies the onboarding process and ensures consistent credential management.

## How It Works

### Email Auto-Generation

Kid emails are automatically generated from the parent's email using the **"+" alias pattern**:

**Pattern:** `parent+{number}@domain.com`

**Examples:**
- Parent: `john.smith@gmail.com`
  - Kid 1: `john.smith+1@gmail.com`
  - Kid 2: `john.smith+2@gmail.com`
  - Kid 3: `john.smith+3@gmail.com`

**Benefits:**
- ✅ Works with most email providers (Gmail, Outlook, etc.)
- ✅ All emails deliver to parent's inbox
- ✅ Easy to filter and organize
- ✅ Unique for each kid
- ✅ No need to create separate email accounts

### Password Auto-Generation

Passwords are automatically generated with:
- **Length:** 12 characters
- **Composition:**
  - At least 1 uppercase letter (A-Z)
  - At least 1 lowercase letter (a-z)
  - At least 1 number (0-9)
  - At least 1 special character (!@#$%^&*)
- **Example:** `K3r@Xm9pL#t2`

**Benefits:**
- ✅ Strong and secure
- ✅ Meets password complexity requirements
- ✅ No need for parent to think of passwords
- ✅ Returned to parent immediately after creation

## API Usage

### Create a Kid (Simplified)

**Before (Old Way):**
```json
POST /kids
{
  "name": "Emma Johnson",
  "email": "emma@example.com",         ❌ Parent had to provide
  "password": "SomePassword123",       ❌ Parent had to provide
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female"
}
```

**After (New Way):**
```json
POST /kids
{
  "name": "Emma Johnson",              ✅ Required
  "dateOfBirth": "2014-03-20",        ✅ Optional
  "age": 10,                          ✅ Optional
  "gender": "female",                 ✅ Optional
  "notes": "Loves reading"            ✅ Optional
}
```

### Response with Generated Credentials

```json
{
  "id": "kid-uuid-here",
  "name": "Emma Johnson",
  "email": "parent+1@example.com",     ✅ Auto-generated
  "password": "K3r@Xm9pL#t2",         ✅ Auto-generated (shown only once!)
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading",
  "parentId": "parent-uuid",
  "userId": "kid-user-uuid",
  "active": true,
  "createdAt": "2025-10-21T...",
  "updatedAt": "2025-10-21T..."
}
```

⚠️ **Important:** The password is only shown **once** in the creation response. Make sure to save it securely!

## Complete Example Workflow

### Step 1: Parent Registers
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "email": "sarah.johnson@gmail.com",
  "password": "ParentPass123!",
  "confirmPassword": "ParentPass123!"
}
```

### Step 2: Parent Logs In
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "sarah.johnson@gmail.com",
  "password": "ParentPass123!"
}

# Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "parent-uuid",
    "email": "sarah.johnson@gmail.com",
    "userType": "parent"
  }
}
```

### Step 3: Parent Creates First Kid
```bash
POST http://localhost:3000/kids
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Emma Johnson",
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art"
}

# Response:
{
  "id": "kid1-uuid",
  "name": "Emma Johnson",
  "email": "sarah.johnson+1@gmail.com",    ⬅️ Auto-generated
  "password": "K3r@Xm9pL#t2",             ⬅️ Auto-generated (save this!)
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art",
  "parentId": "parent-uuid",
  "userId": "kid1-user-uuid",
  "active": true,
  "createdAt": "2025-10-21T06:21:00Z",
  "updatedAt": "2025-10-21T06:21:00Z"
}
```

### Step 4: Parent Creates Second Kid
```bash
POST http://localhost:3000/kids
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Jake Johnson",
  "dateOfBirth": "2016-07-15",
  "age": 8,
  "gender": "male",
  "notes": "Loves sports"
}

# Response:
{
  "id": "kid2-uuid",
  "name": "Jake Johnson",
  "email": "sarah.johnson+2@gmail.com",    ⬅️ Auto-generated (+2)
  "password": "P9m@Rt5nK#w8",             ⬅️ Auto-generated (different)
  "dateOfBirth": "2016-07-15",
  "age": 8,
  "gender": "male",
  "notes": "Loves sports",
  "parentId": "parent-uuid",
  "userId": "kid2-user-uuid",
  "active": true,
  "createdAt": "2025-10-21T06:22:00Z",
  "updatedAt": "2025-10-21T06:22:00Z"
}
```

### Step 5: Kid Logs In
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "sarah.johnson+1@gmail.com",
  "password": "K3r@Xm9pL#t2"
}

# Response:
{
  "access_token": "kid-jwt-token-here",
  "user": {
    "id": "kid1-user-uuid",
    "email": "sarah.johnson+1@gmail.com",
    "userType": "child",
    "firstName": "Emma",
    "lastName": "Johnson"
  }
}
```

### Step 6: Kid Views Their Profile
```bash
GET http://localhost:3000/kids/me/profile
Authorization: Bearer kid-jwt-token-here

# Response:
{
  "id": "kid1-uuid",
  "name": "Emma Johnson",
  "dateOfBirth": "2014-03-20",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading and art",
  "parentId": "parent-uuid",
  "userId": "kid1-user-uuid",
  "user": {
    "id": "kid1-user-uuid",
    "email": "sarah.johnson+1@gmail.com",
    "userType": "child",
    "firstName": "Emma",
    "lastName": "Johnson"
  },
  "parent": {
    "id": "parent-uuid",
    "email": "sarah.johnson@gmail.com",
    "userType": "parent",
    "firstName": "Sarah",
    "lastName": "Johnson"
  }
}
```

## Email Delivery

### How Email Aliasing Works

Most email providers treat `username+anything@domain.com` as an alias of `username@domain.com`.

**Supported Providers:**
- ✅ Gmail
- ✅ Outlook/Hotmail
- ✅ ProtonMail
- ✅ Yahoo Mail
- ✅ iCloud Mail
- ✅ Most corporate email servers

**Example:**
All these emails deliver to the same inbox:
- `sarah.johnson@gmail.com`
- `sarah.johnson+1@gmail.com`
- `sarah.johnson+2@gmail.com`
- `sarah.johnson+anything@gmail.com`

### Benefits for Parents

1. **Single Inbox**: All kid-related emails come to parent's inbox
2. **Easy Filtering**: Set up filters based on `+1`, `+2`, etc.
3. **No Separate Accounts**: Don't need to create real email accounts for kids
4. **Organization**: Keep track of which kid gets what emails

## Security Features

### Password Strength
- ✅ 12 characters minimum
- ✅ Mixed case (upper and lower)
- ✅ Numbers and special characters
- ✅ Randomly generated (not predictable)
- ✅ Hashed with bcrypt (10 rounds)

### Credential Management
- ✅ Email uniqueness validated
- ✅ Password shown only once (on creation)
- ✅ Cannot retrieve password later (by design)
- ⚠️ Parent must save password securely

## Best Practices

### For Parents
1. **Save Credentials Immediately**: Copy the email and password when kid is created
2. **Use a Password Manager**: Store kid credentials in a secure password manager
3. **Share Safely**: Give credentials to kids through secure means (not SMS/email)
4. **Keep Record**: Maintain a list of which kid has which email (+1, +2, etc.)

### For Implementation
1. **Display Credentials Clearly**: Show email and password prominently in UI
2. **Copy to Clipboard**: Provide easy copy buttons
3. **Print/Export Option**: Allow parents to print or export credentials
4. **Confirmation**: Require parent to confirm they've saved credentials

## Troubleshooting

### Kid Can't Login
**Check:**
1. Email is correct (check the +number)
2. Password is correct (case-sensitive)
3. Account is active
4. No typos in credentials

### Email Already Exists
**Scenario:** Very rare, but if somehow the generated email exists:
- System returns `409 Conflict`
- Error: "Generated email already exists"
- Solution: Try creating the kid again (will increment to next number)

### Lost Password
**Current Status:** No password reset feature yet
**Workaround:** 
1. Parent deletes the kid
2. Parent creates kid again (new credentials will be generated)

## Future Enhancements

Potential features to add:
- [ ] Password reset functionality for kids
- [ ] Parent can regenerate kid's password
- [ ] Email verification (send to parent's email)
- [ ] Credential history/audit log
- [ ] Custom email pattern option
- [ ] Export credentials to PDF

## API Endpoints Summary

| Endpoint | Method | User | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | - | Parent registers |
| `/auth/login` | POST | - | Parent or kid logs in |
| `/kids` | POST | parent | Create kid (auto-generate email+password) |
| `/kids` | GET | parent | List all kids |
| `/kids/:id` | GET | parent | Get specific kid |
| `/kids/me/profile` | GET | child | Kid views own profile |
| `/kids/:id` | PATCH | parent | Update kid |
| `/kids/:id` | DELETE | parent | Delete kid |

## Response Fields

### CreateKidDto (Request)
```typescript
{
  name: string;              // Required - Kid's full name
  dateOfBirth?: string;      // Optional - ISO date (YYYY-MM-DD)
  age?: number;              // Optional - 0-18
  gender?: string;           // Optional - male/female/other
  notes?: string;            // Optional - Any notes
}
```

### KidResponseDto (Response)
```typescript
{
  id: string;
  name: string;
  email: string;             // Auto-generated
  password?: string;         // Auto-generated (only on create)
  dateOfBirth?: Date;
  age?: number;
  gender?: string;
  notes?: string;
  parentId: string;
  userId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Notes

- Password is **only returned once** during creation
- Password is **never stored in plain text**
- Password **cannot be retrieved later** (must be reset)
- Email format uses standard "+" aliasing
- Incremental number based on existing kids count
- If kid is deleted and recreated, might reuse same number


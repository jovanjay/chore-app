# Chore Many-to-Many Assignment Guide

## Overview

Chores now support **many-to-many relationships** with kids. This means:
- ✅ A chore can be assigned to **multiple kids**
- ✅ A kid can have **multiple chores** assigned to them
- ✅ Chores can be created **without assignments** and assigned later
- ✅ Kids can be **added or removed** from chore assignments dynamically

## Database Changes

### Join Table

A new join table `chore_assignments` is automatically created:

```sql
CREATE TABLE chore_assignments (
  choreId UUID REFERENCES chore(id),
  kidId UUID REFERENCES kids(id),
  PRIMARY KEY (choreId, kidId)
);
```

### Relationships

**Chore Entity:**
```typescript
@ManyToMany(() => Kids, (kid) => kid.chores)
@JoinTable({ name: 'chore_assignments' })
assignedKids: Kids[];
```

**Kids Entity:**
```typescript
@ManyToMany(() => Chore, (chore) => chore.assignedKids)
chores: Chore[];
```

## API Changes

### 1. Create Chore (Updated)

**Before:**
```json
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep and organize",
  "kidId": "single-kid-uuid"  ❌ Only one kid
}
```

**After:**
```json
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep and organize",
  "kidIds": ["kid1-uuid", "kid2-uuid"]  ✅ Multiple kids (optional)
}
```

**Or create without assignment:**
```json
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep and organize"
  // No kidIds - assign later
}
```

### 2. Assign Kids to Chore (NEW)

```
PUT /chores/:id/assign
Authorization: Bearer <parent_token>
```

**Request:**
```json
{
  "kidIds": ["kid1-uuid", "kid2-uuid", "kid3-uuid"]
}
```

**Response:**
```json
{
  "id": "chore-uuid",
  "title": "Clean garage",
  "assignedKids": [
    {
      "id": "kid1-uuid",
      "name": "Emma Johnson"
    },
    {
      "id": "kid2-uuid",
      "name": "Jake Johnson"
    },
    {
      "id": "kid3-uuid",
      "name": "Sophie Johnson"
    }
  ],
  ...
}
```

**Features:**
- ✅ Adds new kids to existing assignments
- ✅ Prevents duplicate assignments
- ✅ Validates all kids belong to parent

### 3. Unassign Kid from Chore (NEW)

```
DELETE /chores/:id/assign/:kidId
Authorization: Bearer <parent_token>
```

**Features:**
- ✅ Removes specific kid from chore
- ✅ Other kids remain assigned
- ✅ Parent-only operation

### 4. Get All Chores (Updated)

**Response now includes assignedKids:**
```json
GET /chores
[
  {
    "id": "chore-uuid",
    "title": "Clean garage",
    "assignedKids": [
      {
        "id": "kid1-uuid",
        "name": "Emma Johnson",
        "user": {
          "email": "parent+1@gmail.com"
        }
      },
      {
        "id": "kid2-uuid",
        "name": "Jake Johnson",
        "user": {
          "email": "parent+2@gmail.com"
        }
      }
    ],
    ...
  }
]
```

### 5. Get Single Chore (Updated)

**Response includes all assigned kids:**
```json
GET /chores/:id
{
  "id": "chore-uuid",
  "title": "Clean garage",
  "assignedKids": [
    { "id": "kid1-uuid", "name": "Emma Johnson" },
    { "id": "kid2-uuid", "name": "Jake Johnson" }
  ],
  ...
}
```

## Complete Examples

### Example 1: Create with Assignments

```bash
# Parent creates chore and assigns two kids immediately
POST /chores
Authorization: Bearer <parent_token>
{
  "title": "Wash dishes",
  "description": "Wash, dry, and put away all dinner dishes",
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# Response:
{
  "id": "chore-123",
  "title": "Wash dishes",
  "status": "created",
  "assignedKids": [
    { "id": "emma-uuid", "name": "Emma Johnson" },
    { "id": "jake-uuid", "name": "Jake Johnson" }
  ],
  ...
}
```

### Example 2: Create Then Assign Later

```bash
# Step 1: Parent creates chore without assignment
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep and organize tools"
}

# Response:
{
  "id": "chore-456",
  "title": "Clean garage",
  "status": "created",
  "assignedKids": [],  # Empty
  ...
}

# Step 2: Parent assigns kids later
PUT /chores/chore-456/assign
{
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# Response:
{
  "id": "chore-456",
  "assignedKids": [
    { "id": "emma-uuid", "name": "Emma Johnson" },
    { "id": "jake-uuid", "name": "Jake Johnson" }
  ],
  ...
}
```

### Example 3: Add More Kids

```bash
# Chore already has Emma assigned
# Parent adds Jake and Sophie

PUT /chores/chore-456/assign
{
  "kidIds": ["jake-uuid", "sophie-uuid"]
}

# Response:
{
  "id": "chore-456",
  "assignedKids": [
    { "id": "emma-uuid", "name": "Emma Johnson" },      # Existing
    { "id": "jake-uuid", "name": "Jake Johnson" },      # Added
    { "id": "sophie-uuid", "name": "Sophie Johnson" }   # Added
  ],
  ...
}
```

### Example 4: Remove a Kid

```bash
# Remove Jake from the chore
DELETE /chores/chore-456/assign/jake-uuid
Authorization: Bearer <parent_token>

# Response:
{
  "id": "chore-456",
  "assignedKids": [
    { "id": "emma-uuid", "name": "Emma Johnson" },      # Remains
    { "id": "sophie-uuid", "name": "Sophie Johnson" }   # Remains
    # Jake removed
  ],
  ...
}
```

### Example 5: Shared Chore Workflow

```bash
# Scenario: Parents assigns "Clean garage" to Emma and Jake
# Both kids need to work together

# 1. Parent creates shared chore
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep, organize tools, and clean shelves",
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# 2. Emma logs in and starts
POST /auth/login
{ "email": "parent+1@gmail.com", "password": "EmmaPass" }

GET /chores  # Emma sees the shared chore
PUT /chores/chore-456/status
{ "status": "started" }

# 3. Jake also sees the same chore
POST /auth/login
{ "email": "parent+2@gmail.com", "password": "JakePass" }

GET /chores  # Jake sees the same chore (status: "started")

# 4. When done, either kid can finish
PUT /chores/chore-456/status
{
  "status": "finished",
  "photo": "https://example.com/garage-clean.jpg"
}

# 5. Parent approves
PUT /chores/chore-456/status
{ "status": "approved" }
```

## Use Cases

### Use Case 1: Team Chores

```
Chore: "Clean the house"
Assigned to: Emma (living room), Jake (kitchen), Sophie (bathroom)

All three kids see the same chore
They coordinate and complete together
One chore, multiple kids working
```

### Use Case 2: Weekly Rotation

```
Week 1: "Take out trash" → Emma
Week 2: "Take out trash" → Jake  
(Parent unassigns Emma, assigns Jake)
```

### Use Case 3: Big Project

```
Chore: "Organize garage sale"
Assigned to: All kids

Kids work together on big task
Parent can see everyone is assigned
Single approval for team effort
```

### Use Case 4: Optional Assignment

```
1. Parent creates chore without kids
2. Parent assigns later based on availability
3. Parent can add/remove kids as needed
```

## Kid's View

**When kid logs in:**
```bash
GET /chores
Authorization: Bearer <kid_token>

# Kid sees all chores assigned to them
[
  {
    "id": "chore-1",
    "title": "Wash dishes",
    "assignedKids": [
      { "id": "this-kid-uuid", "name": "Emma" },
      { "id": "other-kid-uuid", "name": "Jake" }  # Can see who else is assigned
    ],
    "status": "created"
  },
  {
    "id": "chore-2",
    "title": "Clean room",
    "assignedKids": [
      { "id": "this-kid-uuid", "name": "Emma" }  # Solo chore
    ],
    "status": "started"
  }
]
```

**Kid can:**
- ✅ See all chores assigned to them
- ✅ See who else is assigned (teammates)
- ✅ Start shared chores
- ✅ Finish shared chores
- ✅ Upload proof photo
- ❌ Cannot see chores assigned only to siblings
- ❌ Cannot assign/unassign themselves

## Validation & Rules

### Assignment Validation

1. **Parent Must Own Kids**
   ```
   ❌ Cannot assign other parent's kids
   ✅ Can only assign own kids
   ```

2. **No Duplicate Assignments**
   ```
   If kid already assigned, system ignores duplicate
   assignKids() adds only new kids
   ```

3. **Kid Must Be Assigned to Interact**
   ```
   ❌ Kid cannot start chore they're not assigned to
   ❌ Kid cannot finish chore they're not assigned to
   ✅ Kid can only interact with their assigned chores
   ```

### Status Workflow

Status workflow **unchanged**:
```
CREATED → STARTED → FINISHED → APPROVED/REDO/REJECTED
```

**For shared chores:**
- Any assigned kid can start
- Any assigned kid can finish
- Once one kid changes status, all see same status
- Photo uploaded by any kid shows for all

## Response Structure

### Chore with Assignments

```typescript
{
  id: string;
  title: string;
  description: string;
  dateStarted: Date | null;
  status: ChoreStatus;
  photo: string | null;
  assignedKids: [
    {
      id: string;
      name: string;
      user: {
        id: string;
        email: string;
      }
    }
  ];
  parent: {
    id: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Updated Endpoints Summary

| Method | Endpoint | Description | Changed? |
|--------|----------|-------------|----------|
| `POST` | `/chores` | Create chore (now accepts kidIds array) | ✅ Updated |
| `GET` | `/chores` | List chores (now includes assignedKids) | ✅ Updated |
| `GET` | `/chores/:id` | Get chore (now includes assignedKids) | ✅ Updated |
| `PATCH` | `/chores/:id` | Update chore details | Same |
| `PUT` | `/chores/:id/status` | Change status | Same |
| `PUT` | `/chores/:id/photo` | Upload photo | Same |
| `PUT` | `/chores/:id/assign` | Assign kids to chore | ✅ NEW |
| `DELETE` | `/chores/:id/assign/:kidId` | Unassign kid | ✅ NEW |
| `DELETE` | `/chores/:id` | Delete chore | Same |

## Migration Notes

### Breaking Changes

**⚠️ API Breaking Changes:**

1. **CreateChoreDto:**
   - `kidId` (single) → `kidIds` (array, optional)
   
2. **UpdateChoreDto:**
   - Removed `kidId` field (use assign/unassign instead)

3. **Response Structure:**
   - `kid` object → `assignedKids` array
   - `kidId` → removed (use assignedKids array)

### Migration Steps

**For Existing Code:**

```javascript
// OLD CODE
const createChore = {
  title: "Clean room",
  description: "Vacuum and dust",
  kidId: "kid-uuid"  ❌ Old field
};

// NEW CODE
const createChore = {
  title: "Clean room",
  description: "Vacuum and dust",
  kidIds: ["kid-uuid"]  ✅ New array field
};

// Or create then assign
const createChore = {
  title: "Clean room",
  description: "Vacuum and dust"
  // No kidIds
};

// Then assign later
await assignKids(choreId, { kidIds: ["kid-uuid"] });
```

## Benefits

### For Parents

1. ✅ **Flexible Assignment**: Assign chores to one or multiple kids
2. ✅ **Team Building**: Kids work together on shared tasks
3. ✅ **Dynamic Management**: Add/remove kids as needed
4. ✅ **Fair Distribution**: Easily see who has what

### For Kids

1. ✅ **Collaboration**: Work with siblings on shared chores
2. ✅ **Visibility**: See who else is assigned
3. ✅ **Fairness**: Know everyone's responsibilities
4. ✅ **Teamwork**: Learn to cooperate

### For System

1. ✅ **Scalability**: Support families with many kids
2. ✅ **Flexibility**: Adapt to different chore patterns
3. ✅ **Data Integrity**: Proper many-to-many relationship
4. ✅ **Query Efficiency**: Optimized with join tables

## Database Schema

```sql
-- Chore table (unchanged structure)
CREATE TABLE chore (
  id UUID PRIMARY KEY,
  title VARCHAR(200),
  description TEXT,
  dateStarted DATETIME,
  status ENUM(...),
  photo TEXT,
  active BOOLEAN,
  parentId UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES user(id)
);

-- Kids table (unchanged structure)
CREATE TABLE kids (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  parentId UUID,
  userId UUID,
  ...
);

-- NEW: Join table for many-to-many
CREATE TABLE chore_assignments (
  choreId UUID,
  kidId UUID,
  PRIMARY KEY (choreId, kidId),
  FOREIGN KEY (choreId) REFERENCES chore(id) ON DELETE CASCADE,
  FOREIGN KEY (kidId) REFERENCES kids(id) ON DELETE CASCADE
);
```

## Performance Considerations

- ✅ Join table indexed on both columns
- ✅ Cascade deletes handled automatically
- ✅ Queries optimized with proper relations
- ✅ No N+1 query problems

## Testing Examples

```bash
# Test 1: Create with multiple kids
curl -X POST http://localhost:3000/chores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Chore",
    "description": "Test Description",
    "kidIds": ["kid1-uuid", "kid2-uuid"]
  }'

# Test 2: Assign more kids
curl -X PUT http://localhost:3000/chores/chore-uuid/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"kidIds": ["kid3-uuid"]}'

# Test 3: Unassign a kid
curl -X DELETE http://localhost:3000/chores/chore-uuid/assign/kid2-uuid \
  -H "Authorization: Bearer $TOKEN"

# Test 4: Kid views assigned chores
curl -X GET http://localhost:3000/chores \
  -H "Authorization: Bearer $KID_TOKEN"
```

## Summary

The many-to-many relationship provides:
- ✅ **Flexibility**: Create chores with or without assignments
- ✅ **Collaboration**: Multiple kids can work together
- ✅ **Scalability**: Support large families
- ✅ **Control**: Dynamic add/remove assignments
- ✅ **Data Integrity**: Proper relational structure

Perfect for managing household chores in families with multiple children! 🎉


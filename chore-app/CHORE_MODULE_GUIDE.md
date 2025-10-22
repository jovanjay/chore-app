# Chore Module - Complete Guide

## Overview

The Chore module allows parents to create and assign chores to their kids with a complete workflow system. Kids can start chores, mark them as finished with photo proof, and parents can approve, reject, or ask for redo.

## Chore Entity

### Fields

```typescript
{
  id: string;                    // UUID
  title: string;                 // Chore title (max 200 chars)
  description: string;           // Detailed description
  dateStarted: Date;             // When kid started the chore
  status: ChoreStatus;           // Current workflow status
  photo: string;                 // Photo URL/path (proof of completion)
  active: boolean;               // Is chore active (default: true)
  createdAt: Date;               // When chore was created
  updatedAt: Date;               // Last update timestamp
  kidId: string;                 // Assigned kid (FK)
  parentId: string;              // Parent who created (FK)
}
```

## Workflow Status System

### Status Values

| Status | Description | Who Can Set |
|--------|-------------|-------------|
| `created` | Initial state - parent just created the chore | System (auto) |
| `started` | Kid started working on the chore | Kid |
| `finished` | Kid completed and submitted for approval | Kid |
| `approved` | Parent approved the completed chore | Parent |
| `redo` | Parent asked kid to redo the chore | Parent |
| `rejected` | Parent rejected the chore | Parent |

### Workflow Diagram

```
Parent Creates Chore
        ↓
    [CREATED]
        ↓ (kid starts)
    [STARTED]
        ↓ (kid finishes + uploads photo)
    [FINISHED]
        ↓
    ┌───────┼───────┐
    ↓       ↓       ↓
[APPROVED] [REDO] [REJECTED]
            ↓
        [STARTED] (kid starts again)
```

### Status Transition Rules

**Kid Actions:**
- Can change `created` → `started`
- Can change `redo` → `started`
- Can change `started` → `finished`
- ❌ Cannot approve, redo, or reject

**Parent Actions:**
- Can change `finished` → `approved`
- Can change `finished` → `redo`
- Can change `finished` → `rejected`
- ❌ Cannot start or finish chores

## API Endpoints

All endpoints require JWT authentication.

### 1. Create Chore (Parent Only)

```
POST /chores
Authorization: Bearer <parent_token>
```

**Request Body:**
```json
{
  "title": "Clean your room",
  "description": "Vacuum, dust, and organize toys",
  "kidId": "kid-uuid-here"
}
```

**Response:**
```json
{
  "id": "chore-uuid",
  "title": "Clean your room",
  "description": "Vacuum, dust, and organize toys",
  "dateStarted": null,
  "status": "created",
  "photo": null,
  "active": true,
  "kidId": "kid-uuid-here",
  "parentId": "parent-uuid",
  "createdAt": "2025-10-21T07:39:00Z",
  "updatedAt": "2025-10-21T07:39:00Z"
}
```

### 2. Get All Chores

```
GET /chores
Authorization: Bearer <token>
```

**Behavior:**
- **Parent**: Returns all chores they created
- **Kid**: Returns only chores assigned to them

**Response:**
```json
[
  {
    "id": "chore-uuid-1",
    "title": "Clean your room",
    "status": "started",
    "kid": {
      "id": "kid-uuid",
      "name": "Emma Johnson",
      "user": {
        "email": "parent+1@gmail.com"
      }
    },
    ...
  },
  {
    "id": "chore-uuid-2",
    "title": "Take out trash",
    "status": "finished",
    ...
  }
]
```

### 3. Get Single Chore

```
GET /chores/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "chore-uuid",
  "title": "Clean your room",
  "description": "Vacuum, dust, and organize toys",
  "dateStarted": "2025-10-21T08:00:00Z",
  "status": "started",
  "photo": null,
  "kid": {
    "id": "kid-uuid",
    "name": "Emma Johnson"
  },
  "parent": {
    "id": "parent-uuid",
    "email": "parent@gmail.com"
  },
  ...
}
```

### 4. Update Chore (Parent Only)

```
PATCH /chores/:id
Authorization: Bearer <parent_token>
```

**Request Body:**
```json
{
  "title": "Clean your room thoroughly",
  "description": "Vacuum, dust, organize toys, and make bed",
  "kidId": "different-kid-uuid"
}
```

**Note:** All fields are optional. Parent can reassign to different kid.

### 5. Change Status (Parent or Kid)

```
PUT /chores/:id/status
Authorization: Bearer <token>
```

**Kid Starts Chore:**
```json
{
  "status": "started"
}
```

**Kid Finishes Chore:**
```json
{
  "status": "finished",
  "photo": "https://example.com/proof.jpg"
}
```

**Parent Approves:**
```json
{
  "status": "approved"
}
```

**Parent Asks for Redo:**
```json
{
  "status": "redo"
}
```

**Parent Rejects:**
```json
{
  "status": "rejected"
}
```

**Response:**
```json
{
  "id": "chore-uuid",
  "title": "Clean your room",
  "status": "approved",
  "dateStarted": "2025-10-21T08:00:00Z",
  "photo": "https://example.com/proof.jpg",
  ...
}
```

### 6. Upload Photo (Kid Only)

```
PUT /chores/:id/photo
Authorization: Bearer <kid_token>
```

**Request Body:**
```json
{
  "photo": "https://example.com/proof.jpg"
}
```

**Note:** Kid can upload/update photo separately from status change.

### 7. Delete Chore (Parent Only)

```
DELETE /chores/:id
Authorization: Bearer <parent_token>
```

**Response:** `200 OK` (no body)

## Complete Workflow Example

### Parent Creates & Assigns Chore

```bash
# 1. Parent logs in
POST /auth/login
{
  "email": "sarah@gmail.com",
  "password": "ParentPass123!"
}
# Save the access_token

# 2. Parent creates chore
POST /chores
Authorization: Bearer <parent_token>
{
  "title": "Wash dishes",
  "description": "Wash, dry, and put away all dinner dishes",
  "kidId": "emma-kid-uuid"
}

# Response:
{
  "id": "chore-123",
  "status": "created",
  ...
}
```

### Kid Starts & Completes Chore

```bash
# 3. Kid logs in
POST /auth/login
{
  "email": "sarah+1@gmail.com",
  "password": "Kh3e@r7w"
}
# Save the kid_access_token

# 4. Kid views their chores
GET /chores
Authorization: Bearer <kid_token>

# 5. Kid starts the chore
PUT /chores/chore-123/status
Authorization: Bearer <kid_token>
{
  "status": "started"
}

# Response:
{
  "id": "chore-123",
  "status": "started",
  "dateStarted": "2025-10-21T14:00:00Z",
  ...
}

# 6. Kid finishes and uploads photo
PUT /chores/chore-123/status
Authorization: Bearer <kid_token>
{
  "status": "finished",
  "photo": "https://imgur.com/abc123.jpg"
}

# Response:
{
  "id": "chore-123",
  "status": "finished",
  "photo": "https://imgur.com/abc123.jpg",
  ...
}
```

### Parent Reviews & Approves

```bash
# 7. Parent reviews chores
GET /chores
Authorization: Bearer <parent_token>

# 8. Parent approves
PUT /chores/chore-123/status
Authorization: Bearer <parent_token>
{
  "status": "approved"
}

# Response:
{
  "id": "chore-123",
  "status": "approved",
  "photo": "https://imgur.com/abc123.jpg",
  ...
}
```

### Alternative: Parent Asks for Redo

```bash
# If parent not satisfied
PUT /chores/chore-123/status
Authorization: Bearer <parent_token>
{
  "status": "redo"
}

# Kid can then start again:
PUT /chores/chore-123/status
Authorization: Bearer <kid_token>
{
  "status": "started"
}
```

## Validation Rules

### Status Transition Validation

**Kid Attempting Invalid Transitions:**
```
❌ created → approved (Only parent can approve)
❌ started → approved (Kid can only finish)
❌ finished → rejected (Only parent can reject)
```

**Parent Attempting Invalid Transitions:**
```
❌ created → started (Only kid can start)
❌ created → approved (Must wait for kid to finish)
❌ started → finished (Only kid can finish)
```

### Proper Transitions

**Kid:**
- ✅ `created` → `started`
- ✅ `redo` → `started`
- ✅ `started` → `finished`

**Parent:**
- ✅ `finished` → `approved`
- ✅ `finished` → `redo`
- ✅ `finished` → `rejected`

## Error Responses

### Common Errors

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden - Wrong User Type**
```json
{
  "statusCode": 403,
  "message": "Only parents can create chores"
}
```

**403 Forbidden - Invalid Status Transition**
```json
{
  "statusCode": 400,
  "message": "Kids can only start or finish chores"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Chore not found"
}
```

**404 Not Found - Kid Doesn't Belong to Parent**
```json
{
  "statusCode": 404,
  "message": "Kid not found or does not belong to you"
}
```

**400 Bad Request - Invalid Transition**
```json
{
  "statusCode": 400,
  "message": "Can only finish chores that are started"
}
```

## Database Relationships

```
User (Parent)
  ├─ userType: "parent"
  └─ createdChores: []
      ├─ Chore 1
      │   ├─ assignedTo → Kid 1
      │   ├─ status: "approved"
      │   └─ photo: "url"
      └─ Chore 2
          ├─ assignedTo → Kid 2
          ├─ status: "started"
          └─ photo: null

Kid
  ├─ assignedChores: []
  │   ├─ Chore 1 (status: "finished")
  │   └─ Chore 3 (status: "started")
  └─ parent → User (Parent)
```

## Photo Handling

### Photo Upload Options

1. **During Status Change (Recommended)**
   ```json
   PUT /chores/:id/status
   {
     "status": "finished",
     "photo": "https://example.com/photo.jpg"
   }
   ```

2. **Separate Photo Upload**
   ```json
   PUT /chores/:id/photo
   {
     "photo": "https://example.com/photo.jpg"
   }
   ```

### Photo Formats

The `photo` field can contain:
- Direct URL: `"https://imgur.com/abc123.jpg"`
- S3/Cloud Storage URL: `"https://s3.amazonaws.com/bucket/photo.jpg"`
- Base64 encoded (if storing locally): `"data:image/jpeg;base64,/9j/4AAQ..."`

**Note:** Photo validation and storage implementation depends on your file upload strategy.

## Security Features

### Access Control

1. **Parent Can:**
   - ✅ Create chores for their kids only
   - ✅ View all their created chores
   - ✅ Update chore details
   - ✅ Approve/reject/request redo
   - ✅ Delete chores
   - ❌ Cannot access other parents' chores

2. **Kid Can:**
   - ✅ View chores assigned to them only
   - ✅ Start chores
   - ✅ Finish chores
   - ✅ Upload proof photos
   - ❌ Cannot create/delete chores
   - ❌ Cannot approve/reject
   - ❌ Cannot see other kids' chores

### Validation

- Parent can only assign chores to their own kids
- Status transitions are strictly enforced
- Kids cannot change status of chores assigned to other kids
- Parents cannot change status of other parents' chores

## Use Cases

### Use Case 1: Daily Chore

```
1. Parent creates "Make your bed" chore
2. Kid starts it in the morning
3. Kid finishes and uploads photo
4. Parent approves
```

### Use Case 2: Chore Needs Redo

```
1. Parent creates "Clean garage" chore
2. Kid starts and finishes
3. Parent sees photo - not satisfied
4. Parent marks as "redo"
5. Kid starts again
6. Kid finishes with better photo
7. Parent approves
```

### Use Case 3: Weekly Allowance Chores

```
1. Parent creates multiple chores
2. Kid completes them throughout week
3. Parent reviews and approves
4. Count approved chores for allowance
```

## Best Practices

### For Parents

1. **Clear Descriptions**: Provide detailed instructions
2. **Set Expectations**: Include what "done" looks like
3. **Timely Review**: Review finished chores promptly
4. **Constructive Feedback**: Use "redo" with explanation

### For Kids

1. **Read Carefully**: Understand requirements before starting
2. **Good Photos**: Take clear proof photos
3. **Complete Work**: Finish thoroughly before submitting
4. **Ask Questions**: If unclear, ask parent

### For Implementation

1. **Photo Storage**: Implement proper file upload/storage
2. **Notifications**: Add push notifications for status changes
3. **Rewards System**: Track approved chores for rewards
4. **History**: Keep audit trail of status changes

## Future Enhancements

Potential features:
- [ ] Due dates and reminders
- [ ] Recurring chores
- [ ] Points/reward system
- [ ] Multiple photos support
- [ ] Comments/feedback on chores
- [ ] Chore templates
- [ ] Analytics (completion rate, time taken)
- [ ] Push notifications
- [ ] Chore scheduling
- [ ] Family chore dashboard

## Module Structure

```
src/modules/chore/
├── dto/
│   ├── create-chore.dto.ts       # DTO for creating chore
│   ├── update-chore.dto.ts       # DTO for updating chore
│   ├── change-status.dto.ts      # DTO for status changes
│   └── upload-photo.dto.ts       # DTO for photo upload
├── chore.controller.ts            # REST API endpoints
├── chore.module.ts                # Module definition
├── chore.provider.ts              # TypeORM repository
└── chore.service.ts               # Business logic
```

## Summary

The Chore module provides a complete workflow system for managing household chores:
- ✅ Parents create and assign chores
- ✅ Kids complete chores with photo proof
- ✅ Parents review and approve
- ✅ Full workflow validation
- ✅ Secure access control
- ✅ Relationship-based permissions

Perfect for teaching responsibility and managing household tasks!


# PagChore API Reference

Complete API documentation for the Chore Management Application with Points & Rewards System.

## Base URL

```
http://localhost:3000
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

**Header:**
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "parent@example.com",
  "userType": "parent"
}
```

### Login
```
POST /auth/login
```

**Request:**
```json
{
  "email": "parent@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "parent@example.com",
    "userType": "parent",
    "firstName": "",
    "lastName": ""
  }
}
```

### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "parent@example.com",
  "userType": "parent",
  "firstName": "",
  "lastName": ""
}
```

---

## 👶 Kids Management Endpoints

### Create Kid
```
POST /kids
Authorization: Bearer <parent_token>
```

**Request:**
```json
{
  "name": "Emma Johnson",
  "dateOfBirth": "2015-05-15",
  "age": 10,
  "gender": "female",
  "notes": "Loves reading"
}
```

**Response (includes auto-generated credentials):**
```json
{
  "id": "kid-uuid",
  "name": "Emma Johnson",
  "email": "parent+1@gmail.com",      ← Auto-generated!
  "password": "Kh3e@r7w",            ← Auto-generated! (8 chars, easy to read)
  "dateOfBirth": "2015-05-15",
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

### Get All Kids (Parent)
```
GET /kids
Authorization: Bearer <parent_token>
```

### Get Kid's Profile (Kid)
```
GET /kids/me/profile
Authorization: Bearer <kid_token>
```

### Update Kid
```
PATCH /kids/:id
Authorization: Bearer <parent_token>
```

### Delete Kid
```
DELETE /kids/:id
Authorization: Bearer <parent_token>
```

---

## 📋 Chore Management Endpoints

### Create Chore
```
POST /chores
Authorization: Bearer <parent_token>
```

**Request (no kids assigned):**
```json
{
  "title": "Wash dishes",
  "description": "Wash, dry, and put away all dishes",
  "points": 10
}
```

**Request (with kids assigned):**
```json
{
  "title": "Clean garage",
  "description": "Sweep and organize",
  "points": 20,
  "kidIds": ["kid1-uuid", "kid2-uuid"]
}
```

**Response:**
```json
{
  "id": "chore-uuid",
  "title": "Clean garage",
  "description": "Sweep and organize",
  "dateStarted": null,
  "status": "created",
  "photo": null,
  "points": 20,
  "active": true,
  "parentId": "parent-uuid",
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
  "createdAt": "2025-10-21T...",
  "updatedAt": "2025-10-21T..."
}
```

### Get All Chores
```
GET /chores
Authorization: Bearer <token>
```

**Parent:** Returns all chores they created
**Kid:** Returns only chores assigned to them

### Get Single Chore
```
GET /chores/:id
Authorization: Bearer <token>
```

### Update Chore
```
PATCH /chores/:id
Authorization: Bearer <parent_token>
```

**Request:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "points": 15
}
```

### Change Chore Status
```
PUT /chores/:id/status
Authorization: Bearer <token>
```

**Kid starts:**
```json
{ "status": "started" }
```

**Kid finishes:**
```json
{
  "status": "finished",
  "photo": "https://example.com/proof.jpg"
}
```

**Parent approves (awards points!):**
```json
{ "status": "approved" }
```

**Parent asks for redo:**
```json
{ "status": "redo" }
```

**Parent rejects:**
```json
{ "status": "rejected" }
```

### Upload Photo
```
PUT /chores/:id/photo
Authorization: Bearer <kid_token>
```

**Request:**
```json
{
  "photo": "https://example.com/proof.jpg"
}
```

### Assign Kids to Chore
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

**Features:**
- Adds kids to existing assignments
- Prevents duplicates
- Can call multiple times to add more kids

### Unassign Kid from Chore
```
DELETE /chores/:id/assign/:kidId
Authorization: Bearer <parent_token>
```

**Removes specific kid from chore assignments**

### Delete Chore
```
DELETE /chores/:id
Authorization: Bearer <parent_token>
```

---

## 🎯 Points & Rewards Endpoints

### Get Available Points (Kid)
```
GET /points/available
Authorization: Bearer <kid_token>
```

**Response:**
```json
{
  "points": [
    {
      "id": "point-uuid",
      "amount": 10,
      "status": "claimable",
      "description": "Completed: Wash dishes",
      "earnedAt": "2025-10-21T12:00:00Z",
      "claimedAt": null,
      "chore": {
        "id": "chore-uuid",
        "title": "Wash dishes"
      }
    }
  ],
  "total": 10
}
```

### Get Points History (Kid)
```
GET /points/history
Authorization: Bearer <kid_token>
```

**Response:**
```json
{
  "points": [
    {
      "id": "point-1",
      "amount": 10,
      "status": "claimed",
      "earnedAt": "2025-10-21T10:00:00Z",
      "claimedAt": "2025-10-21T15:00:00Z",
      ...
    },
    {
      "id": "point-2",
      "amount": 20,
      "status": "claimable",
      "earnedAt": "2025-10-21T12:00:00Z",
      "claimedAt": null,
      ...
    }
  ],
  "totalEarned": 30,
  "totalClaimed": 10,
  "totalAvailable": 20
}
```

### View Kid's Points (Parent)
```
GET /points/kid/:kidId
Authorization: Bearer <parent_token>
```

**Response:** Same structure as history

### Claim Specific Points (Kid)
```
POST /points/claim
Authorization: Bearer <kid_token>
```

**Request:**
```json
{
  "pointIds": ["point-1", "point-2", "point-3"]
}
```

**Response:**
```json
{
  "claimedPoints": [
    {
      "id": "point-1",
      "amount": 10,
      "status": "claimed",
      "claimedAt": "2025-10-21T14:30:00Z"
    }
  ],
  "totalClaimed": 10
}
```

### Claim All Points (Kid)
```
POST /points/claim-all
Authorization: Bearer <kid_token>
```

**Response:**
```json
{
  "claimedPoints": [...],
  "totalClaimed": 50
}
```

---

## 📊 Complete Workflow Example

### Setup Phase

```bash
# 1. Parent registers
POST /auth/register
{
  "email": "sarah@gmail.com",
  "password": "ParentPass123!",
  "confirmPassword": "ParentPass123!"
}

# 2. Parent logs in
POST /auth/login
{
  "email": "sarah@gmail.com",
  "password": "ParentPass123!"
}
# Save access_token

# 3. Parent creates kids
POST /kids
{
  "name": "Emma Johnson",
  "age": 10,
  "gender": "female"
}
# Response includes:
# email: "sarah+1@gmail.com"
# password: "Kh3e@r7w"

POST /kids
{
  "name": "Jake Johnson",
  "age": 8,
  "gender": "male"
}
# Response includes:
# email: "sarah+2@gmail.com"
# password: "Qp6w#t8a"
```

### Chore Creation & Assignment

```bash
# 4. Parent creates chore worth 15 points
POST /chores
Authorization: Bearer <parent_token>
{
  "title": "Wash car",
  "description": "Wash, wax, vacuum interior",
  "points": 15,
  "kidIds": ["emma-uuid"]  # Assign to Emma
}

# 5. Parent creates shared chore
POST /chores
{
  "title": "Clean garage",
  "description": "Sweep and organize",
  "points": 25,
  "kidIds": ["emma-uuid", "jake-uuid"]  # Both kids
}
```

### Kid Completes Chore

```bash
# 6. Emma logs in
POST /auth/login
{
  "email": "sarah+1@gmail.com",
  "password": "Kh3e@r7w"
}
# Save kid_token

# 7. Emma views her chores
GET /chores
Authorization: Bearer <kid_token>
# Shows both chores (solo + shared)

# 8. Emma starts car wash
PUT /chores/car-chore-uuid/status
{
  "status": "started"
}

# 9. Emma finishes with photo
PUT /chores/car-chore-uuid/status
{
  "status": "finished",
  "photo": "https://example.com/clean-car.jpg"
}
```

### Parent Approves & Points Awarded

```bash
# 10. Parent reviews and approves
PUT /chores/car-chore-uuid/status
Authorization: Bearer <parent_token>
{
  "status": "approved"
}

# Behind the scenes:
# - Chore status → approved
# - Points record created for Emma:
#   amount: 15
#   status: claimable
#   description: "Completed: Wash car"
```

### Kid Views & Claims Points

```bash
# 11. Emma checks available points
GET /points/available
Authorization: Bearer <kid_token>

# Response:
{
  "points": [
    {
      "amount": 15,
      "status": "claimable",
      "description": "Completed: Wash car"
    }
  ],
  "total": 15
}

# 12. Emma claims points
POST /points/claim-all
Authorization: Bearer <kid_token>

# Response:
{
  "claimedPoints": [...],
  "totalClaimed": 15
}

# 13. Emma views history
GET /points/history
{
  "totalEarned": 15,
  "totalClaimed": 15,
  "totalAvailable": 0
}
```

### Parent Monitors Progress

```bash
# 14. Parent checks Emma's points
GET /points/kid/emma-uuid
Authorization: Bearer <parent_token>

# Response:
{
  "totalEarned": 15,
  "totalClaimed": 15,
  "totalAvailable": 0
}
```

---

## 🔄 Workflow States

### Chore Status Workflow

```
[CREATED] ─(kid starts)→ [STARTED] ─(kid finishes)→ [FINISHED]
                                                           │
                              ┌────────────────────────────┼─────────────────┐
                              ↓                            ↓                 ↓
                        [APPROVED]                      [REDO]          [REJECTED]
                              │                            │
                    (points awarded)                  (kid starts again)
                              │                            │
                         Kid earns points              [STARTED]...
```

### Points Lifecycle

```
Chore Approved
      ↓
Points Created (status: claimable)
      ↓
Kid Views Available Points
      ↓
Kid Claims Points
      ↓
Points Updated (status: claimed)
      ↓
Forever in History
```

---

## 📋 Complete Endpoint List

### Authentication (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new parent |
| POST | `/auth/login` | Login (parent or kid) |
| GET | `/auth/me` | Get current user info |

### Kids Management (Auth Required)
| Method | Endpoint | User | Description |
|--------|----------|------|-------------|
| POST | `/kids` | Parent | Create kid (auto-generates email/password) |
| GET | `/kids` | Parent | List all parent's kids |
| GET | `/kids/me/profile` | Kid | Kid views own profile |
| GET | `/kids/:id` | Parent | Get specific kid |
| PATCH | `/kids/:id` | Parent | Update kid info |
| DELETE | `/kids/:id` | Parent | Delete kid & user account |

### Chore Management (Auth Required)
| Method | Endpoint | User | Description |
|--------|----------|------|-------------|
| POST | `/chores` | Parent | Create chore with optional points & kids |
| GET | `/chores` | Both | List chores (filtered by user) |
| GET | `/chores/:id` | Both | Get specific chore |
| PATCH | `/chores/:id` | Parent | Update title/description/points |
| PUT | `/chores/:id/status` | Both | Change workflow status |
| PUT | `/chores/:id/photo` | Kid | Upload proof photo |
| PUT | `/chores/:id/assign` | Parent | Assign kids to chore |
| DELETE | `/chores/:id/assign/:kidId` | Parent | Unassign kid from chore |
| DELETE | `/chores/:id` | Parent | Delete chore |

### Points & Rewards (Auth Required)
| Method | Endpoint | User | Description |
|--------|----------|------|-------------|
| GET | `/points/available` | Kid | Get claimable points |
| GET | `/points/history` | Kid | Get complete points history |
| GET | `/points/kid/:kidId` | Parent | View kid's points |
| POST | `/points/claim` | Kid | Claim specific points |
| POST | `/points/claim-all` | Kid | Claim all available points |

---

## 🎓 Example Scenarios

### Scenario 1: Solo Chore with Points

```bash
# Create chore for one kid
POST /chores
{
  "title": "Clean room",
  "points": 15,
  "kidIds": ["emma-uuid"]
}

# Emma completes
PUT /chores/:id/status { "status": "started" }
PUT /chores/:id/status { "status": "finished", "photo": "room.jpg" }

# Parent approves
PUT /chores/:id/status { "status": "approved" }

# Emma gets 15 points
GET /points/available
# Response: { total: 15 }
```

### Scenario 2: Shared Chore with Points

```bash
# Create chore for two kids
POST /chores
{
  "title": "Clean garage",
  "points": 30,
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# Either kid completes
PUT /chores/:id/status { "status": "started" }
PUT /chores/:id/status { "status": "finished", "photo": "garage.jpg" }

# Parent approves
PUT /chores/:id/status { "status": "approved" }

# BOTH kids get 30 points each!
# Emma: +30 points
# Jake: +30 points
# Total awarded: 60 points
```

### Scenario 3: Create Chore, Assign Later

```bash
# Create unassigned chore
POST /chores
{
  "title": "Mow lawn",
  "points": 25
}

# Assign to kid later
PUT /chores/:id/assign
{
  "kidIds": ["emma-uuid"]
}

# Add another kid
PUT /chores/:id/assign
{
  "kidIds": ["jake-uuid"]
}

# Remove a kid
DELETE /chores/:id/assign/emma-uuid

# Now only Jake is assigned
```

### Scenario 4: Points Claiming Strategy

```bash
# Kid has earned points from 3 chores
GET /points/available
{
  "points": [
    { "id": "p1", "amount": 10 },
    { "id": "p2", "amount": 5 },
    { "id": "p3", "amount": 15 }
  ],
  "total": 30
}

# Strategy A: Claim specific for small reward (10 pts)
POST /points/claim
{ "pointIds": ["p1"] }

# Strategy B: Save all for big reward (30 pts)
# Don't claim yet, keep earning

# Strategy C: Claim all when ready
POST /points/claim-all
```

---

## 🔒 Security & Permissions

### Parent Permissions
- ✅ Create/update/delete chores
- ✅ Assign/unassign kids
- ✅ Approve/reject/redo chores
- ✅ Set point values
- ✅ View kid's points
- ❌ Cannot claim points
- ❌ Cannot start/finish chores

### Kid Permissions
- ✅ View assigned chores
- ✅ Start/finish chores
- ✅ Upload photos
- ✅ View own points
- ✅ Claim own points
- ❌ Cannot create/delete chores
- ❌ Cannot approve/reject chores
- ❌ Cannot assign/unassign
- ❌ Cannot view sibling's points

---

## 📈 Response Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error, invalid status transition |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User type not allowed for this action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Email already exists |

---

## 🗂️ Data Models Summary

### User
- email, password, userType (parent/child/admin/user)
- firstName, lastName, active

### Kids
- name, dateOfBirth, age, gender, notes
- parentId → User (parent)
- userId → User (kid's login account)
- chores → Many-to-many with Chore

### Chore
- title, description, dateStarted, status, photo, **points**
- parentId → User (parent who created)
- assignedKids → Many-to-many with Kids

### Points
- amount, status (claimable/claimed), description
- earnedAt, claimedAt
- kidId → Kids
- choreId → Chore

---

## 🎯 Quick Reference

### Typical Parent Flow
```
1. POST /auth/register → Register
2. POST /auth/login → Get token
3. POST /kids → Create kids (get credentials)
4. POST /chores → Create chores with points
5. PUT /chores/:id/assign → Assign kids
6. PUT /chores/:id/status (approved) → Award points
7. GET /points/kid/:kidId → Monitor progress
```

### Typical Kid Flow
```
1. POST /auth/login → Login with generated credentials
2. GET /chores → View assigned chores
3. PUT /chores/:id/status (started) → Start chore
4. PUT /chores/:id/status (finished) → Finish with photo
5. GET /points/available → Check earned points
6. POST /points/claim-all → Claim rewards
7. GET /points/history → View earning history
```

---

## 💡 Tips & Best Practices

### For API Integration

1. **Save Tokens Securely**: Store JWT tokens in secure storage
2. **Handle Errors**: Check status codes and error messages
3. **Refresh Tokens**: Implement token refresh mechanism
4. **Validate Input**: Client-side validation before API calls

### For Frontend UI

1. **Show Point Values**: Display points on chore cards
2. **Visual Progress**: Progress bars for point goals
3. **Clear History**: Easy-to-read earned/claimed breakdown
4. **Claim Confirmation**: Confirm before claiming points
5. **Auto-Refresh**: Update available points after chore approval

### For Testing

1. **Test Workflow**: Complete full chore → approval → points flow
2. **Test Shared Chores**: Verify both kids get points
3. **Test Claiming**: Verify claimed points can't be claimed again
4. **Test History**: Verify all points tracked correctly
5. **Test Permissions**: Verify kids can't access other's points

---

## 🚀 Quick Start

```bash
# Full workflow test
# 1. Register parent
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","confirmPassword":"Test123!"}'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# 3. Create kid
curl -X POST http://localhost:3000/kids \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Kid","age":10}'

# 4. Create chore with points
curl -X POST http://localhost:3000/chores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test","points":10,"kidIds":["$KID_ID"]}'
```

---

## 📚 Documentation Index

- `API_REFERENCE.md` - This file (complete API docs)
- `POINTS_SYSTEM_GUIDE.md` - Detailed points system guide
- `CHORE_MODULE_GUIDE.md` - Chore workflow documentation
- `CHORE_MANY_TO_MANY_GUIDE.md` - Many-to-many assignments
- `KIDS_AUTO_GENERATION_GUIDE.md` - Email/password auto-generation
- `PASSWORD_GENERATION_SECURITY.md` - Password security details

---

**Application Status: ✅ Running on http://localhost:3000**



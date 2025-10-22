# PagChore System Overview

Complete overview of the Chore Management Application with Points & Rewards System.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PagChore Application                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Parents    │  │     Kids     │  │    Admin     │  │
│  │ (userType:   │  │ (userType:   │  │ (userType:   │  │
│  │  parent)     │  │   child)     │  │   admin)     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                           │                              │
│                    JWT Authentication                    │
│                           │                              │
│         ┌─────────────────┴─────────────────┐           │
│         │                                    │           │
│    ┌────▼────┐  ┌────────┐  ┌────────┐  ┌──▼───┐      │
│    │  Kids   │  │ Chores │  │ Points │  │ User │      │
│    │ Module  │  │ Module │  │ Module │  │Module│      │
│    └────┬────┘  └───┬────┘  └───┬────┘  └──────┘      │
│         │           │            │                      │
│         │     ┌─────┴────────────┘                      │
│         │     │                                         │
│    ┌────▼─────▼─────┐                                  │
│    │    Database     │                                  │
│    │   (MySQL 8.0)   │                                  │
│    │                 │                                  │
│    │ - users         │                                  │
│    │ - kids          │                                  │
│    │ - chore         │                                  │
│    │ - points        │                                  │
│    │ - chore_assign. │                                  │
│    └─────────────────┘                                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Entity Relationships

```
User (Parent)
  ├─ id, email, password, userType: "parent"
  └─ kids: Kids[]
      │
      ├─ Kid 1
      │   ├─ id, name, age, gender
      │   ├─ parentId → User (Parent)
      │   ├─ userId → User (Kid Account)
      │   │   └─ email: parent+1@domain.com
      │   │   └─ password: (auto-generated)
      │   │   └─ userType: "child"
      │   ├─ chores: Chore[] (many-to-many)
      │   └─ points: Points[]
      │
      └─ Kid 2
          ├─ parentId → User (Parent)
          ├─ userId → User (Kid Account)
          │   └─ email: parent+2@domain.com
          ├─ chores: Chore[]
          └─ points: Points[]

Chore
  ├─ id, title, description, status, photo
  ├─ points: 10 (reward value)
  ├─ parentId → User (Parent creator)
  └─ assignedKids: Kids[] (many-to-many)
      │
      └─ When APPROVED →
          Creates Points for each assigned kid

Points
  ├─ id, amount, status, description
  ├─ earnedAt, claimedAt
  ├─ kidId → Kids
  └─ choreId → Chore
```

## Key Relationships

### 1. Parent → Kids (One-to-Many)
```
One parent can have multiple kids
Kids belong to one parent
```

### 2. Kids → User Account (One-to-One)
```
Each kid has a user account for login
Email: parent+{number}@domain.com
Password: Auto-generated (8 chars, easy to read)
```

### 3. Chore → Kids (Many-to-Many)
```
One chore can be assigned to multiple kids
One kid can have multiple chores
Join table: chore_assignments
```

### 4. Points → Kid (One-to-Many)
```
One kid can have many point records
Points belong to one kid
```

### 5. Points → Chore (Many-to-One)
```
Many points can come from one chore
One point record links to one chore
```

## Workflow Overview

### Parent Workflow

```
1. Register/Login
   ↓
2. Create Kids
   ├─ System generates email (parent+1@domain.com)
   ├─ System generates password (8 chars)
   └─ Parent saves credentials
   ↓
3. Create Chores
   ├─ Set title, description
   ├─ Set point value
   └─ Optionally assign kids
   ↓
4. Assign/Reassign Kids
   ├─ Add kids to chore
   └─ Remove kids from chore
   ↓
5. Review Completed Chores
   ├─ Approve (awards points)
   ├─ Ask for redo
   └─ Reject
   ↓
6. Monitor Kid Progress
   └─ View kid's points balance
```

### Kid Workflow

```
1. Login (with auto-generated credentials)
   ↓
2. View Assigned Chores
   ├─ See all assigned chores
   └─ See point values
   ↓
3. Complete Chores
   ├─ Start chore
   ├─ Finish chore
   └─ Upload proof photo
   ↓
4. Wait for Parent Approval
   ↓
5. Receive Points (automatic)
   ↓
6. View Available Points
   ├─ Check balance
   └─ See earning history
   ↓
7. Claim Points
   ├─ Claim specific amounts
   └─ Or claim all
   ↓
8. Track History
   └─ See all earned & claimed points
```

## Status States

### Chore Status

| Status | Description | Next Actions |
|--------|-------------|--------------|
| `created` | Just created by parent | Kid can start |
| `started` | Kid is working on it | Kid can finish |
| `finished` | Kid submitted for review | Parent can approve/redo/reject |
| `approved` | Parent accepted | **Points awarded!** |
| `redo` | Parent wants improvements | Kid can start again |
| `rejected` | Parent declined | No points awarded |

### Point Status

| Status | Description | Actions |
|--------|-------------|---------|
| `claimable` | Available to claim | Kid can claim |
| `claimed` | Already claimed/spent | View in history only |

## Point Awarding Logic

```javascript
// Pseudo-code
if (chore.status === 'APPROVED' && chore.points > 0) {
  for (each kid in chore.assignedKids) {
    createPoint({
      kidId: kid.id,
      amount: chore.points,
      status: 'claimable',
      description: `Completed: ${chore.title}`,
      choreId: chore.id,
    });
  }
}
```

**Important:** Points are awarded to **ALL assigned kids**, not split between them.

## Auto-Generation Features

### Email Auto-Generation

```
Parent email: john@gmail.com

Kid 1: john+1@gmail.com
Kid 2: john+2@gmail.com
Kid 3: john+3@gmail.com
```

**Benefits:**
- All emails go to parent's inbox
- No need for separate email accounts
- Easy to filter and organize

### Password Auto-Generation

```
Parent: john@gmail.com
Kid 1: Emma Johnson, position +1

Generated password: Kh3e@r7w (8 characters)
```

**Composition:**
- 2 uppercase (excluding I, O)
- 3 lowercase (excluding i, l, o)
- 2 numbers (excluding 0, 1)
- 1 special character (@, #, $, %)

**Security:**
- Uses parent email as salt
- Uses kid name as seed
- Uses kid number for uniqueness
- Uses timestamp for randomness
- Hashed with bcrypt (10 rounds)

## Database Tables

```sql
user
  ├─ id (UUID)
  ├─ email (unique)
  ├─ password (bcrypt hashed)
  ├─ userType (enum)
  └─ firstName, lastName, active

kids
  ├─ id (UUID)
  ├─ name, dateOfBirth, age, gender
  ├─ parentId → user.id
  ├─ userId → user.id (kid's account)
  └─ notes, active

chore
  ├─ id (UUID)
  ├─ title, description
  ├─ dateStarted, status, photo
  ├─ points (NEW!)
  ├─ parentId → user.id
  └─ active

chore_assignments (JOIN TABLE)
  ├─ choreId → chore.id
  └─ kidId → kids.id

points (NEW!)
  ├─ id (UUID)
  ├─ amount, status, description
  ├─ earnedAt, claimedAt
  ├─ kidId → kids.id
  └─ choreId → chore.id
```

## Module Structure

```
src/
├─ database/
│  └─ entities/
│     ├─ user.entity.ts
│     ├─ kids.entity.ts
│     ├─ chore.entity.ts
│     └─ points.entity.ts
│
└─ modules/
   ├─ auth/              (Authentication)
   ├─ user/              (User management)
   ├─ kids/              (Kids management)
   ├─ chore/             (Chore workflow)
   └─ points/            (Points & rewards)
```

## Feature Summary

### ✅ Implemented Features

**User Management:**
- ✅ Parent registration & login
- ✅ Kid auto-creation with login
- ✅ Email auto-generation (parent+N)
- ✅ Password auto-generation (8 chars, parent-secured)

**Kids Management:**
- ✅ Create/read/update/delete kids
- ✅ Kid profile view
- ✅ One parent → many kids relationship

**Chore Management:**
- ✅ Create/read/update/delete chores
- ✅ Many-to-many kid assignments
- ✅ Flexible assignment (create then assign, or assign immediately)
- ✅ Workflow status system (6 states)
- ✅ Photo proof upload
- ✅ Point value specification

**Points & Rewards:**
- ✅ Automatic point awarding on approval
- ✅ Point claiming (specific or all)
- ✅ Complete earning/claiming history
- ✅ Parent monitoring of kid points
- ✅ Available vs claimed point tracking

**Security:**
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Parent-kid relationship validation
- ✅ Status transition validation
- ✅ Point ownership validation

## Statistics

### Current Implementation

**Entities:** 5
- User
- Kids
- Chore
- Points
- (Join table: chore_assignments)

**Modules:** 5
- AuthModule
- UserModule
- KidsModule
- ChoreModule
- PointsModule

**Controllers:** 5 (18 total endpoints)
- AuthController (3 endpoints)
- UserController (1 endpoint)
- KidsController (6 endpoints)
- ChoreController (9 endpoints)
- PointsController (5 endpoints)

**Database Tables:** 6
- user
- kids
- chore
- points
- chore_assignments (join table)

## Environment Variables

Required in `.env`:

```env
# Application
PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=db
DB_PORT=3306
DB_USERNAME=root
DB_ROOT_PASSWORD=secure_password_123
DB_DATABASE=chore_app

# JWT
JWT_SECRET=your-secret-key-change-in-production
```

## Deployment Status

✅ **Backend:** Running on port 3000
✅ **Database:** MySQL 8.0 on port 3306
✅ **Docker:** Both containers running
✅ **Build:** Successful
✅ **Tests:** All routes registered

## Next Steps (Future Enhancements)

### High Priority
- [ ] File upload for photos (currently URL only)
- [ ] Notification system (push notifications)
- [ ] Password reset for kids
- [ ] Recurring chores

### Medium Priority
- [ ] Chore due dates & reminders
- [ ] Reward catalog (point redemption)
- [ ] Analytics dashboard
- [ ] Chore templates

### Low Priority
- [ ] Point expiration
- [ ] Bonus point events
- [ ] Leaderboards
- [ ] Family achievements

## Quick Links

**Documentation:**
- [API Reference](API_REFERENCE.md)
- [Points System Guide](POINTS_SYSTEM_GUIDE.md)
- [Chore Module Guide](CHORE_MODULE_GUIDE.md)
- [Kids Auto-Generation](KIDS_AUTO_GENERATION_GUIDE.md)

**Getting Started:**
1. Start Docker: `docker compose up -d`
2. Check logs: `docker compose logs -f`
3. Test API: Use endpoints in API_REFERENCE.md
4. Stop: `docker compose down`

## Summary

PagChore is a complete chore management system for families that:

✅ **Simplifies Kid Management** - Auto-generates email and passwords
✅ **Manages Chores** - Complete workflow from creation to approval
✅ **Supports Collaboration** - Multiple kids can share chores
✅ **Rewards Completion** - Points awarded automatically
✅ **Tracks History** - Complete audit trail of points
✅ **Teaches Responsibility** - Kids learn value of work through points

Perfect for teaching kids responsibility while making household management easier for parents! 🎉

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 21, 2025



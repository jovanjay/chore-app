# All API Routes - Quick Reference

## Complete Route List

### 🔐 Authentication (3 routes)
```
POST   /auth/register          Register new parent user
POST   /auth/login             Login (parent or kid)
GET    /auth/me                Get current user info
```

### 👤 User Management (1 route)
```
GET    /users/:id              Get user by ID
```

### 👶 Kids Management (6 routes)
```
POST   /kids                   Create kid (auto-generates email+password)
GET    /kids                   Get all parent's kids
GET    /kids/me/profile        Kid views own profile
GET    /kids/:id               Get specific kid
PATCH  /kids/:id               Update kid info
DELETE /kids/:id               Delete kid and user account
```

### 📋 Chore Management (9 routes)
```
POST   /chores                         Create chore (with optional points & kids)
GET    /chores                         Get all chores (filtered by user)
GET    /chores/:id                     Get specific chore
PATCH  /chores/:id                     Update chore (title, description, points)
PUT    /chores/:id/status              Change workflow status
PUT    /chores/:id/photo               Upload proof photo (kid)
PUT    /chores/:id/assign              Assign kids to chore (parent)
DELETE /chores/:id/assign/:kidId       Unassign kid from chore (parent)
DELETE /chores/:id                     Delete chore (parent)
```

### 🎯 Points & Rewards (5 routes)
```
GET    /points/available               Get kid's claimable points
GET    /points/history                 Get kid's complete points history
GET    /points/kid/:kidId              Parent views kid's points
POST   /points/claim                   Claim specific points
POST   /points/claim-all               Claim all available points
```

---

## Total: 24 Routes

**Public:** 2 (register, login)
**Authenticated:** 22

**By User Type:**
- **Parent-only:** 13 routes
- **Kid-only:** 7 routes
- **Both:** 4 routes

---

## Routes by Module

| Module | Routes | Public | Parent | Kid | Both |
|--------|--------|--------|--------|-----|------|
| Auth | 3 | 2 | 0 | 0 | 1 |
| User | 1 | 0 | 0 | 0 | 1 |
| Kids | 6 | 0 | 5 | 1 | 0 |
| Chore | 9 | 0 | 5 | 2 | 2 |
| Points | 5 | 0 | 1 | 4 | 0 |
| **Total** | **24** | **2** | **11** | **7** | **4** |

---

## Quick Test Commands

### Setup
```bash
# Register parent
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","confirmPassword":"Test123!"}'

# Login parent
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'
# Save TOKEN

# Create kid
curl -X POST http://localhost:3000/kids \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Kid","age":10}'
# Save kid email and password from response
```

### Chore Workflow
```bash
# Create chore
curl -X POST http://localhost:3000/chores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test chore","points":10,"kidIds":["$KID_ID"]}'
# Save CHORE_ID

# Login as kid
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test+1@test.com","password":"$KID_PASSWORD"}'
# Save KID_TOKEN

# Start chore
curl -X PUT http://localhost:3000/chores/$CHORE_ID/status \
  -H "Authorization: Bearer $KID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"started"}'

# Finish chore
curl -X PUT http://localhost:3000/chores/$CHORE_ID/status \
  -H "Authorization: Bearer $KID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"finished","photo":"proof.jpg"}'

# Approve (as parent)
curl -X PUT http://localhost:3000/chores/$CHORE_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved"}'
# Points automatically awarded!

# Check points (as kid)
curl -X GET http://localhost:3000/points/available \
  -H "Authorization: Bearer $KID_TOKEN"

# Claim points
curl -X POST http://localhost:3000/points/claim-all \
  -H "Authorization: Bearer $KID_TOKEN"
```

---

## Environment

**Development:**
```
http://localhost:3000
```

**Docker Services:**
- Backend: `pagchore-backend-1` (Port 3000)
- Database: `pagchore-db-1` (Port 3306)

**Database:**
- Type: MySQL 8.0
- Host: db (in Docker)
- Database: chore_app

---

## Status Codes Reference

| Code | Status | When |
|------|--------|------|
| 200 | OK | GET, PUT, PATCH, DELETE success |
| 201 | Created | POST success |
| 400 | Bad Request | Validation error, invalid transition |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Wrong user type for action |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate email |

---

## Application Status

✅ **Backend:** Running on http://localhost:3000
✅ **Database:** Connected (MySQL 8.0)
✅ **Routes:** 24 endpoints registered
✅ **Authentication:** JWT-based
✅ **Validation:** Class-validator enabled
✅ **Auto-sync:** TypeORM synchronize enabled

**Ready to use!** 🚀



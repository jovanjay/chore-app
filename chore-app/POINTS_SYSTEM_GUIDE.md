# Points & Rewards System - Complete Guide

## Overview

The Points system allows parents to reward kids for completing chores. Points can be earned, claimed, and tracked with complete history.

### Key Features
- ✅ Parents specify points when creating chores
- ✅ Points automatically awarded when parent approves chore
- ✅ Kids can claim points (marks as "spent")
- ✅ Complete history of earned and claimed points
- ✅ Shared chores award points to all assigned kids

## Database Schema

### Points Entity

```typescript
{
  id: string;                    // UUID
  amount: number;                // Number of points
  status: PointStatus;           // 'claimable' or 'claimed'
  description: string;           // How points were earned
  earnedAt: Date;                // When points were earned
  claimedAt: Date;               // When points were claimed
  kidId: string;                 // Kid who earned the points
  choreId: string;               // Chore that awarded the points
}
```

### Point Status

| Status | Description |
|--------|-------------|
| `claimable` | Points earned but not yet claimed (available) |
| `claimed` | Points have been claimed/spent (history only) |

### Database Tables

```sql
-- Points table
CREATE TABLE points (
  id UUID PRIMARY KEY,
  amount INT NOT NULL,
  status ENUM('claimable', 'claimed') DEFAULT 'claimable',
  description TEXT,
  earnedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  claimedAt DATETIME,
  kidId UUID REFERENCES kids(id) ON DELETE CASCADE,
  choreId UUID REFERENCES chore(id) ON DELETE SET NULL
);

-- Chore table (updated)
ALTER TABLE chore ADD COLUMN points INT DEFAULT 0;
```

## How It Works

### 1. Parent Creates Chore with Points

```bash
POST /chores
Authorization: Bearer <parent_token>
{
  "title": "Wash dishes",
  "description": "Wash, dry, and put away",
  "points": 10,                    ← Points for this chore
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# Response:
{
  "id": "chore-uuid",
  "title": "Wash dishes",
  "points": 10,                    ← Points visible
  "status": "created",
  "assignedKids": [
    { "id": "emma-uuid", "name": "Emma" },
    { "id": "jake-uuid", "name": "Jake" }
  ],
  ...
}
```

### 2. Kids Complete Chore

```bash
# Kid starts
PUT /chores/:id/status
{ "status": "started" }

# Kid finishes with photo
PUT /chores/:id/status
{
  "status": "finished",
  "photo": "proof.jpg"
}
```

### 3. Parent Approves → Points Automatically Awarded

```bash
PUT /chores/chore-uuid/status
Authorization: Bearer <parent_token>
{
  "status": "approved"
}

# What happens behind the scenes:
# 1. Chore status changes to "approved"
# 2. System creates Point records for EACH assigned kid:
#    - Emma gets 10 points (status: claimable)
#    - Jake gets 10 points (status: claimable)
# 3. Description: "Completed: Wash dishes"
```

### 4. Kids View Available Points

```bash
# Kid checks available points
GET /points/available
Authorization: Bearer <kid_token>

# Response:
{
  "points": [
    {
      "id": "point-1",
      "amount": 10,
      "status": "claimable",
      "description": "Completed: Wash dishes",
      "earnedAt": "2025-10-21T12:00:00Z",
      "chore": {
        "id": "chore-uuid",
        "title": "Wash dishes"
      }
    },
    {
      "id": "point-2",
      "amount": 5,
      "status": "claimable",
      "description": "Completed: Clean room",
      "earnedAt": "2025-10-21T11:00:00Z"
    }
  ],
  "total": 15                      ← Total claimable points
}
```

### 5. Kids Claim Points

```bash
# Option 1: Claim specific points
POST /points/claim
Authorization: Bearer <kid_token>
{
  "pointIds": ["point-1", "point-2"]
}

# Response:
{
  "claimedPoints": [
    {
      "id": "point-1",
      "amount": 10,
      "status": "claimed",          ← Changed to claimed
      "claimedAt": "2025-10-21T14:00:00Z"
    },
    {
      "id": "point-2",
      "amount": 5,
      "status": "claimed",
      "claimedAt": "2025-10-21T14:00:00Z"
    }
  ],
  "totalClaimed": 15
}

# Option 2: Claim all available points
POST /points/claim-all
Authorization: Bearer <kid_token>

# Response:
{
  "claimedPoints": [...],
  "totalClaimed": 15
}
```

### 6. Kids View Complete History

```bash
GET /points/history
Authorization: Bearer <kid_token>

# Response:
{
  "points": [
    {
      "id": "point-1",
      "amount": 10,
      "status": "claimed",
      "description": "Completed: Wash dishes",
      "earnedAt": "2025-10-21T12:00:00Z",
      "claimedAt": "2025-10-21T14:00:00Z"
    },
    {
      "id": "point-2",
      "amount": 5,
      "status": "claimed",
      "earnedAt": "2025-10-21T11:00:00Z",
      "claimedAt": "2025-10-21T14:00:00Z"
    },
    {
      "id": "point-3",
      "amount": 20,
      "status": "claimable",          ← Still available
      "earnedAt": "2025-10-21T13:00:00Z",
      "claimedAt": null
    }
  ],
  "totalEarned": 35,                  ← All points ever earned
  "totalClaimed": 15,                 ← Points already claimed
  "totalAvailable": 20                ← Points available to claim
}
```

### 7. Parent Views Kid's Points

```bash
GET /points/kid/:kidId
Authorization: Bearer <parent_token>

# Response: Same structure as kid's history
{
  "points": [...],
  "totalEarned": 35,
  "totalClaimed": 15,
  "totalAvailable": 20
}
```

## API Endpoints

| Method | Endpoint | User | Description |
|--------|----------|------|-------------|
| `GET` | `/points/available` | Kid | Get claimable points and total |
| `GET` | `/points/history` | Kid | Get complete points history |
| `GET` | `/points/kid/:kidId` | Parent | View kid's points |
| `POST` | `/points/claim` | Kid | Claim specific points |
| `POST` | `/points/claim-all` | Kid | Claim all available points |

## Complete Workflow Example

### Scenario: Kid Earns and Claims Points

```bash
# 1. Parent creates chore worth 10 points
POST /chores
{
  "title": "Wash car",
  "description": "Wash, wax, and vacuum interior",
  "points": 10,
  "kidIds": ["emma-uuid"]
}

# 2. Kid starts chore
PUT /chores/:id/status
{ "status": "started" }

# 3. Kid finishes with photo
PUT /chores/:id/status
{
  "status": "finished",
  "photo": "car-clean.jpg"
}

# 4. Parent approves (points automatically awarded)
PUT /chores/:id/status
{ "status": "approved" }

# Behind the scenes:
# - Point record created for Emma
# - Amount: 10
# - Status: claimable
# - Description: "Completed: Wash car"

# 5. Kid checks available points
GET /points/available
# Response: { total: 10, points: [...] }

# 6. Kid claims points
POST /points/claim-all
# Response: { totalClaimed: 10 }

# 7. Points now marked as "claimed"
GET /points/history
{
  "totalEarned": 10,
  "totalClaimed": 10,     ← All points claimed
  "totalAvailable": 0      ← No points left
}
```

## Shared Chores & Points

### Scenario: Multiple Kids Share Chore

```bash
# Parent creates chore for 2 kids
POST /chores
{
  "title": "Clean garage",
  "points": 20,
  "kidIds": ["emma-uuid", "jake-uuid"]
}

# Kids work together, one finishes
PUT /chores/:id/status
{
  "status": "finished",
  "photo": "garage.jpg"
}

# Parent approves
PUT /chores/:id/status
{ "status": "approved" }

# Result: BOTH kids get 20 points each!
# - Emma: +20 points
# - Jake: +20 points
# Total awarded: 40 points (20 × 2 kids)
```

**Note:** Each assigned kid receives the **full point amount**, encouraging teamwork.

## Point Claiming

### Individual Claim

```bash
# Kid has multiple point records
GET /points/available
{
  "points": [
    { "id": "p1", "amount": 10, "description": "Wash dishes" },
    { "id": "p2", "amount": 5, "description": "Make bed" },
    { "id": "p3", "amount": 15, "description": "Clean room" }
  ],
  "total": 30
}

# Kid claims only specific points
POST /points/claim
{
  "pointIds": ["p1", "p3"]    # Claim 10 + 15 = 25 points
}

# Result:
# - p1: claimed (10 pts)
# - p2: still claimable (5 pts)
# - p3: claimed (15 pts)
```

### Claim All

```bash
# Claim all available at once
POST /points/claim-all

# All claimable points marked as claimed
```

## Points History

### History Tracking

Every point is tracked with:
- ✅ When earned (`earnedAt`)
- ✅ How earned (`description` + `chore` link)
- ✅ When claimed (`claimedAt`)
- ✅ Current status (`claimable` or `claimed`)

### Example History

```json
{
  "points": [
    {
      "id": "p1",
      "amount": 10,
      "status": "claimed",
      "description": "Completed: Wash dishes",
      "earnedAt": "2025-10-21T10:00:00Z",
      "claimedAt": "2025-10-21T15:00:00Z",
      "chore": {
        "id": "chore-1",
        "title": "Wash dishes"
      }
    },
    {
      "id": "p2",
      "amount": 5,
      "status": "claimed",
      "description": "Completed: Make bed",
      "earnedAt": "2025-10-21T09:00:00Z",
      "claimedAt": "2025-10-21T15:00:00Z"
    },
    {
      "id": "p3",
      "amount": 20,
      "status": "claimable",         ← Not claimed yet
      "description": "Completed: Clean garage",
      "earnedAt": "2025-10-21T14:00:00Z",
      "claimedAt": null
    }
  ],
  "totalEarned": 35,      ← Sum of all points
  "totalClaimed": 15,     ← Sum of claimed points
  "totalAvailable": 20    ← Sum of claimable points
}
```

## Parent Dashboard

### View Kid's Points

```bash
# Parent checks how many points Emma has
GET /points/kid/emma-uuid
Authorization: Bearer <parent_token>

# Response:
{
  "points": [
    { "amount": 10, "status": "claimable", ... },
    { "amount": 5, "status": "claimed", ... }
  ],
  "totalEarned": 15,
  "totalClaimed": 5,
  "totalAvailable": 10
}
```

Parents can:
- ✅ See all points kid has earned
- ✅ See which points are claimed vs available
- ✅ Track kid's chore completion through points
- ✅ Monitor kid's rewards balance

## Use Cases

### Use Case 1: Weekly Allowance

```
Parent sets point values:
- Small chores: 5 points
- Medium chores: 10 points
- Large chores: 20 points

End of week:
- Kid earned 100 points
- Kid claims all points
- 100 points = $10 allowance
```

### Use Case 2: Reward Shop

```
Rewards catalog:
- Ice cream: 10 points
- Movie night: 25 points
- New toy: 100 points

Kid:
1. Checks available points (50)
2. Claims 25 points
3. Redeems for movie night
```

### Use Case 3: Savings Goals

```
Kid wants new game (200 points)

Current status:
- Total earned: 150 points
- Total claimed: 30 points
- Available: 120 points

Kid decides to save (not claim) and earn more
```

### Use Case 4: Shared Chore Rewards

```
Chore: "Clean garage" - 30 points
Assigned: Emma + Jake

When approved:
- Emma gets 30 points
- Jake gets 30 points

Both kids benefit equally from teamwork
```

## Validation & Rules

### Point Earning Rules

1. **Points awarded only when chore is APPROVED**
   ```
   created → started → finished → approved ✅ Points awarded
   created → started → finished → rejected ❌ No points
   created → started → finished → redo ❌ No points (yet)
   ```

2. **Each assigned kid gets full points**
   ```
   Chore: 10 points
   Assigned to: 3 kids
   Total awarded: 30 points (10 × 3)
   ```

3. **Points cannot be negative**
   ```
   ❌ "points": -5  (validation error)
   ✅ "points": 0   (no points awarded)
   ✅ "points": 10  (10 points awarded)
   ```

### Point Claiming Rules

1. **Only claimable points can be claimed**
   ```
   ❌ Cannot claim already claimed points
   ✅ Can only claim points with status = 'claimable'
   ```

2. **Kids can only claim their own points**
   ```
   ❌ Cannot claim sibling's points
   ✅ Can only claim points where kidId matches
   ```

3. **Claimed points are permanent**
   ```
   Once claimed, points cannot be "unclaimed"
   Claimed points remain in history forever
   ```

## API Reference

### 1. Get Available Points (Kid)

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
      "chore": {
        "id": "chore-uuid",
        "title": "Wash dishes",
        "status": "approved"
      }
    }
  ],
  "total": 10
}
```

### 2. Get Points History (Kid)

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
      "claimedAt": "2025-10-21T14:00:00Z",
      ...
    },
    {
      "id": "point-2",
      "amount": 5,
      "status": "claimable",
      "claimedAt": null,
      ...
    }
  ],
  "totalEarned": 15,
  "totalClaimed": 10,
  "totalAvailable": 5
}
```

### 3. Get Kid's Points (Parent)

```
GET /points/kid/:kidId
Authorization: Bearer <parent_token>
```

**Response:** Same as history, but for specific kid

### 4. Claim Specific Points (Kid)

```
POST /points/claim
Authorization: Bearer <kid_token>
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
    },
    {
      "id": "point-2",
      "amount": 5,
      "status": "claimed",
      "claimedAt": "2025-10-21T14:30:00Z"
    }
  ],
  "totalClaimed": 15
}
```

### 5. Claim All Points (Kid)

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

## Complete Example: End-to-End

```bash
# === DAY 1 ===

# Parent creates chore
POST /chores
{
  "title": "Clean room",
  "points": 15,
  "kidIds": ["emma-uuid"]
}

# Emma completes chore
PUT /chores/:id/status { "status": "started" }
PUT /chores/:id/status { "status": "finished", "photo": "room.jpg" }

# Parent approves
PUT /chores/:id/status { "status": "approved" }
# → Emma gets 15 claimable points

# === DAY 2 ===

# Parent creates another chore
POST /chores
{
  "title": "Wash dishes",
  "points": 10,
  "kidIds": ["emma-uuid"]
}

# Emma completes and parent approves
# → Emma gets 10 more claimable points

# Emma checks balance
GET /points/available
# Response: { total: 25 }  (15 + 10)

# === DAY 3 ===

# Emma wants ice cream (10 points)
POST /points/claim
{
  "pointIds": ["point-2"]  # The 10-point entry
}

# Now:
GET /points/history
{
  "totalEarned": 25,
  "totalClaimed": 10,     ← Ice cream redeemed
  "totalAvailable": 15    ← Remaining points
}

# === DAY 4 ===

# Emma completes more chores...
# Earns 30 more points
# Total available: 45 points (15 + 30)

# Emma saves for bigger reward (50 points)
# Doesn't claim yet

# === DAY 5 ===

# Emma completes one more chore (5 points)
# Total available: 50 points!

# Emma claims all for the big reward
POST /points/claim-all
# totalClaimed: 50

# Final history:
{
  "totalEarned": 55,      # All points ever earned
  "totalClaimed": 60,     # All points claimed (10 + 50)
  "totalAvailable": 0     # All claimed
}
```

## Benefits

### For Parents
1. ✅ **Motivation Tool**: Incentivize chore completion
2. ✅ **Track Progress**: See how many points kid earned
3. ✅ **Fair Rewards**: Objective point system
4. ✅ **Flexible Values**: Set points based on difficulty
5. ✅ **Teaching Tool**: Kids learn value of work

### For Kids
1. ✅ **Clear Goals**: Know exactly what chores are worth
2. ✅ **Savings**: Can save points for bigger rewards
3. ✅ **Transparency**: See complete earning/spending history
4. ✅ **Autonomy**: Decide when to claim points
5. ✅ **Achievement**: Visual progress tracking

### For System
1. ✅ **Complete Audit Trail**: Every point tracked
2. ✅ **Immutable History**: Cannot delete claimed points
3. ✅ **Data Integrity**: Points tied to chores and kids
4. ✅ **Scalability**: Supports unlimited points/kids

## Edge Cases

### Case 1: Chore Deleted After Points Awarded

```
Chore approved → Points awarded
Parent deletes chore

Result:
- Points remain (choreId set to NULL via ON DELETE SET NULL)
- Kid keeps the points
- Description still shows chore title
```

### Case 2: Kid Deleted

```
Kid has claimable points
Parent deletes kid account

Result:
- All kid's points deleted (CASCADE)
- History is lost
```

### Case 3: Multiple Approvals (Shouldn't Happen)

```
System prevents:
- Once approved, cannot approve again
- Status transition validation blocks it
```

### Case 4: Shared Chore with Different Completion Times

```
Chore assigned to Emma + Jake
Emma starts and finishes
Parent approves

Result:
- Both Emma AND Jake get points
- Even though Jake didn't actively participate
- Encourages teamwork and coordination
```

## Security Features

### Access Control

**Kids Can:**
- ✅ View their own available points
- ✅ View their own history
- ✅ Claim their own points
- ❌ Cannot view other kids' points
- ❌ Cannot claim other kids' points
- ❌ Cannot create point records

**Parents Can:**
- ✅ View any of their kids' points
- ✅ Set points on chores
- ✅ Award points via chore approval
- ❌ Cannot claim points for kids
- ❌ Cannot manually create point records (must approve chores)

## Error Handling

### Common Errors

**403 Forbidden - Not a Kid**
```json
POST /points/claim
{
  "statusCode": 403,
  "message": "Only kids can claim points"
}
```

**404 Not Found - Points Don't Belong to Kid**
```json
POST /points/claim
{
  "statusCode": 404,
  "message": "One or more points not found or do not belong to you"
}
```

**400 Bad Request - Already Claimed**
```json
POST /points/claim
{
  "statusCode": 400,
  "message": "Some points have already been claimed"
}
```

**400 Bad Request - No Points Available**
```json
POST /points/claim-all
{
  "statusCode": 400,
  "message": "No points available to claim"
}
```

## Best Practices

### For Parents

1. **Set Consistent Values**
   - Small tasks: 5-10 points
   - Medium tasks: 10-20 points
   - Large tasks: 20-50 points

2. **Clear Communication**
   - Tell kids point values upfront
   - Explain reward conversion (points → rewards)

3. **Timely Approval**
   - Approve chores promptly
   - Kids get immediate point gratification

4. **Fair Distribution**
   - Use points to encourage all kids
   - Shared chores = equal rewards

### For Kids

1. **Save for Goals**
   - Don't claim immediately
   - Save for bigger rewards

2. **Track Progress**
   - Check history regularly
   - Plan for reward goals

3. **Understand Value**
   - Learn delayed gratification
   - Make smart claiming decisions

### For Implementation

1. **Reward Catalog**
   - Create UI showing point values
   - Display what kids can "buy" with points

2. **Notifications**
   - Notify kids when points are awarded
   - Remind about available points

3. **Analytics**
   - Show earning trends
   - Display top earners (gamification)

## Future Enhancements

Potential features:
- [ ] Point expiration dates
- [ ] Bonus multipliers (double points weekend)
- [ ] Reward catalog integration
- [ ] Point transfer between siblings
- [ ] Leaderboards and achievements
- [ ] Monthly point summaries
- [ ] Auto-claim options
- [ ] Point budget limits

## Database Relationships

```
Chore (points: 10)
  ├─ assignedKids: []
  │   ├─ Emma
  │   └─ Jake
  └─ When approved →
      ├─ Point (Emma, 10 pts, claimable)
      └─ Point (Jake, 10 pts, claimable)

Kid (Emma)
  ├─ Points: []
  │   ├─ Point 1 (10 pts, claimed)    ← History
  │   ├─ Point 2 (5 pts, claimed)     ← History
  │   └─ Point 3 (20 pts, claimable)  ← Available
  └─ Stats:
      ├─ Total Earned: 35
      ├─ Total Claimed: 15
      └─ Total Available: 20
```

## Summary

The Points system provides:
- ✅ **Automatic Awarding**: Points given when chores approved
- ✅ **Flexible Claiming**: Claim specific or all points
- ✅ **Complete History**: Track all earned and claimed points
- ✅ **Parent Visibility**: Parents can monitor kid progress
- ✅ **Fair Distribution**: Shared chores reward all kids
- ✅ **Secure**: Kids can only claim their own points

Perfect for teaching responsibility, delayed gratification, and the value of hard work! 🎉



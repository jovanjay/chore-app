# Rewards Module Guide

## Overview

The Rewards Module allows parents to create rewards that kids can redeem using their earned points. When a kid redeems a reward, the system automatically deducts the required points from their available balance using a FIFO (First In, First Out) approach.

## Features

- **Parent Features:**
  - Create rewards with title, description, and points cost
  - Update existing rewards
  - Delete rewards
  - View all rewards (active and inactive)
  - View kid's redemption history
  - Toggle reward availability (active/inactive)

- **Kid Features:**
  - View available rewards
  - Redeem rewards with available points
  - View personal redemption history
  - See remaining points after redemption

## Database Schema

### Reward Entity

```typescript
{
  id: string (UUID)
  title: string
  description: string
  pointsCost: number
  isActive: boolean (default: true)
  createdAt: Date
  updatedAt: Date
  parentId: string (UUID)
}
```

### Points Entity (Updated)

Added the following fields to track reward redemptions:

```typescript
{
  // ... existing fields
  rewardId?: string (UUID, nullable)
  reward?: Reward (relation)
}
```

## API Endpoints

### Parent Endpoints

#### 1. Create a Reward

**POST** `/rewards`

**Authentication:** JWT (Parent only)

**Request Body:**

```json
{
  "title": "Nintendo Switch Game",
  "description": "Choose any game under $60",
  "pointsCost": 500
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Nintendo Switch Game",
  "description": "Choose any game under $60",
  "pointsCost": 500,
  "isActive": true,
  "parentId": "uuid",
  "createdAt": "2025-10-22T00:00:00.000Z",
  "updatedAt": "2025-10-22T00:00:00.000Z"
}
```

#### 2. Update a Reward

**PUT** `/rewards/:id`

**Authentication:** JWT (Parent only)

**Request Body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "pointsCost": 600,
  "isActive": false
}
```

All fields are optional.

#### 3. Delete a Reward

**DELETE** `/rewards/:id`

**Authentication:** JWT (Parent only)

**Response:** 200 OK (no body)

#### 4. View Kid's Redemption History

**GET** `/rewards/history/kid/:kidId`

**Authentication:** JWT (Parent only)

**Response:**

```json
{
  "redemptions": [
    {
      "reward": {
        "id": "uuid",
        "title": "Ice Cream Trip",
        "description": "Trip to favorite ice cream shop",
        "pointsCost": 100
      },
      "points": [
        {
          "id": "uuid",
          "amount": 50,
          "status": "claimed",
          "claimedAt": "2025-10-20T00:00:00.000Z"
        },
        {
          "id": "uuid",
          "amount": 50,
          "status": "claimed",
          "claimedAt": "2025-10-20T00:00:00.000Z"
        }
      ],
      "totalPointsUsed": 100,
      "redeemedAt": "2025-10-20T00:00:00.000Z"
    }
  ],
  "totalRedemptions": 1
}
```

### Shared Endpoints (Parent & Kid)

#### 5. Get All Rewards

**GET** `/rewards`

**Authentication:** JWT (Both parent and kid)

Returns all rewards (active and inactive) for the family.

**Response:**

```json
[
  {
    "id": "uuid",
    "title": "Movie Night",
    "description": "Family movie night with popcorn",
    "pointsCost": 150,
    "isActive": true,
    "parentId": "uuid",
    "createdAt": "2025-10-22T00:00:00.000Z",
    "updatedAt": "2025-10-22T00:00:00.000Z"
  }
]
```

#### 6. Get Active Rewards Only

**GET** `/rewards/active`

**Authentication:** JWT (Both parent and kid)

Returns only active rewards, sorted by points cost (ascending).

#### 7. Get Single Reward

**GET** `/rewards/:id`

**Authentication:** JWT (Both parent and kid)

Returns details of a specific reward.

### Kid Endpoints

#### 8. Redeem a Reward

**POST** `/rewards/redeem`

**Authentication:** JWT (Kid only)

**Request Body:**

```json
{
  "rewardId": "uuid"
}
```

**Response:**

```json
{
  "reward": {
    "id": "uuid",
    "title": "Movie Night",
    "description": "Family movie night with popcorn",
    "pointsCost": 150
  },
  "pointsUsed": 150,
  "remainingPoints": 250,
  "claimedPoints": [
    {
      "id": "uuid",
      "amount": 100,
      "status": "claimed",
      "claimedAt": "2025-10-22T00:00:00.000Z",
      "rewardId": "uuid"
    },
    {
      "id": "uuid",
      "amount": 50,
      "status": "claimed",
      "claimedAt": "2025-10-22T00:00:00.000Z",
      "rewardId": "uuid"
    }
  ]
}
```

**Error Responses:**

- **400 Bad Request:** Insufficient points

  ```json
  {
    "statusCode": 400,
    "message": "Insufficient points. You have 100 points but need 150 points."
  }
  ```

- **400 Bad Request:** Reward not available

  ```json
  {
    "statusCode": 400,
    "message": "This reward is no longer available"
  }
  ```

#### 9. View Personal Redemption History

**GET** `/rewards/history/my`

**Authentication:** JWT (Kid only)

**Response:** Same format as parent's kid redemption history endpoint.

## How Points Redemption Works

### FIFO (First In, First Out) System

When a kid redeems a reward, the system uses the oldest available points first:

1. **Fetch Available Points:** Get all points with `status: 'claimable'` ordered by `earnedAt` (ascending)
2. **Check Sufficient Balance:** Verify total available points >= reward cost
3. **Deduct Points:** Mark points as `claimed` starting from oldest
4. **Track Reward:** Associate each claimed point with the reward (`rewardId`)
5. **Calculate Remaining:** Return updated available balance

### Example Scenario

**Kid's Available Points:**

- Point A: 50 points (earned Oct 1)
- Point B: 100 points (earned Oct 5)
- Point C: 75 points (earned Oct 10)
- **Total:** 225 points

**Kid redeems reward costing 120 points:**

1. Deduct Point A (50 points) ✓
2. Deduct 70 points from Point B ✓
3. Point B still has 30 points remaining (marked as claimed)
4. Point C remains claimable (75 points)
5. **Remaining balance:** 75 points (Point C only)

**Actually**, the current implementation marks entire point records as claimed, not partial amounts. So:

1. Deduct Point A (50 points) - fully claimed ✓
2. Deduct Point B (100 points) - fully claimed ✓
3. Point C remains claimable
4. **Points used:** 150 total (50 over the requirement)
5. **Remaining balance:** 75 points

> **Note:** The system claims complete point records, not partial amounts. This means if a reward costs 120 points and you have points of 50 and 100, both records (150 total) will be claimed.

## Validation Rules

### Create/Update Reward

- **title:** Required, string, not empty
- **description:** Required, string, not empty
- **pointsCost:** Required, integer, minimum 1
- **isActive:** Optional, boolean (for updates only)

### Redeem Reward

- **rewardId:** Required, valid UUID

## Authorization Rules

### Parent Actions

- Can only create rewards for themselves
- Can only update/delete their own rewards
- Can view any kid's redemption history (if kid belongs to them)

### Kid Actions

- Can only redeem rewards created by their parent
- Can only view their own redemption history
- Cannot redeem inactive rewards
- Must have sufficient available points

## Integration with Points System

The Rewards Module integrates seamlessly with the existing Points Module:

1. **Points remain independent:** Kids can still claim points without redeeming rewards
2. **Reward tracking:** Claimed points associated with rewards are tracked via `rewardId`
3. **History separation:** Point history shows all earned points; redemption history shows only reward-related claims
4. **Balance management:** Available points = all claimable points (regardless of origin)

## Usage Examples

### Parent Workflow

```bash
# 1. Create a reward
POST /rewards
{
  "title": "Extra Screen Time",
  "description": "30 minutes of extra screen time",
  "pointsCost": 50
}

# 2. View all rewards
GET /rewards

# 3. Update reward (make inactive)
PUT /rewards/{id}
{
  "isActive": false
}

# 4. Check kid's redemptions
GET /rewards/history/kid/{kidId}
```

### Kid Workflow

```bash
# 1. Check available rewards
GET /rewards/active

# 2. Check current points balance
GET /points/available

# 3. Redeem a reward
POST /rewards/redeem
{
  "rewardId": "uuid"
}

# 4. View redemption history
GET /rewards/history/my
```

## Database Migration

When deploying this module, ensure your database is updated to include:

1. **New Table:** `reward`
   - id (uuid, primary key)
   - title (varchar 255)
   - description (text)
   - pointsCost (int)
   - isActive (boolean, default true)
   - createdAt (timestamp)
   - updatedAt (timestamp)
   - parentId (uuid, foreign key to user.id)

2. **Updated Table:** `points`
   - Add column: rewardId (uuid, nullable, foreign key to reward.id)

## Best Practices

### For Parents

1. **Set Realistic Costs:** Make sure point costs align with chore point values
2. **Create Variety:** Offer both small and large rewards to motivate kids
3. **Use Active/Inactive:** Instead of deleting, mark rewards as inactive for temporary unavailability
4. **Monitor History:** Regularly check redemption history to understand kid preferences

### For Implementation

1. **Transaction Safety:** Consider wrapping redemption logic in database transactions
2. **Concurrent Redemptions:** Current implementation doesn't handle race conditions if a kid tries to redeem multiple rewards simultaneously
3. **Point Archiving:** Consider archiving old claimed points for performance
4. **Notification System:** Add notifications when kids redeem rewards

## Testing Checklist

- [ ] Parent can create rewards
- [ ] Parent can update own rewards only
- [ ] Parent can delete own rewards only
- [ ] Kid can view parent's rewards
- [ ] Kid can redeem with sufficient points
- [ ] Kid cannot redeem inactive rewards
- [ ] Kid cannot redeem with insufficient points
- [ ] Points are deducted correctly (FIFO)
- [ ] Remaining balance is accurate after redemption
- [ ] Redemption history tracks correctly
- [ ] Parent can view kid's redemption history
- [ ] Authorization prevents cross-family access

## Future Enhancements

Potential improvements to consider:

1. **Recurring Rewards:** Allow rewards that can be redeemed multiple times
2. **Reward Categories:** Organize rewards by category (entertainment, treats, privileges)
3. **Expiring Rewards:** Time-limited special rewards
4. **Partial Redemption:** Allow using exact point amounts instead of full point records
5. **Reward Approval:** Require parent approval before finalizing redemption
6. **Push Notifications:** Notify parents when kids redeem rewards
7. **Reward Templates:** Pre-defined reward templates for common items
8. **Points Reservation:** Allow kids to "reserve" points for a specific reward


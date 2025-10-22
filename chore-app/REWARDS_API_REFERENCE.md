# Rewards Module - API Reference

## Quick Reference

All endpoints require JWT authentication via Bearer token.

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/rewards` | Parent | Create a reward |
| GET | `/rewards` | Both | Get all rewards |
| GET | `/rewards/active` | Both | Get active rewards only |
| GET | `/rewards/:id` | Both | Get single reward |
| PUT | `/rewards/:id` | Parent | Update a reward |
| DELETE | `/rewards/:id` | Parent | Delete a reward |
| POST | `/rewards/redeem` | Kid | Redeem a reward |
| GET | `/rewards/history/my` | Kid | Get personal redemption history |
| GET | `/rewards/history/kid/:kidId` | Parent | Get kid's redemption history |

## Detailed API Documentation

### 1. Create Reward

Create a new reward that kids can redeem with their points.

**Endpoint:** `POST /rewards`

**Access:** Parent only

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Movie Night",
  "description": "Family movie night with popcorn and drinks",
  "pointsCost": 200
}
```

**Validation:**
- `title`: Required, non-empty string
- `description`: Required, non-empty string
- `pointsCost`: Required, integer, minimum 1

**Success Response (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Movie Night",
  "description": "Family movie night with popcorn and drinks",
  "pointsCost": 200,
  "isActive": true,
  "parentId": "parent-uuid",
  "createdAt": "2025-10-22T10:30:00.000Z",
  "updatedAt": "2025-10-22T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: User is not a parent

---

### 2. Get All Rewards

Retrieve all rewards for the family (both active and inactive).

**Endpoint:** `GET /rewards`

**Access:** Parent and Kids

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
[
  {
    "id": "reward-uuid-1",
    "title": "Ice Cream Trip",
    "description": "Trip to favorite ice cream shop",
    "pointsCost": 100,
    "isActive": true,
    "parentId": "parent-uuid",
    "createdAt": "2025-10-20T08:00:00.000Z",
    "updatedAt": "2025-10-20T08:00:00.000Z"
  },
  {
    "id": "reward-uuid-2",
    "title": "Video Game Time",
    "description": "1 hour of video game time",
    "pointsCost": 75,
    "isActive": false,
    "parentId": "parent-uuid",
    "createdAt": "2025-10-19T15:30:00.000Z",
    "updatedAt": "2025-10-21T09:00:00.000Z"
  }
]
```

---

### 3. Get Active Rewards

Retrieve only active rewards, sorted by points cost (lowest to highest).

**Endpoint:** `GET /rewards/active`

**Access:** Parent and Kids

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
[
  {
    "id": "reward-uuid-1",
    "title": "Ice Cream Trip",
    "description": "Trip to favorite ice cream shop",
    "pointsCost": 100,
    "isActive": true,
    "parentId": "parent-uuid",
    "createdAt": "2025-10-20T08:00:00.000Z",
    "updatedAt": "2025-10-20T08:00:00.000Z"
  }
]
```

---

### 4. Get Single Reward

Retrieve details of a specific reward.

**Endpoint:** `GET /rewards/:id`

**Access:** Parent and Kids (must be from same family)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Reward UUID

**Success Response (200):**
```json
{
  "id": "reward-uuid",
  "title": "Movie Night",
  "description": "Family movie night with popcorn and drinks",
  "pointsCost": 200,
  "isActive": true,
  "parentId": "parent-uuid",
  "createdAt": "2025-10-22T10:30:00.000Z",
  "updatedAt": "2025-10-22T10:30:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Reward doesn't exist
- `403 Forbidden`: Reward doesn't belong to your family

---

### 5. Update Reward

Update an existing reward's details.

**Endpoint:** `PUT /rewards/:id`

**Access:** Parent only (must own the reward)

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id`: Reward UUID

**Request Body (all fields optional):**
```json
{
  "title": "Updated Movie Night",
  "description": "Family movie night with premium snacks",
  "pointsCost": 250,
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "id": "reward-uuid",
  "title": "Updated Movie Night",
  "description": "Family movie night with premium snacks",
  "pointsCost": 250,
  "isActive": true,
  "parentId": "parent-uuid",
  "createdAt": "2025-10-22T10:30:00.000Z",
  "updatedAt": "2025-10-22T14:15:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Reward doesn't exist
- `403 Forbidden`: Not a parent or reward doesn't belong to you

---

### 6. Delete Reward

Permanently delete a reward.

**Endpoint:** `DELETE /rewards/:id`

**Access:** Parent only (must own the reward)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id`: Reward UUID

**Success Response (200):**
```
(empty body)
```

**Error Responses:**
- `404 Not Found`: Reward doesn't exist
- `403 Forbidden`: Not a parent or reward doesn't belong to you

---

### 7. Redeem Reward

Kid redeems a reward using their available points.

**Endpoint:** `POST /rewards/redeem`

**Access:** Kids only

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "rewardId": "reward-uuid"
}
```

**Validation:**
- `rewardId`: Required, valid UUID

**Success Response (200):**
```json
{
  "reward": {
    "id": "reward-uuid",
    "title": "Ice Cream Trip",
    "description": "Trip to favorite ice cream shop",
    "pointsCost": 100,
    "isActive": true,
    "parentId": "parent-uuid",
    "createdAt": "2025-10-20T08:00:00.000Z",
    "updatedAt": "2025-10-20T08:00:00.000Z"
  },
  "pointsUsed": 100,
  "remainingPoints": 150,
  "claimedPoints": [
    {
      "id": "point-uuid-1",
      "amount": 50,
      "status": "claimed",
      "description": "Cleaned bedroom",
      "claimedAt": "2025-10-22T15:00:00.000Z",
      "earnedAt": "2025-10-18T10:00:00.000Z",
      "kidId": "kid-uuid",
      "choreId": "chore-uuid-1",
      "rewardId": "reward-uuid"
    },
    {
      "id": "point-uuid-2",
      "amount": 50,
      "status": "claimed",
      "description": "Did homework",
      "claimedAt": "2025-10-22T15:00:00.000Z",
      "earnedAt": "2025-10-19T14:00:00.000Z",
      "kidId": "kid-uuid",
      "choreId": "chore-uuid-2",
      "rewardId": "reward-uuid"
    }
  ]
}
```

**Error Responses:**

**Insufficient Points (400):**
```json
{
  "statusCode": 400,
  "message": "Insufficient points. You have 50 points but need 100 points.",
  "error": "Bad Request"
}
```

**Reward Not Available (400):**
```json
{
  "statusCode": 400,
  "message": "This reward is no longer available",
  "error": "Bad Request"
}
```

**Reward Not Found (404):**
```json
{
  "statusCode": 404,
  "message": "Reward not found",
  "error": "Not Found"
}
```

**Wrong Family (403):**
```json
{
  "statusCode": 403,
  "message": "This reward does not belong to your family",
  "error": "Forbidden"
}
```

---

### 8. Get Personal Redemption History

Kid views their own redemption history.

**Endpoint:** `GET /rewards/history/my`

**Access:** Kids only

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "redemptions": [
    {
      "reward": {
        "id": "reward-uuid-1",
        "title": "Ice Cream Trip",
        "description": "Trip to favorite ice cream shop",
        "pointsCost": 100,
        "isActive": true,
        "parentId": "parent-uuid",
        "createdAt": "2025-10-20T08:00:00.000Z",
        "updatedAt": "2025-10-20T08:00:00.000Z"
      },
      "points": [
        {
          "id": "point-uuid-1",
          "amount": 50,
          "status": "claimed",
          "claimedAt": "2025-10-22T15:00:00.000Z",
          "earnedAt": "2025-10-18T10:00:00.000Z"
        },
        {
          "id": "point-uuid-2",
          "amount": 50,
          "status": "claimed",
          "claimedAt": "2025-10-22T15:00:00.000Z",
          "earnedAt": "2025-10-19T14:00:00.000Z"
        }
      ],
      "totalPointsUsed": 100,
      "redeemedAt": "2025-10-22T15:00:00.000Z"
    }
  ],
  "totalRedemptions": 1
}
```

**Error Responses:**
- `403 Forbidden`: User is not a kid
- `404 Not Found`: Kid profile not found

---

### 9. Get Kid's Redemption History

Parent views a specific kid's redemption history.

**Endpoint:** `GET /rewards/history/kid/:kidId`

**Access:** Parents only (kid must belong to parent)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `kidId`: Kid UUID

**Success Response (200):**
Same format as endpoint #8.

**Error Responses:**
- `403 Forbidden`: User is not a parent
- `404 Not Found`: Kid doesn't exist or doesn't belong to you

---

## Common Response Codes

| Code | Meaning | When it occurs |
|------|---------|----------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or business logic error |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Valid auth but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unexpected server error |

## Authentication

All endpoints require a valid JWT token obtained from the `/auth/login` endpoint.

**Header format:**
```
Authorization: Bearer <your_jwt_token>
```

**Token contains:**
- User ID
- User type (parent/child)
- Expiration time

## Rate Limiting

Consider implementing rate limiting for:
- Redemption endpoint: 10 requests per minute per user
- Create reward endpoint: 20 requests per minute per parent

## Pagination

Current implementation returns all records. Consider adding pagination for:
- `GET /rewards` (when family has many rewards)
- `GET /rewards/history/my` (when kid has many redemptions)

Example pagination query parameters:
```
GET /rewards?page=1&limit=10
```

## CORS Configuration

Ensure your CORS settings allow requests from your frontend application:

```typescript
app.enableCors({
  origin: 'http://your-frontend-url.com',
  credentials: true,
});
```

## Testing with cURL

### Create a reward (as parent):
```bash
curl -X POST http://localhost:3000/rewards \
  -H "Authorization: Bearer YOUR_PARENT_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Movie Night",
    "description": "Family movie night",
    "pointsCost": 200
  }'
```

### Get active rewards (as kid):
```bash
curl -X GET http://localhost:3000/rewards/active \
  -H "Authorization: Bearer YOUR_KID_JWT"
```

### Redeem a reward (as kid):
```bash
curl -X POST http://localhost:3000/rewards/redeem \
  -H "Authorization: Bearer YOUR_KID_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "rewardId": "REWARD_UUID"
  }'
```

## WebSocket Events (Future Enhancement)

Consider adding WebSocket events for real-time updates:

- `reward.created`: When parent creates a reward
- `reward.updated`: When parent updates a reward
- `reward.redeemed`: When kid redeems a reward
- `reward.deleted`: When parent deletes a reward

## Security Considerations

1. **Authorization Checks:** All endpoints verify user type and ownership
2. **Input Validation:** All DTOs use class-validator decorators
3. **SQL Injection:** TypeORM prevents SQL injection by default
4. **XSS Protection:** Always sanitize user input on frontend
5. **Rate Limiting:** Implement to prevent abuse
6. **Audit Logging:** Consider logging all redemption activities

## Error Handling

All errors follow NestJS exception format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Error type"
}
```

Multiple validation errors:

```json
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "pointsCost must be a positive number"
  ],
  "error": "Bad Request"
}
```


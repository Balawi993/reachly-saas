# API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All endpoints except `/auth/*` require Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /auth/signup
Create new user account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

### POST /auth/login
Login to existing account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  },
  "token": "jwt_token_here"
}
```

---

## Accounts Endpoints

### GET /accounts
Get all Twitter accounts for current user

**Response:**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "handle": "@johndoe",
    "avatar": "https://...",
    "is_valid": true,
    "last_validated": "2025-01-10T12:00:00Z",
    "created_at": "2025-01-10T10:00:00Z"
  }
]
```

### POST /accounts
Add new Twitter account

**Request:**
```json
{
  "username": "johndoe",
  "cookies": "{\"auth_token\": \"...\", \"ct0\": \"...\"}"
}
```

**Response:**
```json
{
  "id": 1,
  "username": "johndoe",
  "handle": "@johndoe",
  "avatar": "https://...",
  "is_valid": true,
  "last_validated": "2025-01-10T12:00:00Z"
}
```

### DELETE /accounts/:id
Delete Twitter account

**Response:**
```json
{
  "success": true
}
```

---

## Campaigns Endpoints

### GET /campaigns
Get all campaigns for current user

**Response:**
```json
[
  {
    "id": 1,
    "name": "Q4 Outreach",
    "status": "active",
    "account_username": "johndoe",
    "account_handle": "@johndoe",
    "target_source": "manual",
    "message_template": "Hey {{name}}!",
    "tags": "[\"founders\"]",
    "pacing_per_minute": 3,
    "pacing_delay_min": 15,
    "pacing_delay_max": 30,
    "pacing_daily_cap": 50,
    "stats_total": 100,
    "stats_sent": 45,
    "stats_failed": 3,
    "stats_replied": 12,
    "created_at": "2025-01-10T10:00:00Z"
  }
]
```

### GET /campaigns/:id
Get single campaign with targets

**Response:**
```json
{
  "id": 1,
  "name": "Q4 Outreach",
  "status": "active",
  "account_username": "johndoe",
  "targets": [
    {
      "id": 1,
      "username": "target1",
      "handle": "@target1",
      "name": "Target User",
      "avatar": "https://...",
      "status": "sent",
      "sent_at": "2025-01-10T11:00:00Z",
      "replied_at": null,
      "error_message": null
    }
  ],
  ...
}
```

### POST /campaigns
Create new campaign

**Request:**
```json
{
  "name": "Q4 Outreach",
  "accountId": 1,
  "tags": ["founders", "q4"],
  "targetSource": "manual",
  "manualTargets": "@user1\n@user2\n@user3",
  "selectedFollowers": [],
  "message": "Hey {{name}}, noticed your work!",
  "pacing": {
    "perMinute": 3,
    "delayMin": 15,
    "delayMax": 30,
    "dailyCap": 50,
    "retryAttempts": 2
  }
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Q4 Outreach",
  "status": "draft",
  ...
}
```

### POST /campaigns/:id/start
Start campaign (begin sending messages)

**Response:**
```json
{
  "success": true
}
```

### POST /campaigns/:id/pause
Pause campaign temporarily

**Response:**
```json
{
  "success": true
}
```

### POST /campaigns/:id/stop
Stop campaign permanently

**Response:**
```json
{
  "success": true
}
```

---

## Followers Endpoint

### POST /extract-followers
Extract followers from a Twitter account

**Request:**
```json
{
  "accountId": 1,
  "targetUsername": "elonmusk",
  "quantity": 100
}
```

**Response:**
```json
[
  {
    "id": "123456789",
    "username": "follower1",
    "name": "Follower Name",
    "avatar": "https://...",
    "handle": "@follower1"
  }
]
```

---

## Dashboard Endpoint

### GET /dashboard/stats
Get dashboard statistics

**Response:**
```json
{
  "totalDMs": 145,
  "activeCampaigns": 2,
  "connectedAccounts": 3,
  "replyRate": "15.2"
}
```

---

## Error Responses

All endpoints may return errors in this format:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

The API respects Twitter's rate limits:
- Maximum 50-500 DMs per day (depends on account age)
- Automatic delays between messages
- Configurable pacing per campaign

---

## Security

- All cookies are encrypted with AES-256
- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- HTTPS recommended for production

---

**Last Updated**: 2025-01-10

# User Profile Management API

## Overview
The profile management API allows authenticated users to view and update their profile information (email and name). Changes are automatically synced with the database.

## Authentication
All profile endpoints require user authentication via Patreon OAuth. The user must have a valid session cookie.

## Endpoints

### GET /api/profile
Get the current user's profile information.

**Authentication Required:** Yes

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "User Name",
  "avatarUrl": "https://...",
  "patreonId": "patreon_id",
  "membershipTier": "premium|standard|basic",
  "isPaidMember": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Invalid session data

---

### PUT /api/profile
Update the current user's profile (email and/or name).

**Authentication Required:** Yes

**Request Body:**
```json
{
  "email": "newemail@example.com",  // optional
  "name": "New Name"                 // optional
}
```

**Response (200 OK):**
```json
{
  "id": "user_id",
  "email": "newemail@example.com",
  "name": "New Name",
  "avatarUrl": "https://...",
  "patreonId": "patreon_id",
  "membershipTier": "premium",
  "isPaidMember": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

**Error Responses:**
- `401 Unauthorized`: Not authenticated
- `400 Bad Request`: Invalid session data, no data provided, invalid email format, or empty name
- `503 Service Unavailable`: Database not available or update failed

**Validation Rules:**
- Email must contain an `@` symbol
- Name cannot be empty or whitespace only
- Either email or name (or both) must be provided

---

## Database Synchronization

### Patreon OAuth Callback
When users log in via Patreon OAuth (`/api/auth/patreon/callback`), their profile is automatically created or updated in the database with the latest information from Patreon.

### Profile Updates
When users update their profile via `PUT /api/profile`:
1. The UserProfile record in the database is updated
2. The session data is updated to match
3. The `updated_at` timestamp is refreshed

### Fallback Behavior
If the database is unavailable, the API will:
- `GET /api/profile`: Return session data as fallback
- `PUT /api/profile`: Update session only and return session data

---

## Frontend Integration

### Example: Get Profile
```javascript
fetch('/api/profile', {
  method: 'GET',
  credentials: 'include'
})
  .then(res => res.json())
  .then(profile => console.log(profile));
```

### Example: Update Profile
```javascript
fetch('/api/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'newemail@example.com',
    name: 'New Name'
  })
})
  .then(res => res.json())
  .then(profile => console.log(profile));
```

**Important:** Always include `credentials: 'include'` to send session cookies.

---

## Testing

### Test GET Profile
```bash
# Requires a valid session cookie from Patreon OAuth
curl -X GET http://localhost:5000/api/profile \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json"
```

### Test Update Profile
```bash
# Requires a valid session cookie from Patreon OAuth
curl -X PUT http://localhost:5000/api/profile \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

---

## Database Schema

The profile endpoints interact with the `user_profiles` table:

```sql
CREATE TABLE user_profiles (
  id VARCHAR(36) PRIMARY KEY,           -- Patreon user ID
  email VARCHAR(255) UNIQUE,
  name VARCHAR(200),
  avatar_url TEXT,
  patreon_id VARCHAR(50),
  membership_tier VARCHAR(50),
  is_paid_member BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

# Debugging Login Issues

## Common 401 Unauthorized Errors

If you're getting a 401 error when trying to log in, here are the most common causes:

### 1. User Not Found
**Error**: `Invalid username/email or password`

**Possible causes**:
- Username/email doesn't exist in the database
- Typo in username or email
- User was deleted

**How to check**:
```sql
SELECT id, username, email FROM users WHERE username = 'isharehow' OR email = 'isharehow';
```

**Solution**: 
- Verify the user exists in the database
- Check for typos in the username/email
- If user doesn't exist, register a new account or create the user manually

### 2. No Password Set
**Error**: `This account was created via Patreon. Please use Patreon login instead.`

**Possible causes**:
- User was created via Patreon OAuth and never set a password
- Password was never set during registration

**How to check**:
```sql
SELECT id, username, email, password_hash IS NULL as has_no_password 
FROM users 
WHERE username = 'isharehow' OR email = 'isharehow';
```

**Solution**:
- Use Patreon login instead, OR
- Set a password for the user:
  ```python
  # In Python shell or script
  from app import app, db, User, bcrypt
  with app.app_context():
      user = User.query.filter_by(username='isharehow').first()
      if user:
          user.set_password('your_new_password')
          db.session.commit()
  ```

### 3. Incorrect Password
**Error**: `Invalid username/email or password`

**Possible causes**:
- Wrong password entered
- Password was changed but you're using the old one
- Password hash is corrupted

**How to check**:
- Verify you're using the correct password
- Check server logs for "Invalid password" messages

**Solution**:
- Reset the password (see above)
- Or use password reset functionality if available

### 4. Database Migration Not Run
**Error**: `Database migration required` or `is_employee column missing`

**Possible causes**:
- The `is_employee` column doesn't exist in the `users` table
- Migration hasn't been run

**How to check**:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_employee';
```

**Solution**:
```bash
cd backend-python
flask db upgrade
```

## Checking Server Logs

The backend logs detailed information about login attempts. Check your server logs for:
- `Login attempt failed: User not found for...`
- `Login attempt failed: User ... has no password set...`
- `Login attempt failed: Invalid password for user...`
- `Login successful for user...`

## Testing Login Directly

You can test the login endpoint directly:

```bash
curl -X POST https://api.ventures.isharehow.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "isharehow", "password": "your_password"}'
```

## Creating/Resetting User Password

If you need to create or reset a password for a user:

```python
# Connect to your database and run:
from app import app, db, User, bcrypt

with app.app_context():
    # Find user
    user = User.query.filter_by(username='isharehow').first()
    
    if not user:
        # Create user if doesn't exist
        user = User(
            username='isharehow',
            email='your_email@example.com',
            patreon_connected=False
        )
        db.session.add(user)
    
    # Set password
    user.set_password('your_new_password')
    db.session.commit()
    print(f"Password set for user {user.username} (ID: {user.id})")
```

## Common Issues

### Issue: User exists but login fails
1. Check if `password_hash` is NULL: `SELECT password_hash FROM users WHERE username = 'isharehow';`
2. If NULL, set a password (see above)
3. If not NULL, verify the password is correct

### Issue: "is_employee column missing" errors
- Run the migration: `flask db upgrade`
- The code has fallback handling, but migration should be run for full functionality

### Issue: Login works but other endpoints return 401
- Check if JWT token is being sent in cookies or Authorization header
- Verify JWT_SECRET_KEY is set correctly
- Check token expiration (default is 7 days)

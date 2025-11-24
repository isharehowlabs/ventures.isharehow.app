# User Login System Migration Plan

## Overview

This document outlines the complete migration from fragile session-based authentication to a robust database-backed system with JWT tokens and automated Patreon membership verification. This upgrade enables persistent user data storage and scheduled membership checks via cron jobs.

## Current State

- **Authentication**: Flask session-based (`session['user']`)
- **Storage**: User data stored in session cookies (fragile, not persistent)
- **Patreon Verification**: Manual check only during login
- **Token Management**: Access tokens stored in session (lost on logout/expiry)
- **Database**: PostgreSQL with SQLAlchemy already configured
- **Models**: `UserProfile` exists but not used for authentication

## Target State

- **Authentication**: JWT-based tokens (stateless, scalable)
- **Storage**: PostgreSQL database with dedicated `User` model
- **Patreon Verification**: Automated twice-monthly checks via cron jobs
- **Token Management**: Access and refresh tokens stored in database
- **Real-time Updates**: Webhook support for immediate membership status changes
- **Frontend**: Updated login form (removes user-facing Patreon check messaging)

---

## Migration Steps

### Phase 1: Database Setup & Model Creation

#### 1.1 Update Requirements
**File**: `backend-python/requirements.txt`

Add JWT support:
```
PyJWT==2.8.0
cryptography==41.0.7
```

Update SQLAlchemy versions (if needed):
```
flask-sqlalchemy==3.0.5
psycopg2-binary==2.9.9
```

#### 1.2 Create User Model
**File**: `backend-python/app.py`

Add new `User` model (separate from `UserProfile` for authentication):
```python
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    patreon_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    access_token = db.Column(db.String(500), nullable=True)  # Increased length for tokens
    refresh_token = db.Column(db.String(500), nullable=True)
    membership_active = db.Column(db.Boolean, default=False, nullable=False)
    last_checked = db.Column(db.DateTime, nullable=True)
    token_expires_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.patreon_id,  # Use patreon_id as external ID
            'patreonId': self.patreon_id,
            'email': self.email,
            'membershipActive': self.membership_active,
            'lastChecked': self.last_checked.isoformat() if self.last_checked else None
        }
```

#### 1.3 Create Database Migration
**Command**:
```bash
cd backend-python
export DATABASE_URL="your_postgresql_url"
export FLASK_APP=app.py
flask db migrate -m "Add User model for authentication"
flask db upgrade
```

---

### Phase 2: JWT Implementation

#### 2.1 Add JWT Helper Functions
**File**: `backend-python/app.py`

Add JWT utilities:
```python
import jwt
from datetime import datetime, timedelta

JWT_SECRET = os.environ.get('JWT_SECRET', app.config['SECRET_KEY'])
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

def generate_jwt_token(user_id):
    """Generate JWT token for authenticated user"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
```

#### 2.2 Update Authentication Decorator
**File**: `backend-python/app.py`

Replace `require_session` with JWT-based decorator:
```python
def require_auth(f):
    """Decorator to require JWT authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Authentication required'}), 401
        
        token = auth_header.split(' ')[1]
        user_id = verify_jwt_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Optionally attach user to request context
        request.current_user_id = user_id
        return f(*args, **kwargs)
    return decorated_function
```

---

### Phase 3: Update Patreon OAuth Callback

#### 3.1 Modify `/api/auth/patreon/callback`
**File**: `backend-python/app.py`

Replace session storage with database storage:
```python
@app.route('/api/auth/patreon/callback')
def patreon_callback():
    # ... existing OAuth code exchange logic ...
    
    # After fetching user data from Patreon API:
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    expires_in = token_data.get('expires_in', 3600)
    token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    
    # Parse membership status from API response
    is_active = False
    if memberships:
        # Check membership status (existing logic)
        is_active = is_paid_member  # From existing parsing logic
    
    # Store/update user in database
    user = User.query.filter_by(patreon_id=user_id).first()
    if not user:
        user = User(
            patreon_id=user_id,
            email=user_email,
            access_token=access_token,
            refresh_token=refresh_token,
            membership_active=is_active,
            last_checked=datetime.utcnow(),
            token_expires_at=token_expires_at
        )
        db.session.add(user)
        print(f"✓ Created new user in database: {user_id}")
    else:
        user.email = user_email
        user.access_token = access_token
        if refresh_token:
            user.refresh_token = refresh_token
        user.membership_active = is_active
        user.last_checked = datetime.utcnow()
        user.token_expires_at = token_expires_at
        print(f"✓ Updated existing user in database: {user_id}")
    
    db.session.commit()
    
    # Generate JWT token
    jwt_token = generate_jwt_token(user_id)
    
    # Redirect with token in URL (or use httpOnly cookie)
    return redirect(f'{get_frontend_url()}/labs/?auth=success&token={jwt_token}', code=302)
```

**Alternative**: Store JWT in httpOnly cookie instead of URL:
```python
    response = redirect(f'{get_frontend_url()}/labs/?auth=success', code=302)
    response.set_cookie(
        'auth_token',
        jwt_token,
        httponly=True,
        secure=True,
        samesite='None',
        max_age=JWT_EXPIRATION_HOURS * 3600,
        domain='.ventures.isharehow.app'
    )
    return response
```

---

### Phase 4: Update Authentication Endpoints

#### 4.1 Update `/api/auth/me`
**File**: `backend-python/app.py`

Replace session check with database query:
```python
@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    # Get token from Authorization header or cookie
    token = None
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
    else:
        token = request.cookies.get('auth_token')
    
    if not token:
        return jsonify({'error': 'Not authenticated', 'message': 'No token provided'}), 401
    
    user_id = verify_jwt_token(token)
    if not user_id:
        return jsonify({'error': 'Not authenticated', 'message': 'Invalid or expired token'}), 401
    
    # Query database for user
    user = User.query.filter_by(patreon_id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Also sync with UserProfile if it exists
    profile_data = {}
    if DB_AVAILABLE:
        try:
            profile = UserProfile.query.get(user_id)
            if profile:
                profile_data = profile.to_dict()
        except Exception as e:
            print(f"Warning: Failed to fetch profile: {e}")
    
    # Return combined user data
    user_data = user.to_dict()
    user_data.update({
        'name': profile_data.get('name', ''),
        'avatarUrl': profile_data.get('avatarUrl', ''),
        'membershipTier': profile_data.get('membershipTier'),
        'isPaidMember': user.membership_active,  # Use database value
        'isTeamMember': profile_data.get('isTeamMember', False)
    })
    
    return jsonify(user_data)
```

#### 4.2 Update `/api/auth/logout`
**File**: `backend-python/app.py`

```python
@app.route('/api/auth/logout', methods=['POST'])
def auth_logout():
    response = jsonify({'message': 'Logged out successfully'})
    # Clear cookie if using cookie-based auth
    response.set_cookie('auth_token', '', expires=0, httponly=True, secure=True, samesite='None', domain='.ventures.isharehow.app')
    return response
```

---

### Phase 5: Token Refresh Implementation

#### 5.1 Add Token Refresh Endpoint
**File**: `backend-python/app.py`

```python
def refresh_patreon_token(refresh_token):
    """Refresh Patreon access token using refresh token"""
    token_url = "https://www.patreon.com/api/oauth2/token"
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": os.environ.get('PATREON_CLIENT_ID'),
        "client_secret": os.environ.get('PATREON_CLIENT_SECRET')
    }
    response = requests.post(token_url, data=data, timeout=10)
    if response.ok:
        return response.json()
    return None

@app.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh Patreon access token if expired"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Authentication required'}), 401
    
    token = auth_header.split(' ')[1]
    user_id = verify_jwt_token(token)
    if not user_id:
        return jsonify({'error': 'Invalid token'}), 401
    
    user = User.query.filter_by(patreon_id=user_id).first()
    if not user or not user.refresh_token:
        return jsonify({'error': 'No refresh token available'}), 400
    
    # Check if token is expired or expiring soon
    if user.token_expires_at and user.token_expires_at > datetime.utcnow() + timedelta(minutes=5):
        return jsonify({'message': 'Token still valid', 'token': token})
    
    # Refresh Patreon token
    new_token_data = refresh_patreon_token(user.refresh_token)
    if not new_token_data:
        return jsonify({'error': 'Failed to refresh token'}), 500
    
    # Update user with new tokens
    user.access_token = new_token_data.get('access_token')
    if new_token_data.get('refresh_token'):
        user.refresh_token = new_token_data.get('refresh_token')
    expires_in = new_token_data.get('expires_in', 3600)
    user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
    db.session.commit()
    
    # Generate new JWT
    new_jwt = generate_jwt_token(user_id)
    return jsonify({'token': new_jwt, 'message': 'Token refreshed'})
```

---

### Phase 6: Automated Membership Verification

#### 6.1 Create Verification Script
**File**: `backend-python/verify_members.py`

```python
"""
Scheduled script to verify Patreon membership status for all users.
Run twice monthly via Render Cron Job.
"""
import os
import sys
from datetime import datetime
import requests
from dotenv import load_dotenv

# Add parent directory to path to import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db, User

load_dotenv()

def verify_user_membership(user):
    """Verify a single user's membership status"""
    if not user.access_token:
        print(f"⚠ User {user.patreon_id} has no access token")
        return False
    
    headers = {
        'Authorization': f'Bearer {user.access_token}',
        'User-Agent': 'VenturesApp/1.0 (+https://ventures.isharehow.app)'
    }
    
    # Check if token is expired
    if user.token_expires_at and user.token_expires_at < datetime.utcnow():
        print(f"⚠ Token expired for {user.patreon_id}, attempting refresh...")
        # Try to refresh token
        from app import refresh_patreon_token
        if user.refresh_token:
            new_token_data = refresh_patreon_token(user.refresh_token)
            if new_token_data:
                user.access_token = new_token_data.get('access_token')
                if new_token_data.get('refresh_token'):
                    user.refresh_token = new_token_data.get('refresh_token')
                expires_in = new_token_data.get('expires_in', 3600)
                user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                headers['Authorization'] = f'Bearer {user.access_token}'
            else:
                print(f"✗ Failed to refresh token for {user.patreon_id}")
                return False
        else:
            print(f"✗ No refresh token for {user.patreon_id}")
            return False
    
    try:
        identity_url = (
            "https://www.patreon.com/api/oauth2/v2/identity"
            "?fields[user]=id,email,full_name,image_url"
            "&include=memberships"
            "&fields[member]=patron_status,currently_entitled_amount_cents,last_charge_date,pledge_start"
        )
        
        response = requests.get(identity_url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse membership status
        is_active = False
        user_data = data.get('data', {})
        relationships = user_data.get('relationships', {})
        memberships = relationships.get('memberships', {}).get('data', [])
        
        if memberships:
            included = data.get('included', [])
            for membership in memberships:
                membership_id = membership.get('id')
                for item in included:
                    if item.get('id') == membership_id and item.get('type') == 'member':
                        member_attrs = item.get('attributes', {})
                        patron_status = member_attrs.get('patron_status')
                        if patron_status == 'active_patron':
                            is_active = True
                            break
        
        # Update user
        user.membership_active = is_active
        user.last_checked = datetime.utcnow()
        db.session.commit()
        
        status = "✓" if is_active else "✗"
        print(f"{status} User {user.patreon_id}: membership_active={is_active}")
        return True
        
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print(f"✗ Token invalid for {user.patreon_id} - may need re-authentication")
        else:
            print(f"✗ HTTP error for {user.patreon_id}: {e}")
        return False
    except Exception as e:
        print(f"✗ Error verifying {user.patreon_id}: {e}")
        return False

def main():
    """Main verification function"""
    with app.app_context():
        users = User.query.all()
        print(f"Verifying {len(users)} users...")
        
        success_count = 0
        for user in users:
            if verify_user_membership(user):
                success_count += 1
        
        print(f"\n✓ Verified {success_count}/{len(users)} users successfully")
        return 0 if success_count == len(users) else 1

if __name__ == '__main__':
    sys.exit(main())
```

#### 6.2 Configure Render Cron Job
**File**: `render.yaml` (add new service)

```yaml
services:
  # ... existing web service ...
  
  - type: cron
    name: verify-patreon-memberships
    runtime: python
    rootDir: backend-python
    plan: free
    schedule: "0 0 1,15 * *"  # 1st and 15th of each month at midnight
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: python verify_members.py
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: PATREON_CLIENT_ID
        sync: false
      - key: PATREON_CLIENT_SECRET
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: FLASK_SECRET_KEY
        sync: false
```

---

### Phase 7: Webhook Support

#### 7.1 Add Webhook Endpoint
**File**: `backend-python/app.py`

```python
@app.route('/api/patreon/webhook', methods=['POST'])
def patreon_webhook():
    """Handle Patreon webhook events for real-time membership updates"""
    # Verify webhook signature (Patreon provides this)
    signature = request.headers.get('X-Patreon-Signature')
    # TODO: Implement signature verification
    
    event_data = request.json
    event_type = event_data.get('data', {}).get('type')
    
    if event_type == 'member':
        # Member status changed (pledge created/updated/deleted)
        member_id = event_data.get('data', {}).get('id')
        attributes = event_data.get('data', {}).get('attributes', {})
        patron_status = attributes.get('patron_status')
        
        # Find user by member_id (you may need to store member_id separately)
        # For now, we'll need to query Patreon API to get user_id from member_id
        # Or store member_id in User model
        
        is_active = patron_status == 'active_patron'
        
        # Update membership status
        # Note: You'll need to map member_id to user.patreon_id
        # This may require an additional API call or storing member_id
        
        return jsonify({'message': 'Webhook processed'}), 200
    
    return jsonify({'message': 'Event type not handled'}), 200
```

**Note**: Full webhook implementation requires:
1. Storing `member_id` in User model
2. Webhook signature verification
3. Registering webhook URL in Patreon dashboard

---

### Phase 8: Frontend Updates

#### 8.1 Update useAuth Hook
**File**: `src/hooks/useAuth.ts`

Update to use JWT token:
```typescript
const checkAuth = async () => {
  try {
    const backendUrl = getBackendUrl();
    const token = localStorage.getItem('auth_token') || getCookie('auth_token');
    
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      credentials: 'include',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    if (response.ok) {
      const userData = await response.json();
      // Store token if returned in response
      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
      }
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  } catch (error) {
    // ... error handling
  }
};
```

#### 8.2 Update Login Flow
**File**: `src/hooks/useAuth.ts`

After redirect from Patreon, extract token:
```typescript
useEffect(() => {
  checkAuth();
  
  // Check for auth success and token
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      const token = urlParams.get('token');
      if (token) {
        localStorage.setItem('auth_token', token);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
      // Retry auth check
      setTimeout(() => checkAuth(), 500);
    }
  }
}, []);
```

#### 8.3 Update PatreonAuth Component
**File**: `src/components/auth/PatreonAuth.tsx`

Remove user-facing membership check messaging since verification is backend-only:
```typescript
<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
  Access the co-working space dashboard by signing in with your Patreon account.
  Your membership status will be verified automatically.
</Typography>

{/* Remove the "Note: You must be an active paid member" line */}
```

---

### Phase 9: Migration & Testing

#### 9.1 Data Migration Script
**File**: `backend-python/migrate_sessions_to_db.py`

```python
"""
One-time script to migrate existing session users to database.
Run this after deploying the new User model.
"""
from app import app, db, User, UserProfile
from datetime import datetime

def migrate_sessions():
    """Migrate users from UserProfile to User table"""
    with app.app_context():
        profiles = UserProfile.query.all()
        
        for profile in profiles:
            # Check if User already exists
            user = User.query.filter_by(patreon_id=profile.id).first()
            if not user:
                # Create User from UserProfile
                user = User(
                    patreon_id=profile.id,
                    email=profile.email,
                    membership_active=profile.is_paid_member or False,
                    last_checked=datetime.utcnow() if profile.is_paid_member else None
                )
                db.session.add(user)
                print(f"Migrated user: {profile.id}")
            else:
                print(f"User already exists: {profile.id}")
        
        db.session.commit()
        print("Migration complete!")

if __name__ == '__main__':
    migrate_sessions()
```

#### 9.2 Testing Checklist

- [ ] User can log in via Patreon OAuth
- [ ] JWT token is generated and stored
- [ ] `/api/auth/me` returns user data from database
- [ ] Protected routes require valid JWT
- [ ] Token refresh works when expired
- [ ] Cron job verifies memberships successfully
- [ ] Webhook updates membership status (if implemented)
- [ ] Frontend displays user data correctly
- [ ] Logout clears token
- [ ] Existing users can still access after migration

---

## Environment Variables

Add to Render dashboard:

```
JWT_SECRET=<generate_secure_random_string>
```

Generate with:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Rollback Plan

If issues occur:

1. **Temporary Rollback**: Keep session-based auth as fallback
   - Check for JWT token first, fall back to session if not present
   - Allows gradual migration

2. **Full Rollback**: Revert to session-based auth
   - Remove JWT decorators, restore `require_session`
   - Keep User model for future use but don't use for auth

3. **Database Rollback**: 
   ```bash
   flask db downgrade -1  # Revert last migration
   ```

---

## Timeline Estimate

- **Phase 1-2**: Database & JWT setup (2-3 hours)
- **Phase 3-4**: OAuth & endpoint updates (2-3 hours)
- **Phase 5**: Token refresh (1 hour)
- **Phase 6**: Cron job setup (2-3 hours)
- **Phase 7**: Webhook (optional, 2-3 hours)
- **Phase 8**: Frontend updates (1-2 hours)
- **Phase 9**: Testing & migration (2-3 hours)

**Total**: ~12-18 hours

---

## Notes

- User model is separate from UserProfile to maintain separation of concerns
- JWT tokens can be stored in localStorage or httpOnly cookies (cookies are more secure)
- Cron job runs on Render's free tier (may have limitations)
- Webhook implementation is optional but recommended for real-time updates
- Consider rate limiting on verification endpoints
- Monitor token expiration and refresh patterns

---

## Post-Migration Tasks

1. Monitor cron job logs for verification success/failures
2. Set up alerts for failed token refreshes
3. Document new authentication flow for team
4. Update API documentation
5. Consider adding admin dashboard for viewing user membership status


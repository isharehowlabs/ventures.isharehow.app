# User Login System Migration Plan

## Overview

This document outlines the complete migration from fragile session-based authentication to a robust database-backed system with JWT tokens (using flask-jwt-extended) and automated Patreon membership verification. This upgrade enables persistent user data storage and scheduled membership checks via cron jobs.

**Key Changes**:

- Refactoring to use `flask-jwt-extended==4.5.0` exclusively, eliminating session-based authentication to reduce errors
- Renaming `membership_active` to `membership_paid` in the User model for clarity
- Removing all user-facing Patreon verification UI since the cron job handles membership verification automatically twice monthly

## Current State

- **Authentication**: Mixed JWT (PyJWT) + Flask session-based (`session['user']`) - causing conflicts
- **Storage**: User data stored in session cookies (fragile, not persistent) + database
- **Patreon Verification**: Manual check during login + automated twice-monthly cron job
- **Token Management**: Access tokens stored in session (lost on logout/expiry) + database
- **Database**: PostgreSQL with SQLAlchemy already configured
- **Models**: `User` model exists with `membership_active` field (needs renaming to `membership_paid`)
- **Frontend**: Patreon verification UI components exist (`PatreonVerification.tsx`, `PatreonAuth.tsx`)

## Target State

- **Authentication**: Pure JWT via flask-jwt-extended (stateless, scalable, no sessions)
- **Storage**: PostgreSQL database with dedicated `User` model
- **Patreon Verification**: Automated twice-monthly checks via cron jobs (no user-facing UI)
- **Token Management**: Access and refresh tokens stored in database, JWT in httpOnly cookies
- **Field Naming**: `membership_paid` instead of `membership_active` for clarity
- **Frontend**: Simplified login flow without Patreon verification step

---

## Implementation Plan

### Phase 1: Update Dependencies

**File**: `backend-python/requirements.txt`

Add flask-jwt-extended and update dependencies:

```txt
Flask==2.0.3
Werkzeug==2.0.3
SQLAlchemy==1.4.54
Flask-SocketIO==5.3.6
Flask-SQLAlchemy==2.5.1
Flask-CORS==4.0.0
Flask-Migrate==4.0.1
flask-jwt-extended==4.5.0
psycopg2-binary==2.9.8
python-dotenv==0.19.2
requests==2.31.0
PyJWT==2.4.0  # Keep temporarily for migration, remove after refactor
cryptography==3.4.8
bcrypt==4.0.1
```

**Action**: Add `flask-jwt-extended==4.5.0` to requirements.txt

---


### Phase 2: Database Model Updates

**File**: `backend-python/app.py`

#### 2.1 Rename Field in User Model

Update the User model (around line 162):

```python
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=True, index=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=True)
    patreon_id = db.Column(db.String(50), unique=True, nullable=True, index=True)
    access_token = db.Column(db.String(500), nullable=True)
    refresh_token = db.Column(db.String(500), nullable=True)
    membership_paid = db.Column(db.Boolean, default=False, nullable=False)  # Renamed from membership_active
    last_checked = db.Column(db.DateTime, nullable=True)
    token_expires_at = db.Column(db.DateTime, nullable=True)
    patreon_connected = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # ... password methods ...
    
    def to_dict(self):
        return {
            'id': self.patreon_id or self.username or str(self.id),
            'patreonId': self.patreon_id,
            'username': self.username,
            'email': self.email,
            'membershipPaid': self.membership_paid,  # Updated field name
            'patreonConnected': self.patreon_connected,
            'lastChecked': self.last_checked.isoformat() if self.last_checked else None
        }
```

#### 2.2 Create Database Migration

**Command**:
```bash
cd backend-python
export DATABASE_URL="your_postgresql_url"
export FLASK_APP=app.py
flask db migrate -m "Rename membership_active to membership_paid"
flask db upgrade
```

**Note**: Review the generated migration file before applying to ensure it's correct.

---


### Phase 3: Replace PyJWT with flask-jwt-extended

**File**: `backend-python/app.py`

#### 3.1 Initialize JWT Manager

Add after Flask app initialization (around line 26, after `app = Flask(__name__)`):

```python
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, set_access_cookies, unset_jwt_cookies

# Initialize JWT Manager
jwt = JWTManager(app)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', app.config['SECRET_KEY'])
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'cookies']
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_HTTPONLY'] = True
app.config['JWT_COOKIE_SAMESITE'] = 'None'
app.config['JWT_COOKIE_DOMAIN'] = '.ventures.isharehow.app'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Set to True if you add CSRF protection later
```

#### 3.2 Remove Old JWT Functions

Remove or comment out the old PyJWT functions (around lines 99-121):

```python
# REMOVE THESE:
# JWT_SECRET = os.environ.get('JWT_SECRET', app.config['SECRET_KEY'])
# JWT_ALGORITHM = 'HS256'
# JWT_EXPIRATION_HOURS = 24 * 7

# def generate_jwt_token(user_id):
#     ...

# def verify_jwt_token(token):
#     ...
```

#### 3.3 Update Authentication Decorator

Replace `require_session` decorator (around line 697) with flask-jwt-extended:

```python
# REMOVE OLD:
# def require_session(f):
#     ...

# REPLACE WITH:
# Use @jwt_required() directly on routes, or create a helper:
def get_current_user_id():
    """Get current user ID from JWT token"""
    return get_jwt_identity()
```

---

### Phase 4: Refactor Authentication Endpoints

**File**: `backend-python/app.py`

#### 4.1 Registration Endpoint (`/api/auth/register`)

Update to use flask-jwt-extended:

```python
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=username,
        email=email,
        membership_paid=False  # Updated field name
    )
    user.set_password(password)
    
    db.session.add(user)
    db.session.commit()
    
    # Create JWT token
    access_token = create_access_token(identity=str(user.id))
    
    # Set JWT in httpOnly cookie
    response = jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    })
    set_access_cookies(response, access_token)
    
    return response, 201
```

#### 4.2 Login Endpoint (`/api/auth/login`)

Update to use flask-jwt-extended:

```python
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400
    
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Create JWT token
    access_token = create_access_token(identity=str(user.id))
    
    # Set JWT in httpOnly cookie
    response = jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    })
    set_access_cookies(response, access_token)
    
    return response
```

#### 4.3 `/api/auth/me` Endpoint

Update to use JWT only (remove session fallback):

```python
@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def auth_me():
    """Get current user information from JWT token"""
    if not DB_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        # Get user ID from JWT
        user_id = get_jwt_identity()
        
        # Find user by ID (could be integer ID, username, or patreon_id)
        user = None
        if user_id.isdigit():
            user = User.query.get(int(user_id))
        if not user:
            user = User.query.filter_by(username=user_id).first()
        if not user:
            user = User.query.filter_by(patreon_id=user_id).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Also sync with UserProfile if it exists
        profile_data = {}
        try:
            profile = UserProfile.query.get(user.patreon_id or user.id)
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
            'isPaidMember': user.membership_paid,  # Updated field name
            'isTeamMember': profile_data.get('isTeamMember', False)
        })
        
        return jsonify(user_data)
        
    except Exception as e:
        print(f"Error in /api/auth/me: {e}")
        return jsonify({'error': 'Internal server error'}), 500
```

#### 4.4 `/api/auth/logout` Endpoint

Update to clear JWT cookie:

```python
@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def auth_logout():
    """Logout user by clearing JWT cookie"""
    response = jsonify({'message': 'Logged out successfully'})
    unset_jwt_cookies(response)
    return response
```

#### 4.5 `/api/auth/verify-patreon` Endpoint

Keep for admin/internal use but mark as deprecated:

```python
@app.route('/api/auth/verify-patreon', methods=['POST'])
@jwt_required()
def verify_patreon():
    """
    DEPRECATED: Manual Patreon verification endpoint.
    Membership verification is now handled automatically by cron job.
    Kept for admin/internal use only.
    """
    # ... existing verification logic ...
    # Update field references: membership_active → membership_paid
    user.membership_paid = is_active  # Updated field name
    # ...
```

#### 4.6 Patreon OAuth Callback (`/api/auth/patreon/callback`)

Update to use flask-jwt-extended:

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
    is_paid = False
    if memberships:
        # Check membership status (existing logic)
        is_paid = is_paid_member  # From existing parsing logic
    
    # Store/update user in database
    user = User.query.filter_by(patreon_id=user_id).first()
    if not user:
        user = User(
            patreon_id=user_id,
            email=user_email,
            access_token=access_token,
            refresh_token=refresh_token,
            membership_paid=is_paid,  # Updated field name
            last_checked=datetime.utcnow(),
            token_expires_at=token_expires_at,
            patreon_connected=True
        )
        db.session.add(user)
        print(f"✓ Created new user in database: {user_id}")
    else:
        user.email = user_email
        user.access_token = access_token
        if refresh_token:
            user.refresh_token = refresh_token
        user.membership_paid = is_paid  # Updated field name
        user.last_checked = datetime.utcnow()
        user.token_expires_at = token_expires_at
        user.patreon_connected = True
        print(f"✓ Updated existing user in database: {user_id}")
    
    db.session.commit()
    
    # Generate JWT token using flask-jwt-extended
    jwt_token = create_access_token(identity=str(user.id))
    
    # Redirect with JWT in httpOnly cookie
    response = redirect(f'{get_frontend_url()}/labs/?auth=success', code=302)
    set_access_cookies(response, jwt_token)
    return response
```

---

### Phase 5: Update All Field References

**Files to update**:

1. **`backend-python/app.py`** - Search and replace:
   - `membership_active` → `membership_paid` (all occurrences)
   - `membershipActive` → `membershipPaid` (in JSON responses)

2. **`backend-python/verify_members.py`** - Update field references:

```python
# Around line 86:
user.membership_paid = is_active  # Changed from membership_active

# Around line 91:
print(f"{status} User {user.patreon_id}: membership_paid={is_active}")  # Updated print statement
```

3. **`backend-python/migrate_sessions_to_db.py`** - Update field references:

```python
# Around line 36:
membership_paid=profile.is_paid_member or False,  # Changed from membership_active

# Around line 46:
if user.membership_paid != (profile.is_paid_member or False):  # Updated field name
    user.membership_paid = profile.is_paid_member or False
```

**Search Command**:
```bash
cd backend-python
grep -r "membership_active" . --include="*.py"
grep -r "membershipActive" . --include="*.py"
```

---

### Phase 6: Remove Session Configuration

**File**: `backend-python/app.py`

#### 6.1 Remove Session Cookie Configuration

Remove or comment out session configuration (around lines 38-44):

```python
# REMOVE THESE:
# app.config['SESSION_COOKIE_HTTPONLY'] = True
# app.config['SESSION_COOKIE_SECURE'] = True
# app.config['SESSION_COOKIE_SAMESITE'] = 'None'
# app.config['SESSION_COOKIE_DOMAIN'] = '.ventures.isharehow.app'
# app.config['SESSION_COOKIE_PATH'] = '/'
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)
```

#### 6.2 Remove Session Imports (if not used elsewhere)

Keep `session` import only if needed for other features (like flash messages):

```python
# Keep if needed: from flask import Flask, request, jsonify, redirect, session, url_for
# Or remove session: from flask import Flask, request, jsonify, redirect, url_for
```

---

### Phase 7: Update Cron Job Script

**File**: `backend-python/verify_members.py`

Update all field references:

```python
# Around line 86:
user.membership_paid = is_active  # Changed from membership_active

# Around line 91:
print(f"{status} User {user.patreon_id}: membership_paid={is_active}")  # Updated
```

**Complete updated function**:

```python
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
        if user.refresh_token:
            new_token_data = refresh_patreon_token(user.refresh_token)
            if new_token_data:
                user.access_token = new_token_data.get('access_token')
                if new_token_data.get('refresh_token'):
                    user.refresh_token = new_token_data.get('refresh_token')
                expires_in = new_token_data.get('expires_in', 3600)
                user.token_expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
                headers['Authorization'] = f'Bearer {user.access_token}'
                print(f"✓ Token refreshed for {user.patreon_id}")
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
        is_paid = False
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
                            is_paid = True
                            break
        
        # Special handling for creator/admin
        if user.patreon_id == '56776112':
            is_paid = False
        
        # Update user
        user.membership_paid = is_paid  # Updated field name
        user.last_checked = datetime.utcnow()
        db.session.commit()
        
        status = "✓" if is_paid else "✗"
        print(f"{status} User {user.patreon_id}: membership_paid={is_paid}")  # Updated
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
```

---

### Phase 8: Frontend Updates - Remove Patreon Verification UI

#### 8.1 Update PatreonAuth Component

**File**: `src/components/auth/PatreonAuth.tsx`

Remove Patreon verification step logic:

```typescript
// Remove Patreon verification step (lines 42-44, 56-72)
// Remove needsPatreonVerification checks
// Simplify flow: login/register → success (no verification step)

<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
  Access the co-working space dashboard by signing in with your Patreon account.
  Your membership status will be verified automatically.
</Typography>

{/* Remove the "Note: You must be an active paid member" line */}
{/* Remove any Patreon verification UI components */}
```

#### 8.2 Update PatreonVerification Component

**File**: `src/components/auth/PatreonVerification.tsx`

Mark as deprecated or remove entirely:

```typescript
/**
 * @deprecated Patreon verification is now handled automatically by backend cron job.
 * This component is kept for backward compatibility but should not be used.
 */
// Or remove the file entirely if not needed
```

#### 8.3 Update ProtectedRoute Component

**File**: `src/components/auth/ProtectedRoute.tsx`

Remove Patreon membership checks:

```typescript
// Remove Patreon membership checks (around line 127)
// Remove any Patreon-related messaging
// Simplify to just check authentication status
```

#### 8.4 Update useAuth Hook

**File**: `src/hooks/useAuth.ts` (if exists)

Remove Patreon verification logic:

```typescript
// Remove needsPatreonVerification from auth state
// Remove Patreon verification logic
// Update to use JWT from cookies:

const checkAuth = async () => {
  try {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      credentials: 'include',  // Important: include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      setAuthState({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  } catch (error) {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error.message,
    });
  }
};

// Handle auth success redirect
useEffect(() => {
  checkAuth();
  
  // Check for auth success
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Retry auth check
      setTimeout(() => checkAuth(), 500);
    }
  }
}, []);
```

---

### Phase 9: Update Helper Functions

**File**: `backend-python/app.py`

#### 9.1 Remove Session-Dependent Helpers

Remove or update helper functions that use sessions:

```python
# REMOVE if they use sessions:
# def get_user_id():
#     """Get user ID from session"""
#     return session.get('user', {}).get('id')

# def get_user_info():
#     """Get user info from session"""
#     return session.get('user')

# REPLACE with JWT-based helpers:
def get_current_user():
    """Get current user from JWT token"""
    from flask_jwt_extended import get_jwt_identity
    user_id = get_jwt_identity()
    if not user_id:
        return None
    
    # Find user by ID
    user = None
    if user_id.isdigit():
        user = User.query.get(int(user_id))
    if not user:
        user = User.query.filter_by(username=user_id).first()
    if not user:
        user = User.query.filter_by(patreon_id=user_id).first()
    return user
```

#### 9.2 Update Protected Route Decorators

Replace all `@require_session` with `@jwt_required()`:

```python
# OLD:
# @app.route('/api/some-protected-route')
# @require_session
# def protected_route():
#     user_id = get_user_id()
#     ...

# NEW:
@app.route('/api/some-protected-route')
@jwt_required()
def protected_route():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    ...
```

---

### Phase 10: Testing & Validation

#### 10.1 Testing Checklist

- [ ] **Dependencies**: Verify flask-jwt-extended is installed
- [ ] **Database Migration**: Verify `membership_paid` field exists in database
- [ ] **Registration Flow**: Test user registration with JWT in cookies
- [ ] **Login Flow**: Test user login with JWT in cookies
- [ ] **Patreon OAuth**: Test Patreon login flow with JWT in cookies
- [ ] **Auth Endpoint**: Test `/api/auth/me` with JWT authentication
- [ ] **Protected Routes**: Test protected routes require valid JWT
- [ ] **Logout**: Test logout clears JWT cookie
- [ ] **Field References**: Verify all `membership_paid` references work
- [ ] **Cron Job**: Verify cron job updates `membership_paid` field correctly
- [ ] **No Sessions**: Verify no session errors occur
- [ ] **Frontend**: Verify frontend works with cookie-based JWT
- [ ] **Backward Compatibility**: Verify existing users can still access after migration

#### 10.2 Test Scripts

Create test script `backend-python/test_auth.py`:

```python
"""
Test script for authentication endpoints
"""
import requests
import json

BASE_URL = "http://localhost:5000"  # Adjust for your environment

def test_register():
    """Test user registration"""
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpass123"
        }
    )
    print(f"Register: {response.status_code} - {response.json()}")
    return response.cookies.get('access_token_cookie')

def test_login():
    """Test user login"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "username": "testuser",
            "password": "testpass123"
        }
    )
    print(f"Login: {response.status_code} - {response.json()}")
    return response.cookies.get('access_token_cookie')

def test_me(cookies):
    """Test /api/auth/me endpoint"""
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        cookies=cookies
    )
    print(f"Me: {response.status_code} - {response.json()}")

def test_logout(cookies):
    """Test logout"""
    response = requests.post(
        f"{BASE_URL}/api/auth/logout",
        cookies=cookies
    )
    print(f"Logout: {response.status_code} - {response.json()}")

if __name__ == '__main__':
    # Test flow
    cookies = test_register()
    if cookies:
        test_me(cookies)
        test_logout(cookies)
```

---

## Environment Variables

Add to Render dashboard (or `.env` file for local development):

```
JWT_SECRET=<generate_secure_random_string>
FLASK_SECRET_KEY=<generate_secure_random_string>
DATABASE_URL=<your_postgresql_url>
PATREON_CLIENT_ID=<your_patreon_client_id>
PATREON_CLIENT_SECRET=<your_patreon_client_secret>
```

**Generate JWT_SECRET**:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Note**: Use the same value for both `JWT_SECRET` and `FLASK_SECRET_KEY` if you want, or generate separate values for better security.

---

## Rollback Plan

If issues occur during migration:

### 1. Temporary Rollback (Keep Both Systems)

Keep session-based auth as fallback temporarily:

```python
# In /api/auth/me, keep session fallback temporarily:
@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    # Try JWT first
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        user_id = verify_jwt_token(token)  # Keep old function temporarily
        if user_id:
            # ... JWT logic ...
    
    # Fallback to session
    user = session.get('user')
    if user:
        return jsonify(user)
    
    return jsonify({'error': 'Not authenticated'}), 401
```

### 2. Full Rollback

Revert to session-based auth:

1. **Code Changes**:
   - Restore `require_session` decorator
   - Restore session configuration
   - Remove `@jwt_required()` decorators
   - Restore `generate_jwt_token()` and `verify_jwt_token()` functions

2. **Database Rollback**:
   ```bash
   flask db downgrade -1  # Revert last migration
   ```

3. **Dependencies**:
   - Keep flask-jwt-extended installed but don't use it
   - Or remove it: `pip uninstall flask-jwt-extended`

### 3. Field Name Rollback

If `membership_paid` causes issues:

```bash
flask db migrate -m "Revert membership_paid to membership_active"
# Edit migration file to rename back
flask db upgrade
```

---

## Timeline Estimate

- **Phase 1**: Update Dependencies (15 minutes)
- **Phase 2**: Database Model Updates (30 minutes)
- **Phase 3**: Replace PyJWT with flask-jwt-extended (1-2 hours)
- **Phase 4**: Refactor Authentication Endpoints (2-3 hours)
- **Phase 5**: Update All Field References (1 hour)
- **Phase 6**: Remove Session Configuration (30 minutes)
- **Phase 7**: Update Cron Job Script (30 minutes)
- **Phase 8**: Frontend Updates (1-2 hours)
- **Phase 9**: Update Helper Functions (1 hour)
- **Phase 10**: Testing & Validation (2-3 hours)

**Total**: ~10-15 hours

---

## Key Changes Summary

1. **Dependencies**: Add `flask-jwt-extended==4.5.0`, keep `PyJWT` temporarily
2. **Model**: `membership_active` → `membership_paid` (with migration)
3. **Authentication**: Pure JWT via flask-jwt-extended, no sessions
4. **Frontend**: Remove Patreon verification UI components
5. **Cron**: Update field references in `verify_members.py`
6. **Endpoints**: All auth endpoints use `@jwt_required()` decorator
7. **Cookies**: JWT stored in httpOnly cookies for security

---

## Files to Modify

### Backend

- `backend-python/requirements.txt`
- `backend-python/app.py` (major refactor)
- `backend-python/verify_members.py`
- `backend-python/migrate_sessions_to_db.py`
- New migration file (auto-generated)

### Frontend

- `src/components/auth/PatreonAuth.tsx`
- `src/components/auth/PatreonVerification.tsx` (deprecate/remove)
- `src/components/auth/ProtectedRoute.tsx`
- `src/hooks/useAuth.ts` (if exists)

---

## Post-Migration Tasks

1. **Monitor Logs**:
   - Monitor cron job logs for verification success/failures
   - Check for JWT-related errors
   - Monitor token expiration patterns

2. **Set Up Alerts**:
   - Alert on failed token refreshes
   - Alert on authentication failures
   - Alert on cron job failures

3. **Documentation**:
   - Document new authentication flow for team
   - Update API documentation
   - Update deployment guide

4. **Cleanup**:
   - Remove `PyJWT` from requirements.txt after migration complete
   - Remove deprecated `PatreonVerification` component
   - Remove old session-based code comments

5. **Enhancements** (Optional):
   - Add admin dashboard for viewing user membership status
   - Add refresh token rotation
   - Add CSRF protection for JWT cookies
   - Add rate limiting on auth endpoints

---

## Notes

- User model is separate from UserProfile to maintain separation of concerns
- JWT tokens stored in httpOnly cookies are more secure than localStorage
- Cron job runs on Render's free tier (may have limitations)
- Consider rate limiting on verification endpoints
- Monitor token expiration and refresh patterns
- All field references must be updated consistently across codebase
- Test thoroughly in staging environment before production deployment

---

## Troubleshooting

### Issue: JWT cookie not being set

- **Solution**: Check CORS configuration, ensure `supports_credentials=True`
- **Solution**: Verify cookie domain matches your frontend domain

### Issue: Token not found in requests

- **Solution**: Ensure frontend sends requests with `credentials: 'include'`
- **Solution**: Check JWT_TOKEN_LOCATION configuration

### Issue: Migration fails

- **Solution**: Backup database before migration
- **Solution**: Test migration on staging first
- **Solution**: Review generated migration file before applying

### Issue: Cron job fails

- **Solution**: Check environment variables are set in Render
- **Solution**: Verify database connection in cron job
- **Solution**: Check cron job logs for specific errors

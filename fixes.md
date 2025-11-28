# Database Schema Refactoring Plan

## ✅ Web3/ENS Integration - COMPLETED

### Implementation Summary
- ✅ Added `web3.py` (v6.15.1) and `eth-utils` (v2.3.1) to requirements.txt
- ✅ Imported Web3 and ENS modules in app.py with graceful fallback
- ✅ Added ENS fields to User model: `ens_name`, `crypto_address`, `content_hash`
- ✅ Added ENS fields to UserProfile model: `ens_name`, `crypto_address`, `content_hash`
- ✅ Created helper functions:
  - `username_to_ens_name()` - Converts username to `username.isharehow.eth` format
  - `resolve_ens_to_address()` - Resolves ENS name to Ethereum address
  - `get_ens_content_hash()` - Gets IPFS content hash from ENS resolver
  - `set_ens_content_hash()` - Sets IPFS content hash (requires wallet integration)
  - `resolve_or_create_ens()` - Main function to resolve/create ENS data
- ✅ Integrated ENS into user registration (automatic ENS name generation)
- ✅ Integrated ENS into Patreon OAuth callback
- ✅ Updated `to_dict()` methods to use ENS name as ID when available
- ✅ Updated profile endpoint to include ENS data in responses

### Configuration
- **ENS Domain**: `isharehow.eth`
- **Provider URL**: Set via `ENS_PROVIDER_URL` environment variable (defaults to Infura)
- **Private Key**: Set via `ENS_PRIVATE_KEY` environment variable (for setting records)

### Database Fields Added
**User Model:**
- `ens_name` (String, unique, indexed) - e.g., "isharehow.isharehow.eth"
- `crypto_address` (String, indexed) - Ethereum address (0x...)
- `content_hash` (String) - IPFS content hash

**UserProfile Model:**
- `ens_name` (String, unique, indexed) - e.g., "isharehow.isharehow.eth"
- `crypto_address` (String, indexed) - Ethereum address (0x...)
- `content_hash` (String) - IPFS content hash

### API Response Format
User IDs now use ENS format when available:
```json
{
  "id": "isharehow.isharehow.eth",
  "ensName": "isharehow.isharehow.eth",
  "cryptoAddress": "0x...",
  "contentHash": "0x...",
  ...
}
```

### Next Steps for Web3 Integration
1. Set up Ethereum provider (Infura, Alchemy, or local node)
2. Configure `ENS_PROVIDER_URL` environment variable in Render.com
3. Run database migration to add ENS fields
4. Test ENS resolution for existing users
5. Integrate with frontend Web3 dashboard panel
6. Add RainbowKit integration for wallet connections

---

## Overview
Comprehensive refactoring of user database schema to:
- Simplify redundant fields
- Properly integrate Patreon API data
- Implement Web3 domain-based IDs (✅ ENS integration complete)
- Add admin employee management

## Current Issues
- Redundant fields (membershipPaid, membershipPaymentDate, membershipAmount, pledgeStart, lastChargeDate)
- Missing Patreon API data integration (tier, renewal date, lifetime support)
- ID system doesn't use Web3 domain format
- isTeamMember should be isEmployee
- No admin interface for managing employees
- patreonConnected not auto-set based on patreonId

---

## Schema Changes

### 1. ID System - Web3 Domain Format
**Change**: Convert username to `*.isharehow.eth` format
- Example: `isharehow` → `isharehow.isharehow.eth`
- Implementation: Create helper function `username_to_web3_id(username)`
- Update all ID references to use this format
- Keep integer `id` as primary key for database, but use web3 ID for API responses

### 2. isPaidMember Field
**Current**: `membership_paid` (boolean)
**Change**: 
- Rename to `is_paid_member` for consistency
- Query Patreon API `patron_status` field
- Set to `true` if `patron_status == 'active_patron'`
- Update on every Patreon API call

### 3. isTeamMember → isEmployee
**Change**: 
- Rename `isTeamMember` to `isEmployee` across entire codebase
- Update User model: `is_employee` (already exists)
- Update UserProfile model: Add `is_employee` field
- Update all frontend references

### 4. Add isAdmin Field
**New Field**: `is_admin` (boolean, default=False)
- Add to User model
- Only admins can manage employees via settings.tsx
- Check `is_admin` before allowing employee management

### 5. Remove Fields
**Delete from UserProfile**:
- `lastChargeDate` (not needed)
- `membershipAmount` (not necessary)
- `membershipPaid` (redundant with isPaidMember)
- `membershipPaymentDate` (redundant)
- `pledgeStart` (not needed)

### 6. lastChecked Field
**Change**: 
- Update `last_checked` timestamp when "Connect Patreon Account" API endpoint is called
- Set to `datetime.utcnow()` in Patreon OAuth callback

### 7. lifetimeSupportAmount
**Fix**: 
- Pull from Patreon API `lifetime_support_cents` or calculate from payment history
- Store in UserProfile as `lifetime_support_amount` (decimal/float)
- Update when Patreon data is synced

### 8. membershipRenewalDate
**Fix**: 
- Pull from Patreon API membership data
- Store in UserProfile as `membership_renewal_date` (DateTime)
- Calculate from `next_charge_date` or membership period

### 9. membershipTier
**Fix**: 
- Pull actual tier name from Patreon API
- Store in UserProfile as `membership_tier` (String)
- Update from Patreon API response

### 10. patreonConnected
**Fix**: 
- Auto-set to `True` if `patreon_id` is not null
- Remove manual setting, make it computed property
- Update in `to_dict()` method

### 11. patreonId
**Ensure**: 
- Properly saved from Patreon API OAuth response
- Stored in both User and UserProfile models
- Used as identifier for Patreon-related operations

---

## Implementation Steps

### Phase 1: Database Migration
1. Create migration script:
   - Add `is_admin` to User model
   - Add `lifetime_support_amount` to UserProfile
   - Remove deprecated fields (lastChargeDate, membershipAmount, membershipPaid, membershipPaymentDate, pledgeStart)
   - Rename `isTeamMember` references to `isEmployee` in UserProfile
   - Add helper function for Web3 ID generation

### Phase 2: Backend API Updates
1. Update Patreon OAuth callback:
   - Fetch full membership data from Patreon API
   - Extract: tier, renewal date, lifetime support, patron status
   - Update `last_checked` timestamp
   - Auto-set `patreon_connected` based on patreon_id

2. Update profile endpoint:
   - Use Web3 ID format for response
   - Include all Patreon data fields
   - Remove deprecated fields from response

3. Create employee management endpoint:
   - `/api/admin/employees` - List all users
   - `/api/admin/employees/<id>/toggle` - Toggle isEmployee status
   - Require `is_admin` check

### Phase 3: Frontend Updates
1. Update profile.tsx:
   - Remove references to deleted fields
   - Display Web3 ID format
   - Show proper Patreon data

2. Update settings.tsx:
   - Add "Employee Management" section (admin only)
   - List all users with toggle for isEmployee
   - Show current employees

3. Update all components:
   - Replace `isTeamMember` with `isEmployee`
   - Remove references to deleted fields

### Phase 4: Patreon API Integration
1. Enhance Patreon API calls:
   - Fetch membership tier name
   - Fetch next charge date (renewal)
   - Calculate lifetime support
   - Update all fields on sync

2. Create sync endpoint:
   - `/api/auth/sync-patreon` - Force refresh Patreon data
   - Update all membership-related fields

---

## Database Schema (After Changes)

### User Model
```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Keep for DB
    username = db.Column(db.String(80), unique=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    patreon_id = db.Column(db.String(50), unique=True, nullable=True, index=True)
    access_token = db.Column(db.String(500), nullable=True)
    refresh_token = db.Column(db.String(500), nullable=True)
    is_paid_member = db.Column(db.Boolean, default=False, nullable=False)  # From Patreon API
    is_employee = db.Column(db.Boolean, default=False, nullable=False, index=True)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)  # NEW
    last_checked = db.Column(db.DateTime, nullable=True)  # Updated on Patreon connect
    token_expires_at = db.Column(db.DateTime, nullable=True)
    patreon_connected = db.Column(db.Boolean, default=False, nullable=False)  # Auto-set from patreon_id
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### UserProfile Model
```python
class UserProfile(db.Model):
    id = db.Column(db.String(36), primary_key=True)  # Web3 ID format: username.isharehow.eth
    email = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(200))
    avatar_url = db.Column(db.Text)
    patreon_id = db.Column(db.String(50), nullable=True, index=True)
    membership_tier = db.Column(db.String(50))  # From Patreon API
    is_paid_member = db.Column(db.Boolean, default=False)  # From Patreon API
    is_employee = db.Column(db.Boolean, default=False)  # NEW (renamed from isTeamMember)
    membership_renewal_date = db.Column(db.DateTime, nullable=True)  # From Patreon API
    lifetime_support_amount = db.Column(db.Numeric(10, 2), nullable=True)  # From Patreon API (in dollars)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # REMOVED FIELDS:
    # - lastChargeDate
    # - membershipAmount
    # - membershipPaid (redundant)
    # - membershipPaymentDate (redundant)
    # - pledgeStart
```

---

## API Response Format (After Changes)

```json
{
  "id": "isharehow.isharehow.eth",
  "username": "isharehow",
  "email": "jamel@jameleliyah.com",
  "name": "isharehow",
  "avatar": "https://...",
  "avatarUrl": "https://...",
  "patreonId": "12345678",
  "patreonConnected": true,
  "isPaidMember": true,
  "isEmployee": false,
  "isAdmin": false,
  "membershipTier": "Premium",
  "membershipRenewalDate": "2025-12-25T00:00:00Z",
  "lifetimeSupportAmount": 150.00,
  "lastChecked": "2025-11-28T10:30:00Z",
  "createdAt": "2025-11-25T02:52:09Z"
}
```

---

## Helper Functions Needed

### Web3 ID Generator
```python
def username_to_web3_id(username: str) -> str:
    """Convert username to Web3 domain format"""
    if not username:
        return None
    return f"{username}.isharehow.eth"
```

### Patreon Connected Checker
```python
@property
def patreon_connected(self):
    """Auto-compute patreon_connected from patreon_id"""
    return self.patreon_id is not None
```

### Patreon Data Sync
```python
def sync_patreon_data(user, patreon_response):
    """Update all Patreon-related fields from API response"""
    # Extract data from Patreon API response
    # Update: is_paid_member, membership_tier, membership_renewal_date, lifetime_support_amount
    # Set last_checked = datetime.utcnow()
```

---

## Migration Checklist

- [ ] Create migration script
- [ ] Add is_admin field
- [ ] Add lifetime_support_amount field
- [ ] Remove deprecated fields
- [ ] Update isTeamMember → isEmployee
- [ ] Add Web3 ID helper function
- [ ] Update Patreon OAuth callback
- [ ] Update profile endpoint
- [ ] Create employee management endpoints
- [ ] Update frontend profile page
- [ ] Update frontend settings page (admin section)
- [ ] Update all isTeamMember references
- [ ] Test Patreon API integration
- [ ] Test employee management
- [ ] Update documentation

---

## Notes

- Keep integer `id` as primary key for database relationships
- Use Web3 ID format (`username.isharehow.eth`) for API responses and frontend
- All Patreon data should be refreshed on OAuth callback
- Admin check: `user.is_admin == True` for employee management
- Employee check: `user.is_employee == True` for employee features

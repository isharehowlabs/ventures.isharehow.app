# User Tier & Access Control System

## Overview
Complete user hierarchy with pricing, dashboard access, and permission levels.

---

## User Tiers

### 1. **Prospect** (Free Trial)
- **Price**: FREE
- **Duration**: 7 days
- **Access**:
  - ✅ Rise Dashboard (trial)
  - ✅ CoWork Dashboard (trial)
  - ✅ Support Requests (trial - 15 requests max)
- **Activation**: Automatic when signing up via form
- **Purpose**: Try before you buy
- **After Trial**: Must upgrade to User or Client tier

### 2. **User** ($17.99/month)
- **Price**: $17.99 USD/month
- **Payment Methods**:
  - Shopify Bold Subscription
  - ETH payment to isharehow.eth
- **Access**:
  - ✅ Rise Dashboard (full)
  - ✅ CoWork Dashboard (full)
  - ❌ Support Requests
  - ❌ Client Management
- **Purpose**: Personal productivity and wellness

### 3. **Client Tiers** (Business Services)

#### Client Starter ($222/month)
- **Price**: $222 USD/month
- **Support Requests**: 15 per month
- **Access**:
  - ✅ Rise Dashboard
  - ✅ CoWork Dashboard
  - ✅ Support Request System
  - ❌ Client Management

#### Client Professional ($500/month)
- **Price**: $500 USD/month
- **Support Requests**: 50 per month
- **Access**: Same as Starter + more requests

#### Client Enterprise ($1,500/month)
- **Price**: $1,500 USD/month
- **Support Requests**: UNLIMITED
- **Access**: Same as Pro + unlimited requests

### 4. **Employee** (Staff)
- **Price**: FREE (no payment required)
- **Access**:
  - ✅ Rise Dashboard
  - ✅ CoWork Dashboard
  - ✅ Creative Dashboard
  - ✅ Client Management (CRM)
  - ✅ Prospect Management
  - ✅ Support Request System
  - ❌ Admin Panel
- **Purpose**: Manage clients and prospects, fulfill support requests
- **Set by**: Admin only

### 5. **Admin** (Full Access)
- **Price**: FREE (no payment required)
- **Access**: EVERYTHING
  - ✅ All Dashboards
  - ✅ Employee Management
  - ✅ Client Management
  - ✅ Prospect Management
  - ✅ Support Request System
  - ✅ Admin Panel
- **Purpose**: System administration
- **Set by**: Database flag `is_admin=True`

---

## Dashboard Matrix

| Dashboard | Prospect | User | Client | Employee | Admin |
|-----------|----------|------|--------|----------|-------|
| **Rise** | ✅ (trial) | ✅ | ✅ | ✅ | ✅ |
| **CoWork** | ✅ (trial) | ✅ | ✅ | ✅ | ✅ |
| **Creative** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Clients** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Prospects** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Support** | ✅ (15 max) | ❌ | ✅ (tier limit) | ✅ | ✅ |
| **Admin** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Support Request Limits

| Tier | Monthly Requests |
|------|------------------|
| Prospect (trial) | 15 |
| User | 0 (no access) |
| Client Starter | 15 |
| Client Professional | 50 |
| Client Enterprise | ∞ (unlimited) |
| Employee | ∞ (manage all) |
| Admin | ∞ (manage all) |

---

## Payment & Activation

### For Users ($17.99)
**Option 1: Shopify Bold Subscription**
- Go to `/api/shopify/subscribe`
- Subscribe via Shopify checkout
- Automatically activated on payment

**Option 2: ETH Payment**
- Send $17.99 USD equivalent in ETH
- To address: `isharehow.eth`
- System verifies transaction
- Account activated automatically

### For Clients ($222+)
**Shopify Bold Subscription Only**
- Choose tier: Starter ($222), Pro ($500), or Enterprise ($1,500)
- Subscribe via Shopify
- Automatically creates Client record in CRM
- Support request system activated

### For Prospects (FREE)
**Automatic Trial**
- Fill out any signup form
- 7-day trial starts immediately
- Access to User dashboards + Client support features
- Must upgrade before trial expires

---

## User Lifecycle

### New User Signup Flow

```
1. User fills signup form
   ↓
2. Account created as PROSPECT
   ↓
3. trial_start_date = now
   ↓
4. Access granted to:
   - Rise Dashboard
   - CoWork Dashboard
   - Support Requests (15 max)
   ↓
5. 7 days later → Trial expires
   ↓
6. User must upgrade:
   - Pay $17.99 → USER tier
   - Pay $222+ → CLIENT tier
   - Or lose access
```

### Client Conversion Flow

```
1. Prospect or User wants business services
   ↓
2. Chooses Client tier ($222/$500/$1500)
   ↓
3. Pays via Shopify
   ↓
4. Client record created in CRM
   ↓
5. Support request system activated
   ↓
6. Support requests tracked monthly
```

### Employee Assignment

```
1. Admin logs into Admin Panel
   ↓
2. Navigates to user management
   ↓
3. Sets user.is_employee = True
   ↓
4. Employee gains access to:
   - Creative Dashboard
   - Client Management
   - Prospect Management
```

---

## Database Fields

### User Model Additions

```python
# Auth provider tracking
auth_provider = 'email' | 'wallet' | 'google'
google_id = String(100), nullable

# Trial tracking
trial_start_date = DateTime, nullable

# ETH payment tracking
eth_payment_verified = Boolean, default=False
eth_payment_amount = Numeric(18, 8), nullable
eth_payment_tx_hash = String(66), nullable
eth_payment_date = DateTime, nullable

# Access flags (existing)
is_admin = Boolean, default=False
is_employee = Boolean, default=False
membership_paid = Boolean, default=False

# Shopify subscription (existing)
subscription_update_active = Boolean
bold_subscription_id = String(50)
```

---

## API Endpoints for Access Control

### Check User Access
```http
GET /api/user/access
Authorization: Bearer <token>

Response:
{
  "tier": "user",
  "tier_name": "User",
  "price_usd": 17.99,
  "dashboards": ["rise", "cowork"],
  "dashboard_access": {
    "rise": true,
    "cowork": true,
    "creative": false,
    "clients": false,
    "prospects": false,
    "support": false,
    "admin": false
  },
  "is_trial": false,
  "trial_expires": null,
  "max_support_requests": 0,
  "can_manage_clients": false,
  "can_manage_employees": false
}
```

### Start Prospect Trial
```http
POST /api/auth/start-trial
Body: { "email": "user@example.com" }

Response:
{
  "success": true,
  "trial_start": "2025-12-07T00:00:00Z",
  "trial_expires": "2025-12-14T00:00:00Z",
  "access_granted": ["rise", "cowork", "support"]
}
```

### Upgrade Tier
```http
POST /api/user/upgrade
Authorization: Bearer <token>
Body: {
  "target_tier": "client_starter",
  "payment_method": "shopify",
  "payment_id": "sub_123456"
}

Response:
{
  "success": true,
  "new_tier": "client_starter",
  "dashboards_added": ["support"],
  "max_requests": 15
}
```

### Check Support Request Usage
```http
GET /api/support/usage
Authorization: Bearer <token>

Response:
{
  "tier": "client_starter",
  "max_requests": 15,
  "used_requests": 8,
  "remaining_requests": 7,
  "resets_at": "2025-01-01T00:00:00Z"
}
```

---

## Frontend Implementation

### Access Check Hook
```typescript
import { useAuth } from './hooks/useAuth';

function Dashboard() {
  const { user } = useAuth();
  
  // Check specific dashboard access
  if (!user.dashboard_access?.rise) {
    return <UpgradePrompt />;
  }
  
  return <RiseDashboard />;
}
```

### Tier Display
```typescript
function UserProfile() {
  const { user } = useAuth();
  
  return (
    <div>
      <h2>{user.tier_name}</h2>
      <p>Price: ${user.price_usd}/month</p>
      {user.is_trial && (
        <p>Trial expires: {user.trial_expires}</p>
      )}
      {user.max_support_requests > 0 && (
        <p>Support requests: {user.max_support_requests}/month</p>
      )}
      <UpgradeOptions />
    </div>
  );
}
```

---

## Security & Validation

### Access Checks
1. **Middleware**: Check tier before loading dashboard
2. **API Gating**: Validate access on every request
3. **Client-side**: Hide UI for unauthorized features
4. **Server-side**: Always enforce on backend

### Trial Enforcement
```python
def check_trial_expired(user):
    if user.trial_start_date:
        expires = user.trial_start_date + timedelta(days=7)
        if datetime.utcnow() > expires:
            # Block access
            return False
    return True
```

### Support Request Limiting
```python
def can_create_support_request(user):
    tier = get_user_tier(user)
    limit = get_support_request_limit(user)
    
    if limit is None:  # Unlimited
        return True
    
    if limit == 0:  # No access
        return False
    
    # Check monthly usage
    current_month_requests = count_requests_this_month(user)
    return current_month_requests < limit
```

---

## Migration Path

### Existing Users
- Users with `membership_paid=True` → USER tier
- Users with `is_employee=True` → EMPLOYEE tier
- Users with `is_admin=True` → ADMIN tier
- Users with client records → CLIENT tier (based on amount)
- Everyone else → PROSPECT tier (no trial)

### Data Migration Script
```python
def migrate_existing_users():
    users = User.query.all()
    for user in users:
        if user.is_admin:
            continue  # Already set
        elif user.is_employee:
            continue  # Already set
        elif has_client_record(user):
            # Set client tier based on payment
            amount = get_client_payment_amount(user)
            if amount >= 1500:
                # Enterprise
            elif amount >= 500:
                # Pro
            else:
                # Starter
        elif user.membership_paid:
            # Keep as USER tier
        else:
            # Set as PROSPECT (no auto-trial for existing)
            pass
```

---

## Success Metrics

✅ Users can self-serve upgrade from Prospect to User
✅ Clients automatically created on $222+ payment
✅ Employees manage clients and prospects
✅ Admins control all users and settings
✅ 7-day trials convert to paid users
✅ Support requests tracked and limited by tier
✅ ETH payments activate User tier
✅ Shopify subscriptions sync automatically

---

**Last Updated**: December 7, 2025
**Status**: Ready for Implementation
**Next Steps**: Integrate with wallet auth and Shopify Bold API

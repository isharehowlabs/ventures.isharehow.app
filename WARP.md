# Ventures iShareHow App - Development Notes

## Project Overview
Full-stack application with React/TypeScript frontend and Python Flask backend, deployed on Render.com.

- **Frontend**: https://ventures.isharehow.app
- **Backend API**: https://api.ventures.isharehow.app
- **Framework**: Next.js (React/TypeScript)
- **Backend**: Python Flask with PostgreSQL (10,763 lines)
- **Real-time**: Socket.io for live updates
- **Database**: PostgreSQL on Render

---

## 🚨 CURRENT STATE - Ready for Database & Auth Rework (Dec 7, 2025)

### Recent Updates Detected

#### 1. **Database Schema Changes** (3 New Migrations)
Three migrations were added to transition from Patreon to Shopify/Bold Subscriptions:

**Migration 35**: `add_client_id_to_support_requests`
- Adds `client_id` (String 36, FK to clients.id) to `support_requests` table
- Creates index `ix_support_requests_client_id`
- Links support requests to client accounts

**Migration 36**: `add_user_id_to_clients`
- Adds `user_id` (Integer, FK to users.id) to `clients` table
- Creates index `ix_clients_user_id`
- Enables clients to have associated user accounts

**Migration 37**: `replace_patreon_with_shopify`
- **NEW COLUMNS** on `users` table:
  - `has_subscription_update` (Boolean, default False)
  - `subscription_update_active` (Boolean, default False)
  - `shopify_customer_id` (String 50, indexed)
  - `bold_subscription_id` (String 50, indexed)
- **KEPT**: Old Patreon columns (for backward compatibility)
  - `patreon_id`, `access_token`, `refresh_token`, `patreon_connected`, `token_expires_at`
- Shopify/Bold integration is **prepared but not fully implemented**

---

### 2. **Current User/Auth System Architecture**

#### **User Model** (`users` table) - Authentication User
Located: `backend-python/app.py` lines 486-560

**Core Fields**:
- `id` (Integer, PK)
- `username` (String 80, unique, indexed)
- `email` (String 120, unique, indexed)
- `password_hash` (String 255)
- `created_at`, `updated_at` (DateTime)

**Deprecated Patreon Fields** (marked for removal):
- `patreon_id` (String 50, unique, indexed)
- `access_token`, `refresh_token` (Text)
- `patreon_connected` (Boolean)
- `token_expires_at` (DateTime)

**New Shopify/Bold Fields**:
- `has_subscription_update` (Boolean)
- `subscription_update_active` (Boolean)
- `shopify_customer_id` (String 50, indexed)
- `bold_subscription_id` (String 50, indexed)
- `membership_paid` (Boolean, default False)

**Access Control**:
- `is_employee` (Boolean, indexed)
- `is_admin` (Boolean, indexed)
- `last_checked` (DateTime)

**Web3/ENS Fields**:
- `ens_name` (String 255, unique, indexed) - e.g. "user.isharehow.eth"
- `crypto_address` (String 42, indexed) - Ethereum address
- `content_hash` (String 255) - IPFS content hash

**Methods**:
- `set_password(password)` - bcrypt hashing
- `check_password(password)` - bcrypt verification
- `to_dict()` - Serialization for API responses

**Relationships**:
- One-to-many with `clients` (via `user_id`)
- One-to-many with `notifications`

---

#### **UserProfile Model** (`user_profiles` table) - Wellness/App Data
Located: `backend-python/app.py` lines 607-650

**Core Fields**:
- `id` (String 36, PK) - ENS name or Patreon user ID
- `email` (String 255, unique)
- `name` (String 200)
- `avatar_url` (Text)

**Membership**:
- `patreon_id` (String 50, nullable)
- `membership_tier` (String 50)
- `is_paid_member` (Boolean)
- `is_employee` (Boolean) - renamed from isTeamMember
- `membership_renewal_date` (DateTime)
- `lifetime_support_amount` (Numeric 10,2)

**Web3/ENS**:
- `ens_name` (String 255, unique, indexed)
- `crypto_address` (String 42, indexed)
- `content_hash` (String 255)

**Related Models**:
- `AuraProgress` - Physical/Mental/Spiritual/etc progress (0-100)
- `Achievement` - User achievements
- `UserAPIKey` - Encrypted API keys for services
- `IntervalsActivityData` - Fitness tracking
- `IntervalsMenstrualData` - Cycle tracking

---

#### **Client Model** (`clients` table) - CRM/Business Clients
Located: `backend-python/app.py` lines 7940-7982

**Core Fields**:
- `id` (String 36, PK, UUID)
- `name` (String 200)
- `email` (String 255, unique, indexed)
- `company` (String 200)
- `phone` (String 50, nullable)
- `status` (String 20) - pending, active, inactive, prospect
- `tier` (String 50, nullable) - starter, professional, enterprise
- `notes` (Text)
- `tags` (Text) - JSON array

**NEW Link to User**:
- `user_id` (Integer, FK to users.id, indexed) - **NEW in Migration 36**
- Enables client to have an associated login account

**Relationships**:
- `employee_assignments` (ClientEmployeeAssignment)
- `dashboard_connections` (ClientDashboardConnection)
- `user` (back-reference to User model)

**to_dict() includes**:
- `userId`, `hasAccount` - NEW fields
- `assignedEmployee` - From employee_assignments
- `systemsConnected` - From dashboard_connections

---

#### **SupportRequest Model** (`support_requests` table)
Located: `backend-python/app.py` lines 8018-8060

**Core Fields**:
- `id` (String 36, PK, UUID)
- `client_id` (String 36, FK to clients.id, indexed) - **NEW in Migration 35**
- `client_name` (String 200, nullable) - Fallback display name
- `subject` (String 255)
- `description` (Text)
- `priority` (String 20) - low, medium, high, urgent
- `status` (String 20) - open, in-progress, resolved, closed
- `assigned_to` (String 200, nullable)
- `created_at`, `updated_at` (DateTime)

**NEW Link to Client**:
- Support requests can now be linked to client records
- `to_dict()` returns `linkedTasksCount` from Task model

---

### 3. **Authentication System**

#### JWT-Based Auth (httpOnly cookies)
- **Token Generation**: `/api/auth/login`, `/api/auth/register`
- **Token Validation**: `@jwt_required()` decorator
- **Current User**: `get_jwt_identity()` returns user_id
- **Timeout**: 15 seconds (increased from 5s on Dec 4)

#### Auth Endpoints
Located: `backend-python/app.py` lines 2060-2500

**Registration** - `/api/auth/register` (POST)
- Checks `DB_AVAILABLE`, reconnects if needed
- Creates new User with bcrypt password
- Returns JWT token

**Login** - `/api/auth/login` (POST)
- Validates credentials with bcrypt
- Returns JWT token + user data
- Includes Shopify/Bold fields in response

**Current User** - `/api/auth/me` (GET, jwt_required optional)
- Returns authenticated user info
- Includes: userId, username, email, isPaidMember, isEmployee, isAdmin
- Includes: hasSubscriptionUpdate, subscriptionUpdateActive
- Includes: shopifyCustomerId, boldSubscriptionId

#### Database Connection Handling
Both login and register endpoints:
1. Check `DB_AVAILABLE` global flag
2. Attempt reconnection if false: `db.engine.connect()`
3. Set `DB_AVAILABLE = True` on success
4. Return 500 error if database unavailable

---

### 4. **Shopify/Bold Subscriptions Integration** (Partial)

#### Configuration
Located: `backend-python/app.py` lines 6623-6638

```python
# Environment Variables Required:
BOLD_SUBSCRIPTIONS_API_KEY = os.environ.get('BOLD_SUBSCRIPTIONS_API_KEY', '')
BOLD_SUBSCRIPTIONS_SHOP_DOMAIN = os.environ.get('BOLD_SUBSCRIPTIONS_SHOP_DOMAIN', '0e1cwk-u0.myshopify.com')
```

#### Webhook Endpoint
`/api/shopify/webhook` (POST) - Line 6658
- Verifies HMAC signature
- Handles Shopify webhook events
- **Status**: Skeleton exists, needs implementation

#### GraphQL Client
`shopify_graphql(query, variables)` - Line 882
- Makes GraphQL requests to Shopify API
- Used for product/order queries

#### Current Usage
- PRODUCTS_QUERY - Fetches products (line 964)
- ORDERS_QUERY - Fetches orders (line 990)
- Checkout URL generation for clients (line 6189)

**Status**: Infrastructure exists but subscription management not fully implemented

---

### 5. **Tasks Feature** (Fully Working)

#### Recent Changes (Dec 4, 2025)
- Removed `@require_session` from UPDATE/DELETE endpoints
- Tasks work with **optional authentication**
- Assignment fields added: `createdBy`, `assignedTo`, `createdByName`, `assignedToName`
- Socket.io event: `task_assigned`

#### API Endpoints
```
GET    /api/tasks          - List all tasks (no auth)
POST   /api/tasks          - Create task (no auth)
PUT    /api/tasks/<id>     - Update task (no auth)
DELETE /api/tasks/<id>     - Delete task (no auth)
```

#### Task Model Fields
- `id`, `title`, `description`, `hyperlinks[]`, `status`
- `supportRequestId` - Link to support request
- `createdBy`, `createdByName` - Creator info
- `assignedTo`, `assignedToName` - Assignment info
- `createdAt`, `updatedAt` - Timestamps

---

## 🎯 DATABASE & AUTH REWORK SCOPE

### Issues Identified

1. **Dual User Systems**
   - `User` (authentication) and `UserProfile` (wellness data) are separate
   - Overlap in fields: email, name, ENS, crypto address
   - Potential for data inconsistency
   - Migration 36 adds `user_id` to clients, suggesting unification intent

2. **Patreon Legacy Code**
   - Deprecated fields still in User model
   - Migration 37 keeps old Patreon columns "for backward compatibility"
   - Access tokens stored (security concern)
   - Should be removed entirely

3. **Incomplete Shopify Integration**
   - Fields exist but webhook logic incomplete
   - No subscription management endpoints
   - No Bold Subscriptions API integration
   - Checkout flow references but not implemented

4. **Client-User Relationship**
   - Migration 36 adds `user_id` to clients
   - Clients can now have user accounts
   - Support requests link to clients (Migration 35)
   - **Question**: Should clients authenticate differently from regular users?

5. **Authentication Complexity**
   - JWT with httpOnly cookies
   - Database reconnection logic in every auth endpoint
   - Optional auth for tasks (intentional design)
   - No refresh token mechanism visible

6. **Web3/ENS Integration**
   - Fields exist in both User and UserProfile
   - ENS name used as profile ID
   - Content hash for IPFS
   - **Question**: Should this be the primary auth method?

---

### Recommended Rework Plan

#### Phase 1: User Model Consolidation
- [ ] Merge `User` and `UserProfile` into single `User` model
- [ ] Decide on primary ID: Integer vs UUID vs ENS name
- [ ] Remove all Patreon-related fields
- [ ] Keep Web3/ENS fields (future-proofing)
- [ ] Add `user_type` field: 'customer', 'client', 'employee', 'admin'
- [ ] Migrate existing data from UserProfile to User

#### Phase 2: Client-User Relationship
- [ ] Keep `clients` table for CRM data
- [ ] Use `user_id` FK to link to User account
- [ ] Clients who need login get a User record with type='client'
- [ ] Support requests link to clients, clients link to users
- [ ] Tasks can be assigned to any user (employee or client)

#### Phase 3: Shopify/Bold Implementation
- [ ] Complete webhook handlers
- [ ] Add subscription management endpoints:
  - GET /api/subscriptions/status
  - POST /api/subscriptions/create
  - PUT /api/subscriptions/update
  - DELETE /api/subscriptions/cancel
- [ ] Implement Bold Subscriptions API calls
- [ ] Sync subscription status to User.membership_paid
- [ ] Add subscription_tier field

#### Phase 4: Authentication Modernization
- [ ] Add refresh token mechanism
- [ ] Improve database reconnection (connection pooling)
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add OAuth options (Google, GitHub) if needed
- [ ] Consider Web3 wallet auth (ENS/Ethereum)

#### Phase 5: Migration Strategy
- [ ] Write Alembic migrations for schema changes
- [ ] Create data migration scripts
- [ ] Test migration on staging database
- [ ] Plan rollback strategy
- [ ] Update API documentation
- [ ] Update frontend to use new fields

---

## 📊 Current Database Schema Summary

### Core Tables
1. **users** (auth) - 486-560
   - Authentication, permissions, subscriptions
   - Links: clients (via user_id), notifications

2. **user_profiles** (wellness) - 607-650
   - Wellness data, membership, progress
   - Links: aura_progress, achievements, api_keys, intervals data

3. **clients** (CRM) - 7940-7982
   - Business clients, CRM info
   - **NEW**: user_id link (Migration 36)
   - Links: employee_assignments, dashboard_connections, user

4. **support_requests** - 8018-8060
   - Support tickets
   - **NEW**: client_id link (Migration 35)
   - Links: tasks (via support_request_id)

5. **tasks** - 3800-3900 (approx)
   - Task management with assignments
   - Optional auth, Socket.io events

### Supporting Tables
- `notifications` - User notifications
- `aura_progress` - Wellness metrics
- `achievements` - User achievements
- `user_api_keys` - Encrypted service credentials
- `intervals_activity_data` - Fitness tracking
- `intervals_menstrual_data` - Cycle tracking
- `client_employee_assignments` - Employee-to-client mapping
- `client_dashboard_connections` - System integrations
- `subscriptions` - Subscription records (separate from user)

---

## 🔧 Architecture

### Backend Structure
- **Location**: `backend-python/`
- **Main File**: `app.py` (10,763 lines)
- **Database**: PostgreSQL on Render
- **ORM**: SQLAlchemy with Flask-SQLAlchemy
- **Migrations**: Alembic (versions/ folder)
- **Deployment**: Auto-deploy via GitHub → Render

### Frontend Structure
- **Framework**: Next.js with TypeScript
- **Hooks**: 
  - `useAuth.ts` - Authentication (15s timeout)
  - `useTasks.ts` - Tasks with Socket.io
  - `useRiseJourney.ts` - Rise Journey feature
- **Utils**:
  - `backendUrl.ts` - API base URL
  - `socket.ts` - Socket.io client

---

## 📋 TODO: Database & Auth Rework

### Immediate Actions (This Session)
- [x] Document current state in WARP.md
- [ ] Create database schema diagram
- [ ] List all tables and relationships
- [ ] Identify data to migrate vs drop
- [ ] Draft new User model schema
- [ ] Plan migration sequence
- [ ] Estimate breaking changes for frontend

### Next Steps
- [ ] Review and approve new schema design
- [ ] Write Alembic migration scripts
- [ ] Create data migration utilities
- [ ] Update API endpoints
- [ ] Update frontend hooks/types
- [ ] Test authentication flows
- [ ] Test Shopify webhook integration
- [ ] Deploy to staging
- [ ] Test end-to-end
- [ ] Deploy to production

---

## 🚀 Deployment

### Backend
1. Changes to `backend-python/app.py`
2. Commit: `git add . && git commit -m "message"`
3. Push: `git push origin master`
4. Render auto-deploys (2-5 minutes)
5. Check logs at Render dashboard

### Database Migrations
```bash
cd backend-python
# Generate migration
alembic revision --autogenerate -m "description"
# Review migration in migrations/versions/
# Apply migration
alembic upgrade head
```

### Frontend
- Built as static Next.js export
- Served from current directory
- Build: `npm run build`
- Deploy: Push to repository

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DB_AVAILABLE` flag
- Verify DATABASE_URL environment variable
- Check Render database status
- Review connection pool settings

### Authentication Errors
- Verify JWT token in cookies
- Check token expiration
- Confirm user exists in database
- Review CORS settings

### Migration Issues
- Check Alembic version history: `alembic current`
- View pending migrations: `alembic history`
- Rollback if needed: `alembic downgrade -1`
- Always test migrations on staging first

---

## 📝 Recent Commits

```
b7c001a3 (HEAD) Build: Update production files 2025-12-06 21:21:56
db728240 push
21c70f92 push
a3020315 pushing
6f33c7d6 Build: Update production files 2025-12-06 19:38:33
752cce23 saving
e8c8b4cb Build: Update production files 2025-12-06 19:18:25
ca469d8c Build: Update production files 2025-12-06 18:39:31
17f8d32c Fix syntax error in GET support-requests endpoint
2b60443c Remove auth from support requests endpoints
```

**Key Changes**: 
- 3 new migrations (35, 36, 37)
- Support requests link to clients
- Clients link to users
- Shopify/Bold fields added
- Support request endpoints updated

---

## 📚 References

- **Backend API**: https://api.ventures.isharehow.app
- **Frontend**: https://ventures.isharehow.app
- **GitHub**: https://github.com/\[repo-name\]
- **Render Dashboard**: https://dashboard.render.com
- **PostgreSQL**: Hosted on Render
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **Flask-SQLAlchemy**: https://flask-sqlalchemy.palletsprojects.com/

---

**Last Updated**: December 7, 2025
**Status**: Ready for Database & Authentication System Rework
**Backend Lines**: 10,763
**Migrations Pending**: None (all applied)
**Breaking Changes**: High probability with consolidation

---

## 🌐 WEB3 ACCOUNT LOGIN FEATURES - Current Implementation

**Last Scanned**: December 7, 2025

### Overview
Your system has **partial Web3/ENS integration** with infrastructure in place but **NO wallet-based authentication**. The features are primarily **display/informational** rather than authentication mechanisms.

---

### ✅ What EXISTS

#### 1. **Backend Web3/ENS Infrastructure** (Lines 46-448)

**Dependencies**:
- `web3==6.15.1` installed in requirements.txt
- `from web3 import Web3`
- `from ens import ENS`

**Configuration** (Lines 349-369):
```python
ENS_DOMAIN = 'isharehow.eth'
ENS_PROVIDER_URL = os.environ.get('ENS_PROVIDER_URL', 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY')
ENS_PRIVATE_KEY = os.environ.get('ENS_PRIVATE_KEY')  # Optional, for setting records

# Initialization
w3 = Web3(Web3.HTTPProvider(ENS_PROVIDER_URL))
ens = ENS.from_web3(w3)
```

**Status**: 
- ✅ Module loads successfully
- ⚠️ Requires valid Infura key in environment
- ⚠️ Currently uses placeholder: "YOUR_INFURA_KEY"

---

#### 2. **ENS Helper Functions** (Lines 372-448)

**`username_to_ens_name(username: str)`**
- Converts username to format: `username.isharehow.eth`
- Normalizes: lowercase, removes spaces
- Example: "Alice" → "alice.isharehow.eth"

**`resolve_ens_to_address(ens_name: str)`**
- Resolves ENS name to Ethereum address
- Returns checksummed address (0x...)
- Returns None if not found or Web3 unavailable

**`get_ens_content_hash(ens_name: str)`**
- Retrieves IPFS content hash from ENS resolver
- Returns hex string (0x...)
- Used for decentralized profile storage

**`set_ens_content_hash(ens_name: str, ipfs_hash: str, private_key: str)`**
- **STUB FUNCTION** - Not implemented
- Would require wallet integration
- Currently returns False

**`resolve_or_create_ens(user_id: int, username: str)`** (Lines 429-448)
- Called during user registration
- Generates ENS name from username
- Attempts to resolve to crypto address
- Fetches content hash if available
- Returns dict with: `ens_name`, `crypto_address`, `content_hash`

---

#### 3. **Database Fields - User Model** (Lines 508-510)

```python
ens_name = db.Column(db.String(255), unique=True, nullable=True, index=True)
crypto_address = db.Column(db.String(42), nullable=True, index=True)  
content_hash = db.Column(db.String(255), nullable=True)
```

**Also in UserProfile Model** (Lines 620-622):
```python
ens_name = db.Column(db.String(255), unique=True, nullable=True, index=True)
crypto_address = db.Column(db.String(42), nullable=True, index=True)
content_hash = db.Column(db.String(255), nullable=True)
```

**Usage**:
- Stored on user registration (Line 2167-2169)
- Displayed in profile and Web3 dashboard
- Used as alternative user ID (Line 526-527)
- **NOT used for authentication**

---

#### 4. **API Endpoint: Verify ENS** (Lines 3287-3350)

**`POST /api/profile/verify-ens`** (@jwt_required)

**Purpose**: Refresh/update ENS data for authenticated user

**Flow**:
1. Get current user from JWT
2. Resolve ENS name from username
3. Fetch crypto address and content hash from blockchain
4. Update User table with resolved data
5. Update UserProfile table (if exists)
6. Return updated ENS data

**Usage**: Called manually to sync blockchain data, not for login

---

#### 5. **Frontend Web3 Support**

**Dependencies** (package.json):
- `ethers@6.16.0` - Ethereum JavaScript library
- `@pushprotocol/restapi@1.7.32` - Push Protocol chat

**Type Definitions** (src/types/window.d.ts):
```typescript
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (event: string, handler: (...args: any[]) => void) => void;
    isMetaMask?: boolean;
  };
}
```

**User Interface** (src/hooks/useAuth.ts, lines 27-29):
```typescript
interface User {
  ensName?: string;
  cryptoAddress?: string;
  contentHash?: string;
  // ... other fields
}
```

---

#### 6. **Push Protocol Chat Integration** (src/hooks/usePushChat.ts)

**Purpose**: Decentralized chat using Web3 wallet authentication

**Features**:
- Connects to user's MetaMask/Web3 wallet
- Requests account access: `window.ethereum.request({ method: 'eth_requestAccounts' })`
- Creates ethers signer from wallet
- Initializes Push Protocol with wallet signature
- Enables wallet-to-wallet messaging

**Flow**:
```typescript
1. Check for window.ethereum
2. Request wallet connection
3. Create ethers.BrowserProvider(window.ethereum)
4. Get signer from provider
5. Initialize Push Protocol with signer
6. Set up real-time chat streams
```

**Status**: 
- ✅ Fully implemented for chat feature
- ✅ Uses wallet for signing messages
- ❌ **NOT integrated with main authentication system**
- Push chat is separate from login/registration

---

#### 7. **Web3Panel Component** (src/components/dashboard/Web3Panel.tsx)

**Purpose**: Display Web3 identity and blockchain data

**Features**:
- Shows ENS domain (e.g., "alice.isharehow.eth")
- Shows Ethereum address with Etherscan link
- Shows IPFS content hash
- Displays crypto balance (ETH)
- Shows recent transactions
- Shows current ETH price

**API Calls**:
- `GET /api/web3/balance` (credentials: include)
- `GET /api/web3/transactions` (credentials: include)
- `GET /api/web3/price` (credentials: include)

**Status**:
- ✅ Component exists and renders
- ⚠️ Backend endpoints `/api/web3/*` **DO NOT EXIST**
- Component will show loading/error states
- Displays ENS data from user profile

---

### ❌ What DOES NOT EXIST

#### 1. **Wallet-Based Authentication**
- ❌ No "Sign in with Ethereum" button
- ❌ No message signing for login verification
- ❌ No nonce generation for wallet auth
- ❌ No signature verification endpoint
- ❌ Cannot login with just a wallet (MetaMask/WalletConnect)

**Current Auth**: Username/password OR Patreon OAuth only

---

#### 2. **Web3 API Endpoints**
Missing backend routes:
- ❌ `/api/web3/balance` - Referenced in Web3Panel but doesn't exist
- ❌ `/api/web3/transactions` - Referenced in Web3Panel but doesn't exist
- ❌ `/api/web3/price` - Referenced in Web3Panel but doesn't exist
- ❌ `/api/auth/wallet/nonce` - For wallet auth nonce
- ❌ `/api/auth/wallet/verify` - For signature verification
- ❌ `/api/auth/wallet/login` - For wallet-based login

---

#### 3. **Wallet Connection in Auth Flow**
- ❌ No wallet connect button on login page
- ❌ No option to link wallet to existing account
- ❌ No wallet as primary authentication method
- ❌ No session tied to wallet address
- ❌ No automatic account creation from wallet

**Current**: ENS fields are populated AFTER traditional registration, not used FOR registration

---

#### 4. **ENS Record Writing**
- ❌ `set_ens_content_hash()` is a stub (line 410-429)
- ❌ No endpoint to update ENS records
- ❌ No wallet transaction signing for on-chain updates
- ❌ Cannot set avatar, URL, or other ENS text records

**Reason**: Requires wallet integration and gas fees

---

#### 5. **Smart Contract Integration**
- ❌ No smart contract ABIs
- ❌ No contract interaction endpoints
- ❌ No token gating (NFT/token ownership for access)
- ❌ No on-chain subscription verification
- ❌ No blockchain payments

---

#### 6. **Multi-Chain Support**
- ❌ Only Ethereum mainnet configured
- ❌ No support for Polygon, Arbitrum, Base, etc.
- ❌ No chain switching
- ❌ No multi-wallet support (only expects MetaMask)

---

### 🔄 Current Web3 Flow

#### Registration Flow (Line 2159-2185)
```
User registers with username/email/password
    ↓
Backend calls resolve_or_create_ens(username)
    ↓
Generates ENS name: username.isharehow.eth
    ↓
Attempts to resolve to Ethereum address (likely fails)
    ↓
Stores ENS name, address (null), content_hash (null) in DB
    ↓
User is created with traditional auth
```

**Result**: User has an ENS field, but it's not connected to a real wallet

---

#### ENS Verification Flow (Line 3287-3350)
```
Authenticated user calls POST /api/profile/verify-ens
    ↓
Backend resolves username.isharehow.eth
    ↓
Checks blockchain for:
  - Ethereum address owner
  - IPFS content hash
    ↓
Updates User and UserProfile tables
    ↓
Returns updated data
```

**Limitation**: Only works if ENS name is actually registered on blockchain

---

#### Push Chat Flow (usePushChat.ts)
```
User clicks "Connect Wallet" in chat
    ↓
Request MetaMask connection
    ↓
Get signer from wallet
    ↓
Initialize Push Protocol with wallet signature
    ↓
Enable decentralized messaging
```

**Note**: This is **separate** from login - user must already be logged in via traditional auth

---

### 🎯 What Would Be Needed for Full Web3 Login

#### Phase 1: Basic Wallet Auth
1. **Frontend**:
   - Add "Connect Wallet" button to login page
   - Request wallet connection via `window.ethereum`
   - Get wallet address
   - Request nonce from backend
   - Sign message with wallet: `signer.signMessage(nonce)`
   - Send signature to backend for verification

2. **Backend**:
   - `POST /api/auth/wallet/nonce` - Generate random nonce for address
   - Store nonce temporarily (Redis or DB with expiration)
   - `POST /api/auth/wallet/verify` - Verify signature
   - Use `eth_account.messages.encode_defunct(nonce)`
   - Use `w3.eth.account.recover_message(encoded, signature=signature)`
   - If valid, find or create User with crypto_address
   - Return JWT token

3. **Database**:
   - Index on `crypto_address` (already exists)
   - `wallet_nonces` table or Redis cache
   - Link wallet to existing user or create new user

#### Phase 2: Account Linking
4. Allow existing users to link wallet
5. Show linked wallets in profile
6. Support multiple wallets per user
7. Set primary wallet for login

#### Phase 3: ENS Integration
8. Use ENS name as username
9. Fetch ENS avatar for profile picture
10. Display ENS profile data
11. Auto-populate from ENS text records

#### Phase 4: Token Gating
12. Check NFT/token ownership
13. Grant access based on holdings
14. Integrate with Shopify for crypto payments
15. Subscription via smart contract

---

### 📊 Web3 Feature Comparison

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| ENS name generation | ✅ Implemented | Lines 372-378 | Creates username.isharehow.eth |
| ENS address resolution | ✅ Implemented | Lines 381-391 | Reads from blockchain |
| ENS content hash | ✅ Implemented | Lines 394-408 | Reads IPFS hash |
| ENS record writing | ❌ Stub only | Lines 410-428 | Needs wallet integration |
| Wallet connection (chat) | ✅ Implemented | usePushChat.ts | Push Protocol only |
| Wallet authentication | ❌ Missing | N/A | No login with wallet |
| Signature verification | ❌ Missing | N/A | No backend endpoint |
| Web3 balance/transactions | ❌ Missing | N/A | Frontend references missing APIs |
| Smart contracts | ❌ Missing | N/A | No contract interaction |
| Token gating | ❌ Missing | N/A | No NFT/token checks |
| Multi-chain | ❌ Missing | N/A | Mainnet only |

---

### 🔧 Environment Variables Required

**Currently Set** (likely):
```bash
# Not confirmed if these are set in production:
ENS_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY  # NEEDS REAL KEY
ENS_PRIVATE_KEY=0x...  # Optional, for ENS record updates
```

**For Full Web3 Auth** (would need):
```bash
WEB3_PROVIDER_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
WALLET_AUTH_ENABLED=true
NONCE_EXPIRATION_SECONDS=300
REDIS_URL=redis://...  # For nonce storage
```

---

### 🚀 Recommendation: Web3 Auth Implementation Priority

**If you want wallet-based login**, here's the priority order:

1. **HIGH PRIORITY** (2-3 hours):
   - Add nonce generation endpoint
   - Add signature verification endpoint
   - Basic "Sign in with Ethereum" flow
   - Link wallet to existing users

2. **MEDIUM PRIORITY** (3-4 hours):
   - Implement missing `/api/web3/*` endpoints
   - Web3Panel balance/transaction display
   - ENS avatar fetching
   - ENS profile data integration

3. **LOW PRIORITY** (5+ hours):
   - Multi-wallet support
   - Multi-chain support (Polygon, etc.)
   - Smart contract subscription verification
   - Token gating features

4. **FUTURE** (10+ hours):
   - NFT-based access control
   - On-chain payments
   - DAO governance integration
   - Decentralized storage (IPFS profiles)

---

### ✅ Summary: Web3 Login Status

**Current State**: 
- 🟡 **PARTIAL IMPLEMENTATION**
- Infrastructure exists (web3.py, ethers.js)
- ENS fields in database
- Push Protocol chat uses wallet
- **Cannot login with wallet**

**To Enable Wallet Login**:
1. Add nonce generation
2. Add signature verification  
3. Create wallet auth endpoints
4. Add "Connect Wallet" UI
5. Link wallets to user accounts

**Estimated Effort**: 4-6 hours for basic wallet authentication

---

**Next Steps**: Review this assessment and decide if wallet-based authentication should be added during the upcoming database/auth rework.


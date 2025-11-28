# ENS (Web3) Fields Migration Guide

## Overview
This migration adds Web3/ENS (Ethereum Name Service) integration fields to your database, enabling users to have ENS domain names like `username.isharehow.eth` that resolve to Ethereum addresses.

## What This Migration Does

Adds the following fields to **both** `users` and `user_profiles` tables:

1. **ens_name** (VARCHAR(255), unique, indexed)
   - Stores ENS domain name (e.g., `isharehow.isharehow.eth`)
   - Unique constraint ensures no duplicate ENS names
   - Indexed for fast lookups

2. **crypto_address** (VARCHAR(42), indexed)
   - Stores Ethereum address that the ENS name resolves to (0x...)
   - Indexed for fast lookups

3. **content_hash** (VARCHAR(255))
   - Stores IPFS content hash for decentralized storage
   - Used to point ENS resolver to IPFS content

## Prerequisites

1. **Database Access**: You need access to your PostgreSQL database
2. **DATABASE_URL**: Environment variable must be set
3. **Python Dependencies**: Install web3.py (already in requirements.txt)

## Running the Migration

### Option 1: Direct Script (Recommended)

```bash
cd backend-python
python3 add_ens_fields_migration.py
```

The script will:
- Check if columns already exist (safe to run multiple times)
- Add missing columns
- Create indexes
- Verify the migration was successful

### Option 2: Manual SQL

If you prefer to run SQL directly:

```sql
-- Add ENS fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS ens_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS crypto_address VARCHAR(42);
ALTER TABLE users ADD COLUMN IF NOT EXISTS content_hash VARCHAR(255);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS ix_users_ens_name ON users(ens_name) WHERE ens_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_users_crypto_address ON users(crypto_address) WHERE crypto_address IS NOT NULL;

-- Add ENS fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ens_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS crypto_address VARCHAR(42);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS content_hash VARCHAR(255);

-- Create indexes
CREATE UNIQUE INDEX IF NOT EXISTS ix_user_profiles_ens_name ON user_profiles(ens_name) WHERE ens_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS ix_user_profiles_crypto_address ON user_profiles(crypto_address) WHERE crypto_address IS NOT NULL;
```

## Verification

After running the migration, verify the columns exist:

```sql
-- Check users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('ens_name', 'crypto_address', 'content_hash');

-- Check user_profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name IN ('ens_name', 'crypto_address', 'content_hash');
```

You should see:
- `ens_name` (character varying)
- `crypto_address` (character varying)
- `content_hash` (character varying)

## How It Works

1. **User Registration**: When a user registers, the system automatically generates an ENS name: `username.isharehow.eth`
2. **ENS Resolution**: The system attempts to resolve the ENS name to an Ethereum address
3. **Storage**: Both the ENS name and resolved address are stored in the database
4. **API Responses**: User IDs in API responses use the ENS name when available

## Configuration

To enable ENS resolution, set these environment variables:

- `ENS_PROVIDER_URL` - Your Ethereum provider (Infura, Alchemy, etc.)
  - Example: `https://mainnet.infura.io/v3/YOUR_INFURA_KEY`
- `ENS_PRIVATE_KEY` - (Optional) For setting ENS records

## Troubleshooting

### Error: "Column already exists"
This is normal if you've run the migration before. The script handles this gracefully.

### Error: "DATABASE_URL not set"
Make sure your `DATABASE_URL` environment variable is set:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### ENS Resolution Not Working
- Check that `ENS_PROVIDER_URL` is set correctly
- Verify your Ethereum provider is accessible
- The system will still work without ENS resolution (fields will be NULL)

## Next Steps

After running this migration:
1. Install web3.py: `pip install -r requirements.txt`
2. Configure `ENS_PROVIDER_URL` in your environment
3. Test user registration to see ENS names being generated
4. Integrate with frontend Web3 dashboard panel

## Notes

- The migration is **idempotent** - safe to run multiple times
- Existing users will have NULL values for ENS fields until they register/login
- ENS names are generated automatically from usernames
- Crypto addresses are resolved from ENS names (if ENS is configured)

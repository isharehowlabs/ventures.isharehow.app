#!/usr/bin/env python3
"""
Database Migration: Add ENS (Web3) fields to users and user_profiles tables
This script adds:
- ens_name (String, unique, indexed) - e.g., "isharehow.isharehow.eth"
- crypto_address (String, indexed) - Ethereum address (0x...)
- content_hash (String) - IPFS content hash

Run this script after installing web3.py dependencies.
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

def get_database_url():
    """Get database URL from environment"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set")
        print("Please set DATABASE_URL to your PostgreSQL connection string")
        sys.exit(1)
    
    # Convert postgresql:// to postgresql+psycopg:// for psycopg3 support
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
    
    return database_url

def check_column_exists(engine: Engine, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = :table_name AND column_name = :column_name
            """), {'table_name': table_name, 'column_name': column_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking column: {e}")
        return False

def check_index_exists(engine: Engine, index_name: str) -> bool:
    """Check if an index exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE schemaname = 'public' AND indexname = :index_name
            """), {'index_name': index_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking index: {e}")
        return False

def run_migration():
    """Run the migration to add ENS fields"""
    database_url = get_database_url()
    print(f"Connecting to database...")
    
    try:
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Migrate users table
        print("\n" + "=" * 60)
        print("Migrating 'users' table...")
        print("=" * 60)
        
        with engine.begin() as conn:
            # Add ens_name column
            if not check_column_exists(engine, 'users', 'ens_name'):
                print("Adding ens_name column to users table...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN ens_name VARCHAR(255)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'ens_name' already exists in 'users' table")
            
            # Add crypto_address column
            if not check_column_exists(engine, 'users', 'crypto_address'):
                print("Adding crypto_address column to users table...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN crypto_address VARCHAR(42)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'crypto_address' already exists in 'users' table")
            
            # Add content_hash column
            if not check_column_exists(engine, 'users', 'content_hash'):
                print("Adding content_hash column to users table...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN content_hash VARCHAR(255)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'content_hash' already exists in 'users' table")
            
            # Create unique index on ens_name
            if not check_index_exists(engine, 'ix_users_ens_name'):
                print("Creating unique index on users.ens_name...")
                try:
                    conn.execute(text("""
                        CREATE UNIQUE INDEX ix_users_ens_name ON users(ens_name)
                        WHERE ens_name IS NOT NULL
                    """))
                    print("✓ Index created successfully")
                except Exception as idx_error:
                    error_str = str(idx_error).lower()
                    if 'already exists' in error_str or 'duplicate' in error_str:
                        print("✓ Index already exists (skipped)")
                    else:
                        raise
            else:
                print("✓ Index 'ix_users_ens_name' already exists")
            
            # Create index on crypto_address
            if not check_index_exists(engine, 'ix_users_crypto_address'):
                print("Creating index on users.crypto_address...")
                try:
                    conn.execute(text("""
                        CREATE INDEX ix_users_crypto_address ON users(crypto_address)
                        WHERE crypto_address IS NOT NULL
                    """))
                    print("✓ Index created successfully")
                except Exception as idx_error:
                    error_str = str(idx_error).lower()
                    if 'already exists' in error_str or 'duplicate' in error_str:
                        print("✓ Index already exists (skipped)")
                    else:
                        raise
            else:
                print("✓ Index 'ix_users_crypto_address' already exists")
        
        # Migrate user_profiles table
        print("\n" + "=" * 60)
        print("Migrating 'user_profiles' table...")
        print("=" * 60)
        
        with engine.begin() as conn:
            # Add ens_name column
            if not check_column_exists(engine, 'user_profiles', 'ens_name'):
                print("Adding ens_name column to user_profiles table...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN ens_name VARCHAR(255)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'ens_name' already exists in 'user_profiles' table")
            
            # Add crypto_address column
            if not check_column_exists(engine, 'user_profiles', 'crypto_address'):
                print("Adding crypto_address column to user_profiles table...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN crypto_address VARCHAR(42)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'crypto_address' already exists in 'user_profiles' table")
            
            # Add content_hash column
            if not check_column_exists(engine, 'user_profiles', 'content_hash'):
                print("Adding content_hash column to user_profiles table...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN content_hash VARCHAR(255)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'content_hash' already exists in 'user_profiles' table")
            
            # Create unique index on ens_name
            if not check_index_exists(engine, 'ix_user_profiles_ens_name'):
                print("Creating unique index on user_profiles.ens_name...")
                try:
                    conn.execute(text("""
                        CREATE UNIQUE INDEX ix_user_profiles_ens_name ON user_profiles(ens_name)
                        WHERE ens_name IS NOT NULL
                    """))
                    print("✓ Index created successfully")
                except Exception as idx_error:
                    error_str = str(idx_error).lower()
                    if 'already exists' in error_str or 'duplicate' in error_str:
                        print("✓ Index already exists (skipped)")
                    else:
                        raise
            else:
                print("✓ Index 'ix_user_profiles_ens_name' already exists")
            
            # Create index on crypto_address
            if not check_index_exists(engine, 'ix_user_profiles_crypto_address'):
                print("Creating index on user_profiles.crypto_address...")
                try:
                    conn.execute(text("""
                        CREATE INDEX ix_user_profiles_crypto_address ON user_profiles(crypto_address)
                        WHERE crypto_address IS NOT NULL
                    """))
                    print("✓ Index created successfully")
                except Exception as idx_error:
                    error_str = str(idx_error).lower()
                    if 'already exists' in error_str or 'duplicate' in error_str:
                        print("✓ Index already exists (skipped)")
                    else:
                        raise
            else:
                print("✓ Index 'ix_user_profiles_crypto_address' already exists")
        
        print("\n" + "=" * 60)
        print("✅ Migration completed successfully!")
        print("=" * 60)
        
        # Verification
        print("\nVerification:")
        print("  Users table:")
        print(f"    ✓ ens_name: {check_column_exists(engine, 'users', 'ens_name')}")
        print(f"    ✓ crypto_address: {check_column_exists(engine, 'users', 'crypto_address')}")
        print(f"    ✓ content_hash: {check_column_exists(engine, 'users', 'content_hash')}")
        print("  User_profiles table:")
        print(f"    ✓ ens_name: {check_column_exists(engine, 'user_profiles', 'ens_name')}")
        print(f"    ✓ crypto_address: {check_column_exists(engine, 'user_profiles', 'crypto_address')}")
        print(f"    ✓ content_hash: {check_column_exists(engine, 'user_profiles', 'content_hash')}")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("Database Migration: Add ENS (Web3) Fields")
    print("=" * 60)
    print()
    print("This migration adds the following fields:")
    print("  - ens_name: ENS domain name (e.g., username.isharehow.eth)")
    print("  - crypto_address: Ethereum address (0x...)")
    print("  - content_hash: IPFS content hash")
    print()
    print("Tables to migrate:")
    print("  - users")
    print("  - user_profiles")
    print()
    run_migration()

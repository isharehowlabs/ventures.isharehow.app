#!/usr/bin/env python3
"""
Add ENS (Web3) fields migration
Adds ens_name, crypto_address, and content_hash columns to users and user_profiles tables
This migration is idempotent - safe to run multiple times
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

def check_table_exists(engine: Engine, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = :table_name
            """), {'table_name': table_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking if table {table_name} exists: {e}")
        return False

def check_column_exists(engine: Engine, table_name: str, column_name: str) -> bool:
    """Check if a column exists in a table"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = :table_name 
                AND column_name = :column_name
            """), {'table_name': table_name, 'column_name': column_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking if column {table_name}.{column_name} exists: {e}")
        return False

def check_index_exists(engine: Engine, index_name: str) -> bool:
    """Check if an index exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE schemaname = 'public' 
                AND indexname = :index_name
            """), {'index_name': index_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking if index {index_name} exists: {e}")
        return False

def add_column_if_not_exists(engine: Engine, table_name: str, column_name: str, column_def: str):
    """Add a column to a table if it doesn't exist"""
    if check_column_exists(engine, table_name, column_name):
        print(f"  ✓ Column {table_name}.{column_name} already exists")
        return True
    
    try:
        with engine.connect() as conn:
            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}"))
            conn.commit()
            print(f"  ✓ Added column {table_name}.{column_name}")
            return True
    except Exception as e:
        error_str = str(e).lower()
        if 'already exists' in error_str or 'duplicate' in error_str:
            print(f"  ✓ Column {table_name}.{column_name} already exists (caught duplicate error)")
            return True
        else:
            print(f"  ✗ Error adding column {table_name}.{column_name}: {e}")
            return False

def create_index_if_not_exists(engine: Engine, index_name: str, index_def: str):
    """Create an index if it doesn't exist"""
    if check_index_exists(engine, index_name):
        print(f"  ✓ Index {index_name} already exists")
        return True
    
    try:
        with engine.connect() as conn:
            conn.execute(text(f"CREATE INDEX IF NOT EXISTS {index_name} {index_def}"))
            conn.commit()
            print(f"  ✓ Created index {index_name}")
            return True
    except Exception as e:
        error_str = str(e).lower()
        if 'already exists' in error_str or 'duplicate' in error_str:
            print(f"  ✓ Index {index_name} already exists (caught duplicate error)")
            return True
        else:
            print(f"  ✗ Error creating index {index_name}: {e}")
            return False

def create_unique_index_if_not_exists(engine: Engine, index_name: str, index_def: str):
    """Create a unique index if it doesn't exist"""
    if check_index_exists(engine, index_name):
        print(f"  ✓ Index {index_name} already exists")
        return True
    
    try:
        with engine.connect() as conn:
            conn.execute(text(f"CREATE UNIQUE INDEX IF NOT EXISTS {index_name} {index_def}"))
            conn.commit()
            print(f"  ✓ Created unique index {index_name}")
            return True
    except Exception as e:
        error_str = str(e).lower()
        if 'already exists' in error_str or 'duplicate' in error_str:
            print(f"  ✓ Index {index_name} already exists (caught duplicate error)")
            return True
        else:
            print(f"  ✗ Error creating unique index {index_name}: {e}")
            return False

def main():
    print("=" * 80)
    print("ENS FIELDS MIGRATION")
    print("=" * 80)
    print()
    
    database_url = get_database_url()
    engine = create_engine(database_url)
    
    success = True
    
    # Add ENS fields to users table
    print("Adding ENS fields to 'users' table...")
    if not check_table_exists(engine, 'users'):
        print("  ✗ Table 'users' does not exist! Cannot add ENS fields.")
        success = False
    else:
        add_column_if_not_exists(engine, 'users', 'ens_name', 'VARCHAR(255)')
        add_column_if_not_exists(engine, 'users', 'crypto_address', 'VARCHAR(42)')
        add_column_if_not_exists(engine, 'users', 'content_hash', 'VARCHAR(255)')
        
        # Create indexes for users table
        print("\nCreating indexes for 'users' table...")
        create_unique_index_if_not_exists(engine, 'ix_users_ens_name', 
            "ON users(ens_name) WHERE ens_name IS NOT NULL")
        create_index_if_not_exists(engine, 'ix_users_crypto_address',
            "ON users(crypto_address) WHERE crypto_address IS NOT NULL")
    
    print()
    
    # Add ENS fields to user_profiles table
    print("Adding ENS fields to 'user_profiles' table...")
    if not check_table_exists(engine, 'user_profiles'):
        print("  ⚠️  Table 'user_profiles' does not exist. Skipping (this is optional).")
    else:
        add_column_if_not_exists(engine, 'user_profiles', 'ens_name', 'VARCHAR(255)')
        add_column_if_not_exists(engine, 'user_profiles', 'crypto_address', 'VARCHAR(42)')
        add_column_if_not_exists(engine, 'user_profiles', 'content_hash', 'VARCHAR(255)')
        
        # Create indexes for user_profiles table
        print("\nCreating indexes for 'user_profiles' table...")
        create_unique_index_if_not_exists(engine, 'ix_user_profiles_ens_name',
            "ON user_profiles(ens_name) WHERE ens_name IS NOT NULL")
        create_index_if_not_exists(engine, 'ix_user_profiles_crypto_address',
            "ON user_profiles(crypto_address) WHERE crypto_address IS NOT NULL")
    
    print()
    print("=" * 80)
    if success:
        print("✓ ENS fields migration completed successfully!")
        print("\nNext steps:")
        print("  1. Configure ENS_PROVIDER_URL environment variable (optional)")
        print("  2. Test user registration to see ENS names being generated")
        print("  3. See ENS_MIGRATION.md for more details")
    else:
        print("✗ Migration completed with errors. Please review the output above.")
    print("=" * 80)

if __name__ == '__main__':
    main()

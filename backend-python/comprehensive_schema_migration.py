#!/usr/bin/env python3
"""
Comprehensive Database Schema Migration
This script implements all the schema changes from fixes.md:
- Add is_admin field to users table
- Add lifetime_support_amount to user_profiles
- Add is_employee to user_profiles (rename from isTeamMember concept)
- Remove deprecated fields: membership_payment_date (redundant), lastChargeDate (not needed)
- Note: membershipAmount, membershipPaid, pledgeStart are already removed from model definitions

Run this after add_ens_fields_migration.py
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
    """Run the comprehensive schema migration"""
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
            # Add is_admin column
            if not check_column_exists(engine, 'users', 'is_admin'):
                print("Adding is_admin column to users table...")
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false
                """))
                print("✓ Column added successfully")
                
                # Create index
                if not check_index_exists(engine, 'ix_users_is_admin'):
                    print("Creating index on users.is_admin...")
                    try:
                        conn.execute(text("""
                            CREATE INDEX ix_users_is_admin ON users(is_admin)
                            WHERE is_admin = true
                        """))
                        print("✓ Index created successfully")
                    except Exception as idx_error:
                        error_str = str(idx_error).lower()
                        if 'already exists' in error_str or 'duplicate' in error_str:
                            print("✓ Index already exists (skipped)")
                        else:
                            raise
            else:
                print("✓ Column 'is_admin' already exists in 'users' table")
        
        # Migrate user_profiles table
        print("\n" + "=" * 60)
        print("Migrating 'user_profiles' table...")
        print("=" * 60)
        
        with engine.begin() as conn:
            # Add is_employee column
            if not check_column_exists(engine, 'user_profiles', 'is_employee'):
                print("Adding is_employee column to user_profiles table...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN is_employee BOOLEAN NOT NULL DEFAULT false
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'is_employee' already exists in 'user_profiles' table")
            
            # Add lifetime_support_amount column
            if not check_column_exists(engine, 'user_profiles', 'lifetime_support_amount'):
                print("Adding lifetime_support_amount column to user_profiles table...")
                conn.execute(text("""
                    ALTER TABLE user_profiles 
                    ADD COLUMN lifetime_support_amount NUMERIC(10, 2)
                """))
                print("✓ Column added successfully")
            else:
                print("✓ Column 'lifetime_support_amount' already exists in 'user_profiles' table")
            
            # Remove membership_payment_date if it exists (redundant field)
            if check_column_exists(engine, 'user_profiles', 'membership_payment_date'):
                print("Removing redundant membership_payment_date column...")
                try:
                    conn.execute(text("""
                        ALTER TABLE user_profiles 
                        DROP COLUMN membership_payment_date
                    """))
                    print("✓ Column removed successfully")
                except Exception as drop_error:
                    error_str = str(drop_error).lower()
                    if 'does not exist' in error_str:
                        print("✓ Column already removed")
                    else:
                        print(f"⚠ Warning: Could not remove column: {drop_error}")
            else:
                print("✓ Column 'membership_payment_date' already removed")
        
        print("\n" + "=" * 60)
        print("✅ Comprehensive migration completed successfully!")
        print("=" * 60)
        
        # Verification
        print("\nVerification:")
        print("  Users table:")
        print(f"    ✓ is_admin: {check_column_exists(engine, 'users', 'is_admin')}")
        print("  User_profiles table:")
        print(f"    ✓ is_employee: {check_column_exists(engine, 'user_profiles', 'is_employee')}")
        print(f"    ✓ lifetime_support_amount: {check_column_exists(engine, 'user_profiles', 'lifetime_support_amount')}")
        print(f"    ✓ membership_payment_date removed: {not check_column_exists(engine, 'user_profiles', 'membership_payment_date')}")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("Comprehensive Database Schema Migration")
    print("=" * 60)
    print()
    print("This migration:")
    print("  - Adds is_admin field to users table")
    print("  - Adds is_employee field to user_profiles table")
    print("  - Adds lifetime_support_amount field to user_profiles table")
    print("  - Removes redundant membership_payment_date field")
    print()
    print("Note: This should be run AFTER add_ens_fields_migration.py")
    print()
    run_migration()

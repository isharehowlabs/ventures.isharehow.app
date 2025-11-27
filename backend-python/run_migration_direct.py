#!/usr/bin/env python3
"""
Direct migration runner - runs migrations without requiring Flask app import
This bypasses the need for flask-jwt-extended and other app dependencies
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
                WHERE table_name = :table_name AND column_name = :column_name
            """), {'table_name': table_name, 'column_name': column_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking column: {e}")
        return False

def check_table_exists(engine: Engine, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = :table_name
            """), {'table_name': table_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking table: {e}")
        return False

def run_migration():
    """Run the migration to add is_employee column"""
    database_url = get_database_url()
    print(f"Connecting to database...")
    
    try:
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Check if is_employee column already exists
        if check_column_exists(engine, 'users', 'is_employee'):
            print("✓ Column 'is_employee' already exists in 'users' table")
            print("Migration already applied!")
            return
        
        print("Adding is_employee column to users table...")
        
        # Add the column
        with engine.begin() as conn:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN is_employee BOOLEAN NOT NULL DEFAULT false
            """))
            print("✓ Column added successfully")
            
            # Create index
            print("Creating index...")
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS ix_users_is_employee ON users(is_employee)
            """))
            print("✓ Index created successfully")
        
        # Check if support_requests table exists
        if not check_table_exists(engine, 'support_requests'):
            print("Creating support_requests table...")
            with engine.begin() as conn:
                conn.execute(text("""
                    CREATE TABLE support_requests (
                        id VARCHAR(36) PRIMARY KEY,
                        client_id VARCHAR(36),
                        client_name VARCHAR(200),
                        subject VARCHAR(255) NOT NULL,
                        description TEXT NOT NULL,
                        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
                        status VARCHAR(20) NOT NULL DEFAULT 'open',
                        assigned_to VARCHAR(200),
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_support_requests_client_id 
                    ON support_requests(client_id)
                """))
            print("✓ support_requests table created")
        else:
            print("✓ support_requests table already exists")
        
        # Check if subscriptions table exists
        if not check_table_exists(engine, 'subscriptions'):
            print("Creating subscriptions table...")
            with engine.begin() as conn:
                conn.execute(text("""
                    CREATE TABLE subscriptions (
                        id VARCHAR(36) PRIMARY KEY,
                        user_id VARCHAR(36) NOT NULL,
                        tier VARCHAR(50) NOT NULL,
                        billing_cycle VARCHAR(20) NOT NULL,
                        status VARCHAR(20) NOT NULL DEFAULT 'active',
                        amount FLOAT NOT NULL,
                        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
                        payment_method VARCHAR(50),
                        payment_method_id VARCHAR(255),
                        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        expires_at TIMESTAMP,
                        cancelled_at TIMESTAMP,
                        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
                    )
                """))
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_subscriptions_user_id 
                    ON subscriptions(user_id)
                """))
            print("✓ subscriptions table created")
        else:
            print("✓ subscriptions table already exists")
        
        print("\n✅ Migration completed successfully!")
        print("\nVerification:")
        if check_column_exists(engine, 'users', 'is_employee'):
            print("  ✓ is_employee column exists in users table")
        else:
            print("  ✗ is_employee column NOT found (migration may have failed)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("Database Migration: Add is_employee column")
    print("=" * 60)
    print()
    run_migration()

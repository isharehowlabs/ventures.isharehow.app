#!/usr/bin/env python3
"""
Direct migration script to add support_request_id column to task table
This bypasses the need for Flask app import
"""
import os
import sys
from sqlalchemy import create_engine, text

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

def check_column_exists(engine, table_name: str, column_name: str) -> bool:
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

def check_table_exists(engine, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = :table_name
            """), {'table_name': table_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking table: {e}")
        return False

def check_index_exists(engine, table_name: str, index_name: str) -> bool:
    """Check if an index exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT 1 FROM pg_indexes 
                WHERE tablename = :table_name AND indexname = :index_name
            """), {'table_name': table_name, 'index_name': index_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking index: {e}")
        return False

def run_migration():
    """Run the migration to add support_request_id column"""
    database_url = get_database_url()
    print(f"Connecting to database...")
    
    try:
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Check if task table exists
        if not check_table_exists(engine, 'task'):
            print("✗ Table 'task' does not exist. Please run initial migration first.")
            sys.exit(1)
        
        # Check if support_request_id column already exists
        if check_column_exists(engine, 'task', 'support_request_id'):
            print("✓ Column 'support_request_id' already exists in 'task' table")
            
            # Check if index exists
            if not check_index_exists(engine, 'task', 'ix_task_support_request_id'):
                print("Creating index for support_request_id...")
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE INDEX IF NOT EXISTS ix_task_support_request_id 
                        ON task(support_request_id)
                    """))
                print("✓ Index created successfully")
            else:
                print("✓ Index 'ix_task_support_request_id' already exists")
        else:
            print("Adding support_request_id column to task table...")
            try:
                # Add the column
                with engine.begin() as conn:
                    conn.execute(text("""
                        ALTER TABLE task 
                        ADD COLUMN support_request_id VARCHAR(36)
                    """))
                print("✓ Column added successfully")
            except Exception as col_error:
                error_str = str(col_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ Column 'support_request_id' already exists (skipped)")
                else:
                    raise
            
            # Create foreign key constraint if support_requests table exists
            if check_table_exists(engine, 'support_requests'):
                print("Creating foreign key constraint...")
                try:
                    with engine.begin() as conn:
                        # Check if foreign key already exists
                        result = conn.execute(text("""
                            SELECT 1 FROM information_schema.table_constraints 
                            WHERE constraint_name = 'fk_task_support_request_id'
                        """))
                        if not result.fetchone():
                            conn.execute(text("""
                                ALTER TABLE task 
                                ADD CONSTRAINT fk_task_support_request_id 
                                FOREIGN KEY (support_request_id) 
                                REFERENCES support_requests(id)
                            """))
                            print("✓ Foreign key constraint created successfully")
                        else:
                            print("✓ Foreign key constraint already exists")
                except Exception as fk_error:
                    error_str = str(fk_error).lower()
                    if 'already exists' in error_str or 'duplicate' in error_str:
                        print("✓ Foreign key constraint already exists (skipped)")
                    else:
                        print(f"Warning: Could not create foreign key constraint: {fk_error}")
            else:
                print("⚠ support_requests table does not exist, skipping foreign key constraint")
            
            # Create index
            print("Creating index...")
            with engine.begin() as conn:
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS ix_task_support_request_id 
                    ON task(support_request_id)
                """))
            print("✓ Index created successfully")
        
        print("\n✅ Migration completed successfully!")
        print("\nVerification:")
        if check_column_exists(engine, 'task', 'support_request_id'):
            print("  ✓ support_request_id column exists in task table")
        else:
            print("  ✗ support_request_id column NOT found (migration may have failed)")
        
        if check_index_exists(engine, 'task', 'ix_task_support_request_id'):
            print("  ✓ Index ix_task_support_request_id exists")
        else:
            print("  ✗ Index NOT found")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("Database Migration: Add support_request_id column to task table")
    print("=" * 60)
    print()
    run_migration()


#!/usr/bin/env python3
"""
Ensure all required columns exist in the users table.
This script can be run independently to fix missing columns.
"""
import os
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import OperationalError

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def ensure_columns_exist():
    """Ensure all required columns exist in the users table"""
    database_url = os.environ.get('DATABASE_URL', 'postgresql://localhost/ventures')
    
    # Convert postgresql:// to postgresql+psycopg:// for psycopg3 support
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
    
    try:
        engine = create_engine(database_url)
        inspector = inspect(engine)
        
        # Check if users table exists
        if 'users' not in inspector.get_table_names():
            print("ERROR: 'users' table does not exist!")
            print("Please run the initial migration first.")
            return False
        
        # Get existing columns
        existing_columns = {col['name'] for col in inspector.get_columns('users')}
        print(f"Existing columns in 'users' table: {sorted(existing_columns)}")
        
        # Required columns that should exist
        required_columns = {
            'has_subscription_update': ('BOOLEAN', 'FALSE'),
            'subscription_update_active': ('BOOLEAN', 'FALSE'),
            'shopify_customer_id': ('VARCHAR(50)', 'NULL'),
            'bold_subscription_id': ('VARCHAR(50)', 'NULL'),
            'is_employee': ('BOOLEAN', 'FALSE'),
            'is_admin': ('BOOLEAN', 'FALSE'),
        }
        
        missing_columns = []
        for col_name, (col_type, default) in required_columns.items():
            if col_name not in existing_columns:
                missing_columns.append((col_name, col_type, default))
        
        if not missing_columns:
            print("✓ All required columns exist!")
            return True
        
        print(f"\nFound {len(missing_columns)} missing column(s). Adding them now...")
        
        with engine.connect() as conn:
            with conn.begin():  # Start a transaction
                for col_name, col_type, default in missing_columns:
                    try:
                        if col_type == 'BOOLEAN':
                            if default == 'FALSE':
                                sql = f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT FALSE"
                            else:
                                sql = f"ALTER TABLE users ADD COLUMN {col_name} BOOLEAN NOT NULL DEFAULT TRUE"
                        elif col_type.startswith('VARCHAR'):
                            sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"
                        else:
                            sql = f"ALTER TABLE users ADD COLUMN {col_name} {col_type} DEFAULT {default}"
                        
                        print(f"  Adding column: {col_name} ({col_type})")
                        conn.execute(text(sql))
                        print(f"    ✓ Added {col_name}")
                    except Exception as e:
                        print(f"    ✗ Error adding {col_name}: {e}")
                        # Continue with other columns
                
                # Create indexes for indexed columns
                indexed_columns = ['shopify_customer_id', 'bold_subscription_id', 'is_employee', 'is_admin']
                for col_name in indexed_columns:
                    if col_name in [c[0] for c in missing_columns] or col_name not in existing_columns:
                        try:
                            index_name = f'ix_users_{col_name}'
                            # Check if index already exists
                            indexes = [idx['name'] for idx in inspector.get_indexes('users')]
                            if index_name not in indexes:
                                print(f"  Creating index: {index_name}")
                                conn.execute(text(f"CREATE INDEX {index_name} ON users ({col_name})"))
                                print(f"    ✓ Created index {index_name}")
                        except Exception as e:
                            print(f"    ⚠ Could not create index for {col_name}: {e}")
        
        print("\n✓ Column addition complete!")
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to ensure columns exist: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("=" * 80)
    print("Ensuring all required columns exist in users table...")
    print("=" * 80)
    success = ensure_columns_exist()
    sys.exit(0 if success else 1)


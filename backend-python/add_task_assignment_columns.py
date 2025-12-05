#!/usr/bin/env python3
"""
Migration script to add user assignment columns to tasks table.
Run this script to add created_by, created_by_name, assigned_to, assigned_to_name columns.
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables")
    sys.exit(1)

# Convert postgres:// to postgresql:// if needed (for SQLAlchemy 1.4+)
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

# Use SQLAlchemy's psycopg (v3) driver instead of psycopg2 for Python 3.13 compatibility
if '://' in DATABASE_URL and not 'postgresql+' in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace('postgresql://', 'postgresql+psycopg://')

print(f"Connecting to database...")
engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as conn:
        print("✓ Connected to database")
        
        # Check if columns already exist
        check_query = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'task' 
            AND column_name IN ('created_by', 'created_by_name', 'assigned_to', 'assigned_to_name')
        """)
        
        existing_columns = [row[0] for row in conn.execute(check_query)]
        
        if len(existing_columns) == 4:
            print("✓ All assignment columns already exist. No migration needed.")
            sys.exit(0)
        
        print(f"Found {len(existing_columns)} existing columns: {existing_columns}")
        print("Adding missing columns...")
        
        # Add columns if they don't exist
        columns_to_add = [
            ("created_by", "VARCHAR(100)"),
            ("created_by_name", "VARCHAR(200)"),
            ("assigned_to", "VARCHAR(100)"),
            ("assigned_to_name", "VARCHAR(200)")
        ]
        
        for col_name, col_type in columns_to_add:
            if col_name not in existing_columns:
                alter_query = text(f"""
                    ALTER TABLE task 
                    ADD COLUMN IF NOT EXISTS {col_name} {col_type} NULL
                """)
                conn.execute(alter_query)
                conn.commit()
                print(f"  ✓ Added column: {col_name}")
            else:
                print(f"  - Column already exists: {col_name}")
        
        print("\n✓ Migration completed successfully!")
        print("\nNote: Existing tasks will have NULL values for these fields.")
        print("They will be populated when tasks are created or updated going forward.")
        
except Exception as e:
    print(f"\n✗ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

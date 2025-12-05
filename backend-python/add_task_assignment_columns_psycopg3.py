#!/usr/bin/env python3
"""
Migration script using psycopg v3 (not psycopg2).
This works with psycopg[binary]==3.2.13 already in requirements.txt
"""

import os
import sys

try:
    import psycopg
except ImportError:
    print("Error: psycopg is not installed")
    print("Please install it with: pip install 'psycopg[binary]'")
    sys.exit(1)

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    sys.exit(1)

# Convert postgres:// to postgresql:// if needed
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

print("Connecting to database...")

try:
    # Connect to database (psycopg v3 syntax)
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            print("✓ Connected to database")
            
            # Check if columns already exist
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'task' 
                AND column_name IN ('created_by', 'created_by_name', 'assigned_to', 'assigned_to_name')
            """)
            
            existing_columns = [row[0] for row in cur.fetchall()]
            
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
                    cur.execute(f"""
                        ALTER TABLE task 
                        ADD COLUMN IF NOT EXISTS {col_name} {col_type} NULL
                    """)
                    print(f"  ✓ Added column: {col_name}")
                else:
                    print(f"  - Column already exists: {col_name}")
            
            # Commit changes
            conn.commit()
            
            print("\n✓ Migration completed successfully!")
            print("\nNote: Existing tasks will have NULL values for these fields.")
            print("They will be populated when tasks are created or updated going forward.")
    
except Exception as e:
    print(f"\n✗ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

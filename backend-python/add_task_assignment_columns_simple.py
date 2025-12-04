#!/usr/bin/env python3
"""
Simple migration script to add user assignment columns to tasks table.
Uses psycopg2 directly without SQLAlchemy.
"""

import os
import sys

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("Error: psycopg2 is not installed")
    print("Please install it with: pip install psycopg2-binary")
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
    # Connect to database
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
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
        cur.close()
        conn.close()
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
            cur.execute(sql.SQL(
                "ALTER TABLE task ADD COLUMN IF NOT EXISTS {} {} NULL"
            ).format(
                sql.Identifier(col_name),
                sql.SQL(col_type)
            ))
            print(f"  ✓ Added column: {col_name}")
        else:
            print(f"  - Column already exists: {col_name}")
    
    # Commit changes
    conn.commit()
    
    print("\n✓ Migration completed successfully!")
    print("\nNote: Existing tasks will have NULL values for these fields.")
    print("They will be populated when tasks are created or updated going forward.")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"\n✗ Migration failed: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

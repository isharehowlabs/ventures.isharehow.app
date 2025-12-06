"""
Migration: Add 'notes' column to tasks table for collaborative notepad feature
If tasks table doesn't exist, create all tables first.
"""

import os
import sys
from sqlalchemy import create_engine, text, inspect

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    sys.exit(1)

# Create engine
engine = create_engine(DATABASE_URL)

print("Checking database state...")

try:
    with engine.connect() as conn:
        # Check if tasks table exists
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'tasks' not in tables:
            print("⚠ Tasks table does not exist yet.")
            print("Run: flask shell")
            print("Then: from app import db; db.create_all()")
            print("Or the tables will be created automatically when app starts.")
            sys.exit(0)
        
        # Check if notes column already exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='tasks' AND column_name='notes'
        """))
        
        if result.fetchone():
            print("✓ Column 'notes' already exists, skipping migration")
        else:
            # Add notes column
            print("Adding 'notes' column to tasks table...")
            conn.execute(text("ALTER TABLE tasks ADD COLUMN notes TEXT"))
            conn.commit()
            print("✓ Successfully added 'notes' column to tasks table")
            
except Exception as e:
    print(f"✗ Error during migration: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\nMigration complete!")

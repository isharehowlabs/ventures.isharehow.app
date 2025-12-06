"""
Migration: Add 'notes' column to tasks table for collaborative notepad feature
"""

import os
from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    exit(1)

# Create engine
engine = create_engine(DATABASE_URL)

print("Adding 'notes' column to tasks table...")

try:
    with engine.connect() as conn:
        # Check if column already exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='tasks' AND column_name='notes'
        """))
        
        if result.fetchone():
            print("✓ Column 'notes' already exists, skipping migration")
        else:
            # Add notes column
            conn.execute(text("ALTER TABLE tasks ADD COLUMN notes TEXT"))
            conn.commit()
            print("✓ Successfully added 'notes' column to tasks table")
            
except Exception as e:
    print(f"✗ Error during migration: {e}")
    exit(1)

print("\nMigration complete!")

"""
Migration: Add category column to task table
Run this on your PostgreSQL database (Render)
"""
import os
from sqlalchemy import create_engine, text

# Get DATABASE_URL from environment
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    print("ERROR: DATABASE_URL not set!")
    exit(1)

# Fix for postgres:// vs postgresql://
if database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

engine = create_engine(database_url)

try:
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='task' AND column_name='category'
        """))
        
        if result.fetchone():
            print("✓ Column 'category' already exists in task table")
        else:
            print("Adding 'category' column to task table...")
            conn.execute(text("""
                ALTER TABLE task 
                ADD COLUMN category VARCHAR(50) DEFAULT 'work'
            """))
            conn.commit()
            print("✓ Column 'category' added successfully!")
            
            # Update existing rows
            print("Updating existing tasks with default category...")
            conn.execute(text("""
                UPDATE task 
                SET category = 'work' 
                WHERE category IS NULL
            """))
            conn.commit()
            print("✓ Existing tasks updated!")
            
except Exception as e:
    print(f"Error: {e}")
    exit(1)
    
print("\n✓ Migration complete!")

#!/usr/bin/env python3
"""
Direct database migration to add venture fields to support_requests table
Works with PostgreSQL on Render
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError

# Get database URL from environment
database_url = os.getenv('DATABASE_URL')
if not database_url:
    print("❌ DATABASE_URL not found in environment")
    sys.exit(1)

print(f"🔗 Connecting to database...")

try:
    engine = create_engine(database_url)
    
    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        
        try:
            print("📝 Adding venture fields to support_requests table...")
            
            # Add budget column
            try:
                connection.execute(text(
                    "ALTER TABLE support_requests ADD COLUMN budget NUMERIC(10, 2) DEFAULT 0"
                ))
                print("  ✅ Added 'budget' column")
            except ProgrammingError as e:
                if 'already exists' in str(e):
                    print("  ℹ️  'budget' column already exists")
                else:
                    raise
            
            # Add spent column
            try:
                connection.execute(text(
                    "ALTER TABLE support_requests ADD COLUMN spent NUMERIC(10, 2) DEFAULT 0"
                ))
                print("  ✅ Added 'spent' column")
            except ProgrammingError as e:
                if 'already exists' in str(e):
                    print("  ℹ️  'spent' column already exists")
                else:
                    raise
            
            # Add delivery_date column
            try:
                connection.execute(text(
                    "ALTER TABLE support_requests ADD COLUMN delivery_date TIMESTAMP"
                ))
                print("  ✅ Added 'delivery_date' column")
            except ProgrammingError as e:
                if 'already exists' in str(e):
                    print("  ℹ️  'delivery_date' column already exists")
                else:
                    raise
            
            # Add start_date column
            try:
                connection.execute(text(
                    "ALTER TABLE support_requests ADD COLUMN start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
                ))
                print("  ✅ Added 'start_date' column")
            except ProgrammingError as e:
                if 'already exists' in str(e):
                    print("  ℹ️  'start_date' column already exists")
                else:
                    raise
            
            # Add progress column
            try:
                connection.execute(text(
                    "ALTER TABLE support_requests ADD COLUMN progress INTEGER DEFAULT 0"
                ))
                print("  ✅ Added 'progress' column")
            except ProgrammingError as e:
                if 'already exists' in str(e):
                    print("  ℹ️  'progress' column already exists")
                else:
                    raise
            
            # Commit transaction
            trans.commit()
            print("\n✅ Migration completed successfully!")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error during migration: {e}")
            raise
            
except OperationalError as e:
    print(f"❌ Could not connect to database: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)

#!/usr/bin/env python3
"""
Quick script to add trial_start_date column to users table if it doesn't exist.
This fixes the database schema mismatch error.
"""

import os
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import ProgrammingError

def add_trial_start_date_column():
    """Add trial_start_date column to users table if it doesn't exist"""
    
    # Get database URL from environment
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set")
        print("Please set it before running this script:")
        print("  export DATABASE_URL='postgresql://user:password@host:port/database'")
        sys.exit(1)
    
    print(f"Connecting to database...")
    engine = create_engine(database_url)
    
    try:
        with engine.connect() as conn:
            # Check if column already exists
            inspector = inspect(engine)
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'trial_start_date' in columns:
                print("✓ Column 'trial_start_date' already exists in 'users' table")
                return True
            
            print("Adding 'trial_start_date' column to 'users' table...")
            
            # Add the column (PostgreSQL on Render)
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN trial_start_date TIMESTAMP NULL
            """))
            
            conn.commit()
            print("✓ Successfully added 'trial_start_date' column to 'users' table")
            return True
            
    except ProgrammingError as e:
        print(f"ERROR: Database error: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        return False
    finally:
        engine.dispose()

if __name__ == '__main__':
    print("=" * 60)
    print("Adding trial_start_date column to users table")
    print("=" * 60)
    
    success = add_trial_start_date_column()
    
    if success:
        print("\n✓ Script completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Script failed. Please check the error messages above.")
        sys.exit(1)


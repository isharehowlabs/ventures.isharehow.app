#!/usr/bin/env python3
"""
Auto-execution script to fix clients table schema:
- Make company column nullable (optional)
- Make phone column NOT NULL (required)

This script runs automatically at startup and only executes once.
Database is on Render (PostgreSQL).
"""

import os
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import ProgrammingError, OperationalError

def fix_clients_table_schema():
    """Fix clients table schema: make company nullable and phone NOT NULL"""
    
    # Get database URL from environment
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set")
        print("Please set it before running this script:")
        print("  export DATABASE_URL='postgresql://user:password@host:port/database'")
        return False
    
    print("Connecting to database...")
    engine = create_engine(database_url)
    
    try:
        with engine.begin() as conn:  # Use begin() for transaction management
            # Check if clients table exists
            inspector = inspect(engine)
            if 'clients' not in inspector.get_table_names():
                print("Table 'clients' does not exist, skipping schema fix")
                return True
            
            # Get current column definitions
            columns = {col['name']: col for col in inspector.get_columns('clients')}
            
            changes_made = False
            
            # 1. Make company nullable
            if 'company' in columns:
                if not columns['company']['nullable']:
                    print("Making 'company' column nullable...")
                    conn.execute(text("""
                        ALTER TABLE clients 
                        ALTER COLUMN company DROP NOT NULL
                    """))
                    print("✓ Made 'company' column nullable")
                    changes_made = True
                else:
                    print("✓ 'company' column is already nullable")
            else:
                print("⚠ Warning: 'company' column does not exist in 'clients' table")
            
            # 2. Make phone NOT NULL
            if 'phone' in columns:
                if columns['phone']['nullable']:
                    # First, update any NULL or empty phone values to a default
                    print("Updating NULL phone values to default...")
                    result = conn.execute(text("""
                        UPDATE clients 
                        SET phone = 'N/A' 
                        WHERE phone IS NULL OR phone = ''
                    """))
                    updated_count = result.rowcount
                    if updated_count > 0:
                        print(f"  Updated {updated_count} row(s) with NULL/empty phone values")
                    
                    # Now make the column NOT NULL
                    print("Making 'phone' column NOT NULL...")
                    conn.execute(text("""
                        ALTER TABLE clients 
                        ALTER COLUMN phone SET NOT NULL
                    """))
                    print("✓ Made 'phone' column NOT NULL")
                    changes_made = True
                else:
                    print("✓ 'phone' column is already NOT NULL")
            else:
                print("⚠ Warning: 'phone' column does not exist in 'clients' table")
            
            if not changes_made:
                print("✓ Schema is already correct - no changes needed")
            
            return True
            
    except ProgrammingError as e:
        print(f"ERROR: Database error: {e}")
        return False
    except OperationalError as e:
        print(f"ERROR: Database operation error: {e}")
        return False
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        engine.dispose()

if __name__ == '__main__':
    print("=" * 60)
    print("Fixing clients table schema (company optional, phone required)")
    print("=" * 60)
    
    success = fix_clients_table_schema()
    
    if success:
        print("\n✓ Script completed successfully!")
        sys.exit(0)
    else:
        print("\n✗ Script failed. Please check the error messages above.")
        sys.exit(1)


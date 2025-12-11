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
    
    print("📝 Adding venture fields to support_requests table...")
    
    # Helper function to check if column exists
    def column_exists(conn, table_name, column_name):
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = :table_name 
                AND column_name = :column_name
            )
        """), {"table_name": table_name, "column_name": column_name})
        return result.scalar()
    
    # Add each column individually with its own transaction
    columns_to_add = [
        ('budget', 'NUMERIC(10, 2) DEFAULT 0'),
        ('spent', 'NUMERIC(10, 2) DEFAULT 0'),
        ('delivery_date', 'TIMESTAMP'),
        ('start_date', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'),
        ('progress', 'INTEGER DEFAULT 0'),
    ]
    
    for col_name, col_def in columns_to_add:
        # Use a separate connection/transaction for each column
        with engine.begin() as connection:
            try:
                if column_exists(connection, 'support_requests', col_name):
                    print(f"  ℹ️  '{col_name}' column already exists")
                else:
                    connection.execute(text(
                        f"ALTER TABLE support_requests ADD COLUMN {col_name} {col_def}"
                    ))
                    print(f"  ✅ Added '{col_name}' column")
            except Exception as e:
                if 'already exists' in str(e).lower() or 'duplicate' in str(e).lower():
                    print(f"  ℹ️  '{col_name}' column already exists")
                else:
                    print(f"  ⚠️  Error adding '{col_name}' column: {e}")
                    # Transaction will auto-rollback, continue with next column
    
    print("\n✅ Migration completed successfully!")
            
except OperationalError as e:
    print(f"❌ Could not connect to database: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Unexpected error: {e}")
    sys.exit(1)

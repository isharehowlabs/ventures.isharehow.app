"""
Script to manually add google_analytics_property_key column to clients table
Run this on Render or wherever your PostgreSQL database is hosted
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
            WHERE table_name='clients' AND column_name='google_analytics_property_key'
        """))
        
        if result.fetchone():
            print("✓ Column 'google_analytics_property_key' already exists")
        else:
            print("Adding 'google_analytics_property_key' column...")
            conn.execute(text("""
                ALTER TABLE clients 
                ADD COLUMN google_analytics_property_key VARCHAR(100)
            """))
            conn.commit()
            print("✓ Column added successfully!")
            
except Exception as e:
    print(f"Error: {e}")
    exit(1)

#!/usr/bin/env python3
"""
Database Status Checker
Checks which migrations have been applied and what's missing.
"""

import os
import sys
from urllib.parse import urlparse
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Get database connection from DATABASE_URL"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable is not set")
        print("   Set it with: export DATABASE_URL='postgresql://user:pass@host:port/dbname'")
        sys.exit(1)
    
    try:
        # Parse DATABASE_URL
        parsed = urlparse(database_url)
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],  # Remove leading /
            user=parsed.username,
            password=parsed.password
        )
        return conn
    except Exception as e:
        print(f"❌ ERROR: Failed to connect to database: {e}")
        sys.exit(1)

def check_column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = %s 
        AND column_name = %s
    """, (table_name, column_name))
    return cursor.fetchone() is not None

def check_table_exists(cursor, table_name):
    """Check if a table exists"""
    cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = %s
    """, (table_name,))
    return cursor.fetchone() is not None

def check_index_exists(cursor, index_name):
    """Check if an index exists"""
    cursor.execute("""
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = %s
    """, (index_name,))
    return cursor.fetchone() is not None

def main():
    print("=" * 80)
    print("DATABASE STATUS CHECKER")
    print("=" * 80)
    print()
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    all_good = True
    
    # 1. Check ENS Migration Status
    print("📋 CHECKING ENS MIGRATION STATUS")
    print("-" * 80)
    
    ens_fields = ['ens_name', 'crypto_address', 'content_hash']
    ens_tables = ['users', 'user_profiles']
    
    ens_status = {}
    for table in ens_tables:
        if not check_table_exists(cursor, table):
            print(f"⚠️  Table '{table}' does not exist - skipping ENS checks")
            continue
        
        print(f"\n  Table: {table}")
        for field in ens_fields:
            exists = check_column_exists(cursor, table, field)
            status = "✅" if exists else "❌"
            ens_status[f"{table}.{field}"] = exists
            print(f"    {status} {field}")
            if not exists:
                all_good = False
    
    # Check ENS indexes
    print(f"\n  Indexes:")
    ens_indexes = [
        ('ix_users_ens_name', 'users.ens_name'),
        ('ix_users_crypto_address', 'users.crypto_address'),
        ('ix_user_profiles_ens_name', 'user_profiles.ens_name'),
        ('ix_user_profiles_crypto_address', 'user_profiles.crypto_address'),
    ]
    
    for index_name, column in ens_indexes:
        exists = check_index_exists(cursor, index_name)
        status = "✅" if exists else "⚠️ "
        print(f"    {status} {index_name} (on {column})")
    
    # 2. Check Employee/Admin Migration Status
    print("\n\n📋 CHECKING EMPLOYEE/ADMIN MIGRATION STATUS")
    print("-" * 80)
    
    if check_table_exists(cursor, 'users'):
        print("\n  Table: users")
        employee_fields = ['is_employee', 'is_admin']
        for field in employee_fields:
            exists = check_column_exists(cursor, 'users', field)
            status = "✅" if exists else "❌"
            print(f"    {status} {field}")
            if not exists:
                all_good = False
    else:
        print("❌ Table 'users' does not exist!")
        all_good = False
    
    # 3. Check Clients Table Migration Status
    print("\n\n📋 CHECKING CLIENTS TABLE MIGRATION STATUS")
    print("-" * 80)
    
    required_tables = [
        'clients',
        'client_employee_assignments',
        'client_dashboard_connections',
        'support_requests'
    ]
    
    for table in required_tables:
        exists = check_table_exists(cursor, table)
        status = "✅" if exists else "❌"
        print(f"  {status} Table: {table}")
        if not exists:
            all_good = False
    
    # 4. Check Other Important Tables
    print("\n\n📋 CHECKING OTHER IMPORTANT TABLES")
    print("-" * 80)
    
    other_tables = [
        'users',
        'user_profiles',
        'notifications',
        'subscriptions'
    ]
    
    for table in other_tables:
        exists = check_table_exists(cursor, table)
        status = "✅" if exists else "❌"
        print(f"  {status} Table: {table}")
        if not exists:
            all_good = False
    
    # Summary
    print("\n\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    if all_good:
        print("✅ All migrations appear to be applied!")
        print("\n   Your database is up to date with the expected schema.")
    else:
        print("❌ Some migrations are missing!")
        print("\n   You need to run the following migration scripts:")
        print()
        
        # Check what needs to be run
        needs_ens = any(not v for k, v in ens_status.items() if 'users' in k)
        needs_employee = not check_column_exists(cursor, 'users', 'is_employee') if check_table_exists(cursor, 'users') else False
        needs_clients = not check_table_exists(cursor, 'clients')
        
        if needs_ens:
            print("   1. ENS Migration:")
            print("      python3 add_ens_fields_migration.py")
            print("      (See: ENS_MIGRATION.md)")
            print()
        
        if needs_employee or needs_clients:
            print("   2. Employee/Admin & Clients Migration:")
            print("      python3 run_migration_direct.py")
            print("      (See: RUN_MIGRATION.md)")
            print()
        
        print("   Make sure DATABASE_URL is set before running migrations!")
    
    print("\n" + "=" * 80)
    
    cursor.close()
    conn.close()

if __name__ == '__main__':
    main()

# Database Status Checker

## Quick Status Check

Run the status checker to see what migrations have been applied:

```bash
cd backend-python
export DATABASE_URL="your_postgresql_connection_string"
python3 check_database_status.py
```

This will show you:
- ✅ What's already in place
- ❌ What's missing
- 📋 What migration scripts to run

## What It Checks

### 1. ENS Migration Status
- Checks for `ens_name`, `crypto_address`, `content_hash` columns in:
  - `users` table
  - `user_profiles` table
- Checks for related indexes

### 2. Employee/Admin Migration Status
- Checks for `is_employee` column in `users` table
- Checks for `is_admin` column in `users` table

### 3. Clients Table Migration Status
- Checks for `clients` table
- Checks for `client_employee_assignments` table
- Checks for `client_dashboard_connections` table
- Checks for `support_requests` table

### 4. Other Important Tables
- Checks for core tables: `users`, `user_profiles`, `notifications`, `subscriptions`

## Running Migrations

Based on the status checker output, run the appropriate migration:

### If ENS fields are missing:
```bash
python3 add_ens_fields_migration.py
```

### If Employee/Admin or Clients tables are missing:
```bash
python3 run_migration_direct.py
```

## Example Output

```
================================================================================
DATABASE STATUS CHECKER
================================================================================

📋 CHECKING ENS MIGRATION STATUS
--------------------------------------------------------------------------------

  Table: users
    ✅ ens_name
    ✅ crypto_address
    ✅ content_hash

  Table: user_profiles
    ✅ ens_name
    ✅ crypto_address
    ✅ content_hash

📋 CHECKING EMPLOYEE/ADMIN MIGRATION STATUS
--------------------------------------------------------------------------------

  Table: users
    ✅ is_employee
    ✅ is_admin

📋 CHECKING CLIENTS TABLE MIGRATION STATUS
--------------------------------------------------------------------------------
  ✅ Table: clients
  ✅ Table: client_employee_assignments
  ✅ Table: client_dashboard_connections
  ✅ Table: support_requests

================================================================================
SUMMARY
================================================================================
✅ All migrations appear to be applied!

   Your database is up to date with the expected schema.
================================================================================
```

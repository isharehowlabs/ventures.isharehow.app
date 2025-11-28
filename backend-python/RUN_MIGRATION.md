# Database Migration Instructions

## Available Migration Scripts

1. **`run_migration_direct.py`** - Adds `is_employee` column and creates support_requests, subscriptions, clients, and related Creative Dashboard tables
2. **`create_clients_table_migration.py`** - Standalone script to create clients table and related Creative Dashboard tables (clients, client_employee_assignments, client_dashboard_connections, support_requests)

## Running Migrations

### Option 1: Using run_migration_direct.py (Recommended)

This script creates all necessary tables including the clients table:

```bash
cd backend-python
export DATABASE_URL="your_postgresql_connection_string"
python3 run_migration_direct.py
```

### Option 2: Using create_clients_table_migration.py (If clients table is missing)

If you only need to create the clients table and related tables:

```bash
cd backend-python
export DATABASE_URL="your_postgresql_connection_string"
python3 create_clients_table_migration.py
```

### Option 3: Using Flask Migrate (If Flask environment is available)

```bash
cd backend-python
export FLASK_APP=app.py
export DATABASE_URL="your_postgresql_connection_string"
flask db upgrade
```

## Tables Created

The migration scripts create the following tables:

1. **clients** - Main client information table
2. **client_employee_assignments** - Links clients to employees
3. **client_dashboard_connections** - Links clients to dashboard types
4. **support_requests** - Support tickets for clients

## Troubleshooting

### Error: "relation 'clients' does not exist"

This means the clients table hasn't been created yet. Run one of the migration scripts above.

### Error: "DATABASE_URL environment variable is not set"

Make sure to set the DATABASE_URL environment variable before running the migration:

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### Error: "column already exists" or "table already exists"

These are safe to ignore - the scripts check for existing tables/columns and skip creation if they already exist.

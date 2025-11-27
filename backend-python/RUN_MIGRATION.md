# Database Migration Instructions

## Problem
The application code uses the `is_employee` column in the `users` table, but this column may not exist in your database yet. This causes 500 Internal Server Errors when trying to access user data.

## Important: If You Get "Table Already Exists" Errors

If you see errors like `relation "task" already exists` or `relation "clients" already exists`, this means your database already has some tables. The migrations have been updated to handle this gracefully - they will skip creating tables that already exist.

**Solution**: Just run the migration again. The updated migration will skip existing tables and only create/add what's missing.

## Solution: Run the Migration

The migration adds the `is_employee` column to the `users` table and creates `support_requests` and `subscriptions` tables.

**Note**: If you get import errors with `flask db upgrade`, use the direct migration script (`run_migration_direct.py`) which doesn't require Flask app dependencies.

### Option 1: Using Direct Migration Script (Recommended - No Flask dependencies)

1. **SSH into your server** or access your deployment environment (e.g., Render.com shell)

2. **Set your DATABASE_URL** (if not already set):
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. **Navigate to the backend-python directory**:
   ```bash
   cd backend-python
   ```

4. **Run the direct migration script**:
   ```bash
   python3 run_migration_direct.py
   ```

   This script:
   - Checks if the column already exists (skips if present)
   - Adds the `is_employee` column to the `users` table
   - Creates the index
   - Creates `support_requests` and `subscriptions` tables if they don't exist
   - Verifies the migration was successful

### Option 1b: Using Flask-Migrate (If dependencies are installed)

1. **SSH into your server** or access your deployment environment (e.g., Render.com shell)

2. **Navigate to the backend-python directory**:
   ```bash
   cd backend-python
   ```

3. **Run the migration**:
   ```bash
   flask db upgrade
   ```

   This will apply all pending migrations, including the `is_employee` column addition.

### Option 2: Manual SQL (If Flask-Migrate is not available)

If you can't use Flask-Migrate, you can run the SQL directly:

```sql
-- Add is_employee column to users table
ALTER TABLE users 
ADD COLUMN is_employee BOOLEAN NOT NULL DEFAULT false;

-- Create index for performance
CREATE INDEX ix_users_is_employee ON users(is_employee);
```

### Option 3: Using Python Script

You can also create a simple script to run the migration:

```python
# run_migration.py
from app import app, db
from flask_migrate import upgrade

with app.app_context():
    upgrade()
```

Then run:
```bash
python run_migration.py
```

## Verification

After running the migration, verify the column exists:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'is_employee';
```

You should see:
- `column_name`: `is_employee`
- `data_type`: `boolean`
- `column_default`: `false`

## Temporary Workaround

The code has been updated to handle the missing column gracefully using `safe_get_is_employee()`. However, you should still run the migration to enable full functionality.

## Notes

- The migration also creates `support_requests` and `subscriptions` tables
- All existing users will have `is_employee = false` by default
- You can manually set employees using SQL: `UPDATE users SET is_employee = true WHERE id = <user_id>;`

# Database Migration Instructions

## Problem
The application code uses the `is_employee` column in the `users` table, but this column may not exist in your database yet. This causes 500 Internal Server Errors when trying to access user data.

## Solution: Run the Migration

The migration file `migrations/versions/33_add_is_employee_and_support_subscription.py` adds the `is_employee` column to the `users` table.

### Option 1: Using Flask-Migrate (Recommended)

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

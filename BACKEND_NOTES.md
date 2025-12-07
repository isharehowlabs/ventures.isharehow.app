# Backend Development Notes

## Database Configuration

**IMPORTANT: The database is hosted on Render (PostgreSQL).**

- **PostgreSQL ONLY** - All SQLite logic has been removed
- Database connection requires `DATABASE_URL` environment variable (PostgreSQL connection string)
- Database migrations should be handled via auto-execution scripts, not Flask-Migrate
- Auto-execution scripts run at startup and are tracked in `.executed_scripts.json`
- Scripts in `backend-python/` directory are automatically detected and run once

## Database Connection

- **Required**: `DATABASE_URL` environment variable must be set
- Format: `postgresql://user:password@host:port/database`
- Automatically converted to `postgresql+psycopg://` for psycopg3 support
- Connection timeout: 5 seconds
- Pool pre-ping enabled for connection health checks

## Auto-Execution Scripts

Scripts that need to run at startup should:
1. Be placed in `backend-python/` directory
2. Have `if __name__ == '__main__':` block
3. Handle errors gracefully
4. Be idempotent (safe to run multiple times)
5. Use PostgreSQL-specific SQL syntax only

### Current Auto-Execution Scripts:
- `fix_clients_table_schema.py` - Makes company nullable and phone NOT NULL in clients table
- `add_trial_start_date_column.py` - Adds trial_start_date column to users table

## Schema Changes

When making schema changes:
1. Update the SQLAlchemy model in `app.py`
2. Create an auto-execution script to apply the changes to the database
3. Use PostgreSQL-specific SQL syntax (TIMESTAMP, ALTER COLUMN, etc.)
4. The script will run automatically on Render at next deployment

## Migration Notes

- Flask-Migrate is configured but migrations may have issues with multiple heads
- For Render deployments, use auto-execution scripts instead
- **All migrations assume PostgreSQL** - SQLite support has been completely removed
- Foreign key constraints are properly enforced at the database level


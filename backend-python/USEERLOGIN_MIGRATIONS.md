# Database Migrations Guide

This project uses Flask-Migrate (Alembic) for database schema management.

## Setup Complete

✅ Flask-Migrate is installed and configured
✅ Migrations directory initialized at `migrations/`
✅ Baseline migration created: `001_initial_baseline`
✅ SQLite database stamped with current schema

## Common Migration Commands

All commands should be run from the backend-python directory.

### View Current Migration Version
```bash
export DATABASE_URL="sqlite:///instance/ventures.db"
export FLASK_APP=app.py
flask db current
```

### Create a New Migration (after model changes)
```bash
export DATABASE_URL="sqlite:///instance/ventures.db"
export FLASK_APP=app.py
flask db migrate -m "Description of changes"
```

### Apply Migrations (upgrade database)
```bash
export DATABASE_URL="sqlite:///instance/ventures.db"
export FLASK_APP=app.py
flask db upgrade
```

### Revert Last Migration
```bash
export DATABASE_URL="sqlite:///instance/ventures.db"
export FLASK_APP=app.py
flask db downgrade
```

### View Migration History
```bash
export DATABASE_URL="sqlite:///instance/ventures.db"
export FLASK_APP=app.py
flask db history
```

## For PostgreSQL Database

When using PostgreSQL (production), use the full DATABASE_URL:

```bash
export DATABASE_URL="postgresql://python_app_database_user:N9uivzUt3Ex0ZNxVomAiOGnLukT0j1aC@dpg-d4cn4uodl3ps73bjhg6g-a.virginia-postgres.render.com/python_app_database"
export FLASK_APP=app.py
flask db upgrade
```

## Workflow for Schema Changes

1. **Modify your models** in `app.py` (add/remove/change db.Column definitions)

2. **Generate migration**:
   ```bash
   export DATABASE_URL="sqlite:///instance/ventures.db"
   export FLASK_APP=app.py
   flask db migrate -m "Add new column to UserProfile"
   ```

3. **Review the generated migration** in `migrations/versions/` directory

4. **Apply the migration**:
   ```bash
   flask db upgrade
   ```

5. **Commit the migration file** to version control

## Current Schema

The database includes the following tables:
- `task` - Task management
- `user_profiles` - User information and Patreon integration
- `aura_progress` - User wellness aura tracking
- `wellness_activities` - Completed wellness activities
- `wellness_goals` - User wellness goals
- `wellness_achievements` - Unlocked achievements

## Notes

- Always review auto-generated migrations before applying them
- Test migrations on development database before production
- Keep migration files in version control
- Never edit applied migrations - create new ones instead
- The baseline migration (001_initial_baseline) documents the initial schema

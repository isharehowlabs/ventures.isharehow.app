# Database Migration Guide for PostgreSQL

## Getting Your PostgreSQL Connection String

### From Render Dashboard:

1. Go to your Render dashboard: https://dashboard.render.com
2. Navigate to your PostgreSQL database service
3. In the database details, you'll see the **Internal Database URL** or **External Database URL**
4. The connection string format is:
   ```
   postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### Example Connection String:
```
postgresql://python_app_database_user:your_password@dpg-xxxxx-a.virginia-postgres.render.com:5432/python_app_database
```

## Setting DATABASE_URL for Migrations

### Option 1: Set Temporarily (Single Command)

Run migrations with DATABASE_URL set inline:

```bash
cd backend-python
export DATABASE_URL="postgresql://user:password@host:port/database"
export FLASK_APP=app.py
flask db migrate -m "Add User model for authentication"
flask db upgrade
```

### Option 2: Set in Current Shell Session

```bash
cd backend-python
export DATABASE_URL="postgresql://user:password@host:port/database"
export FLASK_APP=app.py

# Now you can run multiple migration commands
flask db migrate -m "Add User model for authentication"
flask db upgrade
flask db current
```

### Option 3: Use .env File (Recommended for Local Development)

Create or update `.env` file in `backend-python/` directory:

```bash
cd backend-python
echo 'DATABASE_URL=postgresql://user:password@host:port/database' >> .env
echo 'FLASK_APP=app.py' >> .env
```

Then run migrations:
```bash
flask db migrate -m "Add User model for authentication"
flask db upgrade
```

**Note:** Make sure `.env` is in `.gitignore` to avoid committing credentials!

### Option 4: Use the db_manage.sh Script

```bash
cd backend-python
DATABASE_URL="postgresql://user:password@host:port/database" ./db_manage.sh migrate "Add User model for authentication"
DATABASE_URL="postgresql://user:password@host:port/database" ./db_manage.sh upgrade
```

## Setting DATABASE_URL in Render (Production)

### For Web Service:

1. Go to Render Dashboard → Your Web Service → Environment
2. Add or update the `DATABASE_URL` environment variable
3. Use the **Internal Database URL** (faster, more secure) or **External Database URL** (if connecting from outside Render)
4. Click "Save Changes" - the service will restart

### For Cron Job:

1. Go to Render Dashboard → Your Cron Job Service → Environment
2. Add or update the `DATABASE_URL` environment variable
3. Use the same connection string as your web service
4. Click "Save Changes"

## Running Migrations in Production

### Option A: Via Render Shell (Recommended)

1. Go to Render Dashboard → Your Web Service
2. Click "Shell" tab
3. Run:
   ```bash
   cd backend-python
   export FLASK_APP=app.py
   flask db migrate -m "Add User model for authentication"
   flask db upgrade
   ```

### Option B: Via SSH/Remote Connection

If you have SSH access to your Render service:
```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
export FLASK_APP=app.py
flask db migrate -m "Add User model for authentication"
flask db upgrade
```

## Verifying Connection

Test your DATABASE_URL connection:

```bash
cd backend-python
export DATABASE_URL="postgresql://user:password@host:port/database"
export FLASK_APP=app.py
python3 -c "from app import app, db; app.app_context().push(); print('Connected!'); print('Tables:', db.engine.table_names())"
```

## Common Issues

### Issue: "No module named 'psycopg2'"
**Solution:** Install psycopg2-binary:
```bash
pip3 install psycopg2-binary
```

### Issue: "Connection refused" or "Timeout"
**Solutions:**
- Check if you're using the correct URL (Internal vs External)
- Verify database credentials
- Check firewall/network settings
- Ensure database is running

### Issue: "No changes in schema detected"
**Solution:** This is normal if the table already exists. The migration system tracks changes, so if the table was created via `db.create_all()`, Flask-Migrate won't detect it as a change. You can:
1. Manually create a migration file, or
2. Use `flask db stamp head` to mark the database as up-to-date

## Security Notes

- **Never commit** `.env` files or connection strings to git
- Use **Internal Database URL** in Render (more secure, faster)
- Use **External Database URL** only when necessary (e.g., local development)
- Rotate database passwords regularly
- Use environment variables, not hardcoded strings

## Quick Reference

```bash
# Set DATABASE_URL and run migration
export DATABASE_URL="postgresql://user:password@host:port/database"
export FLASK_APP=app.py
flask db migrate -m "Your migration message"
flask db upgrade

# Check current migration version
flask db current

# View migration history
flask db history

# Rollback last migration
flask db downgrade
```


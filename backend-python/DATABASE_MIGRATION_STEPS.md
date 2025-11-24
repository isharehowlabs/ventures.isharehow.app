# Database Migration Steps - Rename membership_active to membership_paid

## Prerequisites

1. Ensure you have access to your database
2. **BACKUP YOUR DATABASE** before running migrations
3. Ensure `DATABASE_URL` environment variable is set
4. Ensure Flask-Migrate is installed (already in requirements.txt)

## Step-by-Step Migration Process

### Step 1: Navigate to Backend Directory

```bash
cd backend-python
```

### Step 2: Set Environment Variables

```bash
# Set your database URL (adjust as needed)
export DATABASE_URL="postgresql://user:password@host:port/database"

# Set Flask app (required for migrations)
export FLASK_APP=app.py
```

**For Render/Production:**
- Environment variables should already be set in your Render dashboard
- You may need to SSH into your service or use Render's shell

### Step 3: Verify Database Connection

```bash
# Test database connection (optional but recommended)
python -c "from app import app, db; app.app_context().push(); db.engine.connect(); print('✓ Database connection successful')"
```

### Step 4: Check Current Migration Status

```bash
# See current database revision
flask db current

# See migration history
flask db history
```

### Step 5: Create Migration

```bash
# Generate migration file
flask db migrate -m "Rename membership_active to membership_paid"
```

This will:
- Analyze your User model changes
- Generate a migration file in `migrations/versions/`
- The file will be named something like: `XXXX_rename_membership_active_to_membership_paid.py`

### Step 6: Review Generated Migration File

**IMPORTANT:** Always review the generated migration before applying!

```bash
# Find the latest migration file
ls -lt migrations/versions/ | head -2

# Review the migration file (replace with actual filename)
cat migrations/versions/XXXX_rename_membership_active_to_membership_paid.py
```

**What to check:**
- The migration should rename the column: `op.alter_column('users', 'membership_active', new_column_name='membership_paid')`
- Or it might drop and recreate: Check if this is safe for your data
- Ensure no data loss operations

**Example of what the migration should look like:**

```python
def upgrade():
    # Rename column
    op.alter_column('users', 'membership_active',
                    new_column_name='membership_paid',
                    existing_type=sa.Boolean(),
                    existing_nullable=False)

def downgrade():
    # Revert rename
    op.alter_column('users', 'membership_paid',
                    new_column_name='membership_active',
                    existing_type=sa.Boolean(),
                    existing_nullable=False)
```

### Step 7: Apply Migration (Production)

**⚠️ WARNING: This will modify your production database!**

```bash
# Apply the migration
flask db upgrade
```

**What happens:**
- The `membership_active` column will be renamed to `membership_paid`
- All existing data will be preserved
- The migration is reversible (you can downgrade if needed)

### Step 8: Verify Migration

```bash
# Check migration was applied
flask db current

# Verify in database (optional - connect to your DB)
# Should show 'membership_paid' column instead of 'membership_active'
```

### Step 9: Test Application

After migration:
1. Test user registration
2. Test user login
3. Test Patreon OAuth flow
4. Test `/api/auth/me` endpoint
5. Verify cron job still works

## Rollback (If Needed)

If you need to rollback the migration:

```bash
# Rollback one migration
flask db downgrade -1

# Or rollback to specific revision
flask db downgrade <revision_id>
```

**Note:** Rollback will rename `membership_paid` back to `membership_active`

## Troubleshooting

### Issue: "Target database is not up to date"

**Solution:**
```bash
# Stamp database with current revision
flask db stamp head
```

### Issue: "Can't locate revision identified by 'XXXX'"

**Solution:**
```bash
# Check your migration history
flask db history

# If needed, manually fix the migration chain
```

### Issue: Migration fails with "column does not exist"

**Possible causes:**
- Database schema is out of sync
- Previous migration wasn't applied

**Solution:**
```bash
# Check current database state
flask db current

# Apply any pending migrations first
flask db upgrade
```

### Issue: Migration file looks wrong

**Solution:**
- Edit the migration file manually if needed
- Or delete it and regenerate: `flask db migrate -m "message"`

## For Render Deployment

If deploying to Render:

1. **Before deploying code:**
   - Create migration locally first
   - Test migration on staging/local database
   - Commit migration file to git

2. **After deploying code:**
   - SSH into Render service (or use Render shell)
   - Run: `flask db upgrade`
   - Or add to your startup script

3. **Alternative: Use Render's Post-Deploy Script**
   - Add to your `render.yaml` or service settings:
   ```yaml
   postDeployCommand: flask db upgrade
   ```

## Migration File Location

Generated migration files are stored in:
```
backend-python/migrations/versions/XXXX_rename_membership_active_to_membership_paid.py
```

## Summary Checklist

- [ ] Database backed up
- [ ] Environment variables set
- [ ] Migration file generated
- [ ] Migration file reviewed
- [ ] Migration applied (`flask db upgrade`)
- [ ] Application tested
- [ ] Migration verified in database

## Next Steps After Migration

1. Monitor application logs for any errors
2. Test all authentication flows
3. Verify cron job (`verify_members.py`) still works
4. Update any external documentation
5. Consider removing old migration files after confirming everything works


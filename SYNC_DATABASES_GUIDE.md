# Sync Local and Render Databases

## The Situation
- **Local backend**: Running with database at `backend-python/instance/ventures.db`
- **Render backend**: Running at https://api.ventures.isharehow.app  
- **Problem**: Migrations haven't been run, so `clients` table doesn't exist in either database

## Solution Steps

### Step 1: Run Migrations Locally

```bash
cd /home/ishaglcy/public_html/ventures.isharehow.app/backend-python

# Check current migration status
python3 run_migration_direct.py

# Or use Flask-Migrate
flask db upgrade
```

This will create the `clients`, `client_employee_assignments`, `client_dashboard_connections`, and `support_requests` tables.

### Step 2: Verify Tables Were Created

```bash
sqlite3 instance/ventures.db ".tables"
# Should now show: clients, client_employee_assignments, client_dashboard_connections, support_requests
```

### Step 3: Add Test Clients Locally

```bash
sqlite3 instance/ventures.db << 'SQL'
INSERT INTO clients (id, name, email, company, status, created_at, updated_at)
VALUES 
  ('test-client-1', 'Acme Corp', 'contact@acmecorp.com', 'Acme Corporation', 'active', datetime('now'), datetime('now')),
  ('test-client-2', 'Tech Solutions', 'info@techsolutions.com', 'Tech Solutions Inc', 'active', datetime('now'), datetime('now')),
  ('test-client-3', 'Design Studio', 'hello@designstudio.com', 'Design Studio LLC', 'pending', datetime('now'), datetime('now'));
SQL
```

### Step 4: Export Local Database

```bash
cd /home/ishaglcy/public_html/ventures.isharehow.app/backend-python

# Export just the client-related tables
sqlite3 instance/ventures.db << 'SQL' > clients_export.sql
.mode insert clients
SELECT * FROM clients;
.mode insert client_employee_assignments  
SELECT * FROM client_employee_assignments;
.mode insert client_dashboard_connections
SELECT * FROM client_dashboard_connections;
.mode insert support_requests
SELECT * FROM support_requests WHERE 1=0;
SQL
```

### Step 5: Apply to Render Database

**Option A: Via Render Dashboard**
1. Log into Render.com
2. Find your backend service
3. Go to Shell tab
4. Run: `flask db upgrade`
5. Use Render's database client to import the SQL

**Option B: Via Local Script** (if Render gives you database connection string)
```bash
# If Render provides PostgreSQL or MySQL connection:
# psql $DATABASE_URL < clients_export.sql
# or
# mysql -u user -p database < clients_export.sql
```

**Option C: Via API** (Create import script)
```python
# import_clients_to_render.py
import requests
import sqlite3

LOCAL_DB = 'instance/ventures.db'
RENDER_API = 'https://api.ventures.isharehow.app'
# You'll need admin JWT token

conn = sqlite3.connect(LOCAL_DB)
cursor = conn.cursor()

# Get all clients
clients = cursor.execute("SELECT * FROM clients").fetchall()

for client in clients:
    # POST to Render API
    response = requests.post(
        f'{RENDER_API}/api/creative/clients',
        json={
            'name': client[1],
            'email': client[2],
            'company': client[3],
            # ... etc
        },
        headers={'Authorization': f'Bearer {YOUR_JWT_TOKEN}'}
    )
    print(f"Created: {client[1]} - Status: {response.status_code}")
```

## Quick Fix: Point Frontend to Local Backend

**Temporary workaround while you sync databases:**

Create `.env.local`:
```bash
cd /home/ishaglcy/public_html/ventures.isharehow.app
cat > .env.local << 'ENV'
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
ENV
```

Then rebuild:
```bash
npm run build
```

This makes the frontend use your local backend (which you can then populate with test data).

## Recommended Approach

Since you're deploying to Render, the best long-term solution is:

1. **Run migrations on Render** (via Render dashboard or deploy script)
2. **Add clients via the UI** on the live site
3. **Don't maintain two databases** - choose one:
   - Use Render for production
   - Use local for development/testing only

## Check Current Database Status

```bash
# Local database tables
sqlite3 instance/ventures.db ".tables"

# Check if clients table exists
sqlite3 instance/ventures.db "SELECT name FROM sqlite_master WHERE type='table' AND name='clients';"

# Count clients (if table exists)
sqlite3 instance/ventures.db "SELECT COUNT(*) FROM clients;" 2>/dev/null || echo "No clients table yet"
```

## Run This Now

```bash
cd /home/ishaglcy/public_html/ventures.isharehow.app/backend-python

# Run migrations
python3 run_migration_direct.py

# Check result
sqlite3 instance/ventures.db ".tables" | grep -i client
```

If migrations run successfully, you'll see the client tables, and then you can add test data!

# ⚠️ IMPORTANT: Database Migration for Ventures

## PostgreSQL on Render - Add Fields Only

**DO NOT CREATE A NEW DATABASE**  
This migration adds new fields to your existing `support_requests` table on PostgreSQL (Render).

## Fields to Add

Run this SQL on your PostgreSQL database on Render:

```sql
-- Add venture-related fields to existing support_requests table
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS budget NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS spent NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP;
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
```

## How to Run Migration on Render

### Option 1: Via Render Dashboard
1. Go to your Render Dashboard
2. Open your PostgreSQL database
3. Click "Query" or "Connect"
4. Paste and run the SQL above

### Option 2: Via Command Line (from this server)
Set your Render PostgreSQL URL in environment and run:
```bash
export DATABASE_URL="your-render-postgres-url"
python3 add_venture_fields_direct.py
```

### Option 3: Automatic on Deploy
The migration script will run automatically when you deploy to Render if you set it up in your render.yaml build command.

## What This Does

- Adds `budget` field to track project budget
- Adds `spent` field to track amount spent
- Adds `delivery_date` field to track promised delivery date to client
- Adds `start_date` field to track project start date  
- Adds `progress` field to calculate completion percentage (0-100)

## Existing Data

- All existing support_requests will get default values:
  - budget = 0
  - spent = 0
  - delivery_date = NULL
  - start_date = CURRENT_TIMESTAMP
  - progress = 0

You can update these values later via the UI or API.

---
**Remember**: We're ADDING fields to existing table, NOT creating new database!

# Wellness Feature Fixes and Intervals.icu Integration Guide

## ✅ Completed Work

### 1. Fixed Goal Save Bug
**Files Modified:**
- `backend-python/app.py`: Added `parse_date_safely()` function to handle both YYYY-MM-DD and full ISO datetime formats
- Fixed `create_goal()` and `update_goal()` endpoints to use the new date parser

**Result:** Goals can now be saved successfully without "Failed to save goal" errors.

### 2. Database Models Added
**File:** `backend-python/app.py`

New models created:
- `UserAPIKey` - Stores encrypted API keys for external services
- `IntervalsActivityData` - Stores activity data with RPE, Feel, power, and HR metrics
- `IntervalsMenstrualData` - Stores menstrual cycle data (opt-in)
- `IntervalsWellnessMetrics` - Stores HRV, sleep, weight, and other wellness metrics

### 3. Database Migration
**File:** `backend-python/migrations/versions/20251203_add_intervals_icu_tables.py`

Run migration with:
```bash
cd backend-python
alembic upgrade head
```

### 4. Backend API Endpoints
**File:** `backend-python/app.py`

New endpoints:
- `GET /api/user/api-keys` - Get list of configured API keys
- `POST /api/user/api-keys` - Save Intervals.icu API key
- `DELETE /api/user/api-keys/<service>` - Remove API key
- `POST /api/wellness/intervals/sync` - Sync data from Intervals.icu
- `GET /api/wellness/intervals/activities` - Get imported activities
- `GET /api/wellness/intervals/wellness` - Get imported wellness metrics

### 5. Intervals.icu Client Service
**File:** `backend-python/intervals_icu.py`

Complete API client with methods for:
- Testing connections
- Fetching activities (with RPE, Feel, power, HR data)
- Fetching wellness metrics (HRV, sleep, weight, etc.)
- Fetching detailed activity streams

### 6. Frontend Service
**File:** `src/services/intervalsIcu.ts`

TypeScript service providing:
- API key management functions
- Data sync triggers
- Activity and wellness data fetching

### 7. Wellness Data Page Component
**File:** `src/components/wellness/WellnessDataPage.tsx`

Features:
- Single-scroll page with multiple charts
- RPE & Feel line charts
- Heart rate data visualization
- Power data bar charts
- HRV tracking
- Sleep tracking with quality metrics
- Time range selector (7 days to 6 months)
- Sync button for importing latest data
- Summary cards with key metrics

### 8. Intervals Settings Component
**File:** `src/components/wellness/IntervalsSettings.tsx`

Features:
- API key input and validation
- Connection testing
- Status display
- Easy disconnection option

## 🔧 Integration Steps

### Step 1: Add Intervals Settings to Settings Page

Edit `src/pages/settings.tsx` and add:

```typescript
import IntervalsSettings from '../components/wellness/IntervalsSettings';

// Add inside the settings page render, in an appropriate section:
<IntervalsSettings />
```

### Step 2: Add Health Data Tab to Rise Page

Edit `src/pages/rise.tsx`:

```typescript
import WellnessDataPage from '../components/wellness/WellnessDataPage';

// Add to the tab list (around line 29):
const tabs = [
  { label: 'Dashboard', icon: <DashboardIcon />, value: 0 },
  { label: 'Journal', icon: <JournalIcon />, value: 1 },
  { label: 'Skills', icon: <SkillsIcon />, value: 2 },
  { label: 'Wellness', icon: <WellnessIcon />, value: 3 },
  { label: 'Health Data', icon: <FitnessCenterIcon />, value: 4 }, // NEW
  { label: 'Spiritual', icon: <SpiritualIcon />, value: 5 },
];

// Add the TabPanel for Health Data:
<TabPanel value={currentTab} index={4}>
  <WellnessDataPage />
</TabPanel>
```

### Step 3: Install Required Dependencies

```bash
npm install recharts
```

### Step 4: Run Database Migration

```bash
cd backend-python
# Update alembic.ini with your database connection string
alembic upgrade head
```

### Step 5: Restart Backend Server

```bash
# Restart your Flask/Python backend
systemctl restart your-backend-service
# or
pm2 restart backend-python
```

## 🔐 Security Notes

**IMPORTANT:** The current implementation stores API keys without encryption. For production:

1. Install cryptography: `pip install cryptography`
2. Update `intervals_icu.py` functions `encrypt_api_key()` and `decrypt_api_key()`:

```python
from cryptography.fernet import Fernet
import os

# Store this key securely, preferably in environment variables
ENCRYPTION_KEY = os.getenv('API_KEY_ENCRYPTION_KEY')
if not ENCRYPTION_KEY:
    ENCRYPTION_KEY = Fernet.generate_key()

cipher = Fernet(ENCRYPTION_KEY)

def encrypt_api_key(api_key: str) -> str:
    return cipher.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    return cipher.decrypt(encrypted_key.encode()).decode()
```

## 📊 Usage Instructions for Users

1. **Get Intervals.icu API Key:**
   - Log into intervals.icu
   - Go to Settings
   - Find API key section
   - Copy your API key (format: `API_KEY_xxxxx:athlete_id`)

2. **Configure in App:**
   - Go to Settings page
   - Find "Intervals.icu Integration" section
   - Paste API key
   - Click "Save API Key"

3. **Sync Data:**
   - Go to Rise > Health Data tab
   - Select time range
   - Click "Sync Data"
   - View imported data in charts

4. **Menstrual Cycle Tracking (Optional):**
   - Data is automatically imported if available in Intervals.icu
   - Users control visibility through Intervals.icu settings
   - Opt-in flag is stored per user

## 🧪 Testing

Test the goal save fix:
1. Go to Rise > Wellness tab
2. Click "Add Goal"
3. Fill in goal details with a deadline
4. Click "Create Goal"
5. Verify no error appears and goal is saved

Test Intervals.icu integration:
1. Add API key in settings
2. Verify connection success
3. Go to Health Data tab
4. Click "Sync Data"
5. Verify activities and metrics appear
6. Check charts display correctly

## 📝 API Key Format

Intervals.icu API keys should be in format:
```
API_KEY_xxxxxxxxxxxxxx:123456
```

Where:
- First part is the API key
- Second part (after colon) is the athlete ID

## 🐛 Troubleshooting

**Goal Save Fails:**
- Check backend logs for date parsing errors
- Verify `parse_date_safely()` function is present in app.py

**Sync Fails:**
- Verify API key format is correct
- Test connection using "Test Connection" button
- Check backend logs for Intervals.icu API errors
- Verify athlete ID is correct

**No Data Appears:**
- Check if sync completed successfully
- Verify date range includes activities
- Check browser console for errors
- Verify backend endpoints are accessible

## 🔄 Future Enhancements

- Add automatic periodic syncing (background job)
- Implement encryption for API keys
- Add more detailed activity stream visualizations
- Add menstrual cycle calendar view
- Implement activity type filtering
- Add export functionality
- Create mobile-responsive charts
- Add goal recommendations based on activities

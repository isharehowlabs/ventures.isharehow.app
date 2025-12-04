# Ventures iShareHow App - Development Notes

## Project Overview
Full-stack application with React/TypeScript frontend and Python Flask backend, deployed on Render.com.

- **Frontend**: https://ventures.isharehow.app
- **Backend API**: https://api.ventures.isharehow.app
- **Framework**: Next.js (React/TypeScript)
- **Backend**: Python Flask with PostgreSQL
- **Real-time**: Socket.io for live updates

## Recent Work: Tasks Feature Fix (Dec 4, 2025)

### Problem
Tasks feature was not working due to:
1. Auth requests timing out after 5 seconds
2. Tasks endpoints requiring authentication (@require_session)
3. Socket.io connections working but operations failing

### Solution Implemented
1. **Backend** (`backend-python/app.py`):
   - Removed `@require_session` from UPDATE task endpoint (line 3814)
   - Removed `@require_session` from DELETE task endpoint (line 3845)
   - Tasks now work with optional authentication

2. **Frontend** (`src/hooks/useAuth.ts`):
   - Increased auth timeout from 5s to 15s (line 115)
   - Better handling of slow connections

3. **Improvements**:
   - Added debugging logs for task creation
   - Prevented duplicate task creation calls
   - Improved state management with useRef

### Tasks API Endpoints
```
GET    /api/tasks          - List all tasks (no auth required)
POST   /api/tasks          - Create task (no auth required)
PUT    /api/tasks/<id>     - Update task (no auth required)
DELETE /api/tasks/<id>     - Delete task (no auth required)
```

### Task Model
```typescript
{
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  supportRequestId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Architecture

### Backend Structure
- **Location**: `backend-python/`
- **Main file**: `app.py` (Flask application)
- **Database**: PostgreSQL (hosted on Render)
- **Deployment**: Automatic via Git push to GitHub → Render

### Frontend Structure
- **Hooks**: `src/hooks/` (useAuth.ts, useTasks.ts)
- **Components**: `src/components/`
- **Utils**: `src/utils/` (backendUrl.ts, socket.ts)

### Key Files
- `backend-python/app.py` - Main Flask server with all API endpoints
- `src/hooks/useTasks.ts` - Tasks state management with Socket.io
- `src/utils/socket.ts` - Socket.io client setup
- `src/utils/backendUrl.ts` - Backend URL configuration

## Development Workflow

### Backend Deployment
1. Make changes to `backend-python/app.py`
2. Commit: `git add backend-python/app.py && git commit -m "message"`
3. Push: `git push origin master`
4. Render auto-deploys (2-5 minutes)

### Local Backend (not typically used, deployed on Render)
```bash
cd backend-python
python3 app.py  # Requires Flask and dependencies
```

### Frontend Development
The frontend is built as a static Next.js export and served from this directory.

## Important Notes

### Authentication
- JWT-based authentication with httpOnly cookies
- Auth is OPTIONAL for tasks feature
- Auth timeout: 15 seconds
- Backend handles auth via `/api/auth/me` endpoint

### Socket.io
- Separate socket instances for general and tasks
- Auto-reconnect with max 3 attempts
- Events: `task_created`, `task_updated`, `task_deleted`

### No Web3 Dependencies
Tasks feature uses simple Python/Node backend only - no Web3 framework or blockchain dependencies.

## Troubleshooting

### Tasks Not Working
1. Check Render backend is running: `curl https://api.ventures.isharehow.app/api/tasks`
2. Check browser console for Socket.io connection status
3. Verify auth timeout errors are gone (was 5s, now 15s)

### Backend Issues
- Check Render dashboard for deployment status
- View logs at Render.com console
- Backup exists at `backend-python/app.py.backup-tasks`

### Database
- PostgreSQL hosted on Render
- Connection configured in `.env` file (not in repo)
- Task model: id, title, description, hyperlinks, status, support_request_id

## Git Commit (Dec 4, 2025)
```
commit a008cdef
Fix tasks feature: remove auth requirements and increase timeout

- Remove @require_session decorator from UPDATE and DELETE tasks endpoints
- Tasks now work without authentication (optional auth)
- Increase auth timeout from 5s to 15s for slower connections
- Add debugging logs for task creation
- Improve task state management with useRef for lastUpdated
- Prevent duplicate task creation calls
```

## Task Assignment Features (Dec 4, 2025 - Latest)

### New Features Added
- **Task Creator Tracking**: Every task now tracks who created it
- **User Assignment**: Tasks can be assigned to specific users
- **Real-time Notifications**: Users get notified via Socket.io when assigned a task
- **Timestamps**: Created and updated timestamps already existed

### Task Model Fields (Complete)
```typescript
{
  id: string;
  title: string;
  description: string;
  hyperlinks: string[];
  status: 'pending' | 'in-progress' | 'completed';
  supportRequestId?: string;
  
  // NEW: Assignment fields
  createdBy?: string;        // User ID who created the task
  createdByName?: string;    // Display name of creator
  assignedTo?: string;       // User ID assigned to the task
  assignedToName?: string;   // Display name of assigned user
  
  createdAt: string;
  updatedAt: string;
}
```

### API Usage

#### Create Task with Assignment
```typescript
const { createTask } = useTasks();
await createTask(
  'Task Title',
  'Description',
  ['https://link.com'],
  'pending',
  'user123',           // assignedTo (optional)
  'John Doe'           // assignedToName (optional)
);
```

#### Update Task Assignment
```typescript
const { updateTask } = useTasks();
await updateTask(taskId, {
  assignedTo: 'user456',
  assignedToName: 'Jane Smith'
});
```

### Socket.io Events
- `task_created` - When a task is created
- `task_updated` - When a task is updated
- `task_deleted` - When a task is deleted
- `task_assigned` - **NEW**: When a task is assigned to a user

Listen for assignment notifications:
```typescript
socket.on('task_assigned', (data) => {
  console.log('Task assigned:', data.task);
  console.log('Assigned to:', data.assignedToName);
  console.log('Created by:', data.createdByName);
});
```

### Database Migration
Before deploying, run the migration to add new columns:
```bash
cd backend-python
python3 add_task_assignment_columns.py
```

This will add:
- `created_by` (VARCHAR 100)
- `created_by_name` (VARCHAR 200)
- `assigned_to` (VARCHAR 100)
- `assigned_to_name` (VARCHAR 200)

All columns are nullable for backward compatibility with existing tasks.

### UI Components To-Do
- [ ] Display task creator and assigned user in task cards
- [ ] Add user selector/dropdown for assigning tasks
- [ ] Show toast notification when user receives an assignment
- [ ] Filter tasks by assigned user
- [ ] Show "My Tasks" vs "All Tasks" views

## Recent Commits
```
commit db11cc62 (HEAD -> master, origin/master)
Add user assignment and notifications to tasks
- Task model updated with assignment fields
- Socket.io notifications for task assignments
- Database migration script included
- Frontend Task interface updated

commit a008cdef
Fix tasks feature: remove auth requirements and increase timeout
- Removed @require_session from UPDATE and DELETE
- Increased auth timeout from 5s to 15s
- Tasks work with optional authentication
```

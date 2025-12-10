# User Management - Missing Features

## Current Status
✅ SaasAble UI design
✅ User list with search/pagination
✅ Edit personal details
✅ Change password
✅ Delete users
✅ Toggle admin/employee/client status

## Missing Features

### 1. Edit Dialog Tabs
Need to add tabs inside the edit user dialog:

**Tab 1: Personal Details** (✅ DONE)
- First/Last Name, Email, Username
- Phone, Address, Zipcode
- Joining Date
- Status (Active/Pending/Blocked/Reported)
- Permissions (Admin/Employee/Client toggles)

**Tab 2: Assigned Clients** (❌ MISSING)
- List of clients assigned to this employee
- Add/Remove client assignments
- Show client company, status
- Quick view client details

**Tab 3: Tasks** (❌ MISSING)  
- Tasks assigned to this user
- Filter by client
- Show task status, priority, due date
- Create new task button

**Tab 4: Support Requests** (❌ MISSING)
- Support tickets assigned to this user
- Filter by client, status
- Show ticket priority, created date
- View/respond to tickets

### 2. Client-Employee Linking
Need features to:
- Assign multiple clients to an employee
- View employee's client list
- Unassign clients
- See client assignment history

### 3. API Endpoints Needed

```
GET  /api/admin/users/:id/clients - Get assigned clients
POST /api/admin/users/:id/assign-client - Assign client
DELETE /api/admin/users/:id/unassign-client/:clientId - Unassign
GET  /api/admin/users/:id/tasks - Get user's tasks
GET  /api/admin/users/:id/support-requests - Get user's tickets
```

### 4. CORS Fix
The PUT method is allowed in backend CORS config but requests are failing.
Check:
- Preflight OPTIONS handling
- Content-Type headers
- Credentials in requests

## Implementation Priority

1. Fix CORS issue (HIGH)
2. Add Assigned Clients tab (HIGH)
3. Add Tasks tab (MEDIUM)
4. Add Support Requests tab (MEDIUM)
5. Client-employee linking UI (HIGH)

## Notes
- User object has numeric ID - ensure all API calls use `user.id` not `user.username`
- Backend at https://api.ventures.isharehow.app
- Use getBackendUrl() utility function
- Include credentials in all fetch requests

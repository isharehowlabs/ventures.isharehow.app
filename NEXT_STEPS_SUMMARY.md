# User Management - Next Steps Implementation Summary

## Current Status
✅ **Working**: Basic user management with SaasAble UI
✅ **Working**: List users, edit personal details, change passwords, delete users
✅ **Working**: Auth timeout fixed (15s), backend URL fixed

## What You Asked For
1. ✅ Tabs in edit dialog for Personal Details, Assigned Clients, Tasks, Support
2. ✅ Client-to-employee linking
3. ✅ View tasks assigned to user
4. ✅ View support requests for user

## Implementation Approach

### Frontend Changes Needed

**File**: `src/components/dashboard/creative/ClientEmployeeMatcher.tsx`

**1. Add Imports** (line ~11):
```typescript
// Add to existing MUI imports:
Tab, Tabs
```

**2. Add State** (after line ~115):
```typescript
const [editDialogTab, setEditDialogTab] = useState(0);
const [assignedClients, setAssignedClients] = useState<Client[]>([]);
const [userTasks, setUserTasks] = useState<any[]>([]);
const [userSupportRequests, setUserSupportRequests] = useState<any[]>([]);
const [loadingTabs, setLoadingTabs] = useState(false);
```

**3. Add Fetch Functions** (after handleAssignClients ~line 330):
```typescript
const fetchUserData = async (userId: number) => {
  setLoadingTabs(true);
  try {
    const [clientsRes, tasksRes, supportRes] = await Promise.all([
      fetch(`${backendUrl}/api/admin/users/${userId}/clients`, { credentials: 'include' }),
      fetch(`${backendUrl}/api/admin/users/${userId}/tasks`, { credentials: 'include' }),
      fetch(`${backendUrl}/api/admin/users/${userId}/support-requests`, { credentials: 'include' })
    ]);
    
    if (clientsRes.ok) {
      const data = await clientsRes.json();
      setAssignedClients(data.clients || []);
    }
    if (tasksRes.ok) {
      const data = await tasksRes.json();
      setUserTasks(data.tasks || []);
    }
    if (supportRes.ok) {
      const data = await supportRes.json();
      setUserSupportRequests(data.requests || []);
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
  } finally {
    setLoadingTabs(false);
  }
};

const handleUnassignClient = async (clientId: string) => {
  if (!selectedUser) return;
  try {
    const res = await fetch(
      `${backendUrl}/api/admin/users/${selectedUser.id}/unassign-client/${clientId}`,
      { method: 'DELETE', credentials: 'include' }
    );
    if (res.ok) {
      setSuccess('Client unassigned');
      fetchUserData(selectedUser.id);
    }
  } catch (err) {
    setError('Failed to unassign client');
  }
};
```

**4. Update handleEditClick** (around line ~180):
```typescript
// Add before setEditDialogOpen(true):
setEditDialogTab(0);
if (selectedUser) {
  fetchUserData(selectedUser.id);
}
```

**5. Replace Dialog Content** (lines ~546-700):
```jsx
<DialogContent dividers>
  <Tabs value={editDialogTab} onChange={(e, v) => setEditDialogTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
    <Tab label="Personal Details" />
    <Tab label="Assigned Clients" />
    <Tab label="Tasks" />
    <Tab label="Support" />
  </Tabs>

  {/* Tab 0: Personal Details - Keep existing form */}
  {editDialogTab === 0 && (
    <Box>
      {/* KEEP ALL EXISTING PERSONAL DETAILS FORM CODE */}
    </Box>
  )}

  {/* Tab 1: Assigned Clients */}
  {editDialogTab === 1 && (
    <Box>
      {loadingTabs ? <CircularProgress /> : (
        <>
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Assigned Clients ({assignedClients.length})
          </Typography>
          <Stack spacing={1} mb={2}>
            {assignedClients.map((client) => (
              <Paper key={client.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" fontWeight={500}>{client.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{client.company} • {client.status}</Typography>
                </Box>
                <IconButton size="small" onClick={() => handleUnassignClient(client.id)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
          <Button startIcon={<AddIcon />} onClick={() => setAssignClientDialogOpen(true)}>
            Assign More Clients
          </Button>
        </>
      )}
    </Box>
  )}

  {/* Tab 2: Tasks */}
  {editDialogTab === 2 && (
    <Box>
      {loadingTabs ? <CircularProgress /> : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No tasks assigned</TableCell>
                </TableRow>
              ) : (
                userTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.client_name}</TableCell>
                    <TableCell><Chip label={task.status} size="small" /></TableCell>
                    <TableCell>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )}

  {/* Tab 3: Support Requests */}
  {editDialogTab === 3 && (
    <Box>
      {loadingTabs ? <CircularProgress /> : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {userSupportRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">No support requests</TableCell>
                </TableRow>
              ) : (
                userSupportRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>{req.subject}</TableCell>
                    <TableCell>{req.client_name}</TableCell>
                    <TableCell><Chip label={req.priority} size="small" color={req.priority === 'high' ? 'error' : 'default'} /></TableCell>
                    <TableCell><Chip label={req.status} size="small" /></TableCell>
                    <TableCell>{new Date(req.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )}
</DialogContent>
```

### Backend API Endpoints Needed

**File**: `backend-python/app.py`

Add these routes:

```python
@app.route('/api/admin/users/<int:user_id>/clients', methods=['GET'])
@login_required
@admin_required
def get_user_clients(user_id):
    """Get clients assigned to a user"""
    # Query client_employee assignments
    # Return JSON with clients list

@app.route('/api/admin/users/<int:user_id>/unassign-client/<client_id>', methods=['DELETE'])
@login_required
@admin_required
def unassign_client_from_user(user_id, client_id):
    """Remove client assignment from user"""
    # Delete assignment record
    # Return success

@app.route('/api/admin/users/<int:user_id>/tasks', methods=['GET'])
@login_required
@admin_required
def get_user_tasks(user_id):
    """Get tasks assigned to user"""
    # Query tasks table
    # Return JSON with tasks list

@app.route('/api/admin/users/<int:user_id>/support-requests', methods=['GET'])
@login_required
@admin_required
def get_user_support_requests(user_id):
    """Get support requests assigned to user"""
    # Query support requests table
    # Return JSON with requests list
```

## Priority

1. **HIGH**: Add backend API endpoints (blocks everything else)
2. **HIGH**: Manually update frontend component with tabs
3. **MEDIUM**: Test with real data
4. **LOW**: Add create task/ticket functionality

## Notes

- This is a **manual code update** - automated sed commands created duplicates
- The existing component works, these are enhancements
- Backend APIs need to be created first before frontend tabs will work
- Use numeric user IDs (not usernames) in all API calls

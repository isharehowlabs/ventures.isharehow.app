# Edit Dialog Tabs - Implementation Plan

## ✅ Completed
1. Added Tab, Tabs imports from MUI
2. Added state variables:
   - editDialogTab (current tab index)
   - assignedClients (list of assigned clients)
   - userTasks (list of tasks)
   - userSupportRequests (list of support requests)
   - loadingAssignedClients (loading state)

3. Added fetch functions:
   - fetchAssignedClients(userId)
   - fetchUserTasks(userId)
   - fetchUserSupportRequests(userId)
   - handleUnassignClient(clientId)

4. Updated handleEditClick to:
   - Reset tab to 0
   - Fetch assigned clients
   - Fetch user tasks
   - Fetch support requests

## 🔧 Next: Update Dialog JSX

Need to replace current DialogContent with:

```jsx
<DialogContent dividers>
  {/* Tabs Header */}
  <Tabs value={editDialogTab} onChange={(e, v) => setEditDialogTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
    <Tab label="Personal Details" />
    <Tab label="Assigned Clients" />
    <Tab label="Tasks" />
    <Tab label="Support Requests" />
  </Tabs>

  {/* Tab 1: Personal Details */}
  {editDialogTab === 0 && (
    <Box>
      {/* Current personal details form */}
    </Box>
  )}

  {/* Tab 2: Assigned Clients */}
  {editDialogTab === 1 && (
    <Box>
      {loadingAssignedClients ? (
        <CircularProgress />
      ) : (
        <List>
          {assignedClients.map((client) => (
            <ListItem key={client.id}>
              <ListItemText 
                primary={client.name}
                secondary={`${client.company} • ${client.status}`}
              />
              <IconButton onClick={() => handleUnassignClient(client.id)}>
                <Delete />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}
      <Button startIcon={<Add />} onClick={() => setAssignClientDialogOpen(true)}>
        Assign Client
      </Button>
    </Box>
  )}

  {/* Tab 3: Tasks */}
  {editDialogTab === 2 && (
    <Box>
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
          {userTasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.client_name}</TableCell>
              <TableCell><Chip label={task.status} size="small" /></TableCell>
              <TableCell>{task.due_date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )}

  {/* Tab 4: Support Requests */}
  {editDialogTab === 3 && (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Ticket</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {userSupportRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.subject}</TableCell>
              <TableCell>{request.client_name}</TableCell>
              <TableCell><Chip label={request.priority} size="small" /></TableCell>
              <TableCell><Chip label={request.status} size="small" /></TableCell>
              <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )}
</DialogContent>
```

## API Endpoints Needed (Backend)

These need to be created in Flask backend:

1. `GET /api/admin/users/:id/clients` - Return assigned clients
2. `DELETE /api/admin/users/:id/unassign-client/:clientId` - Unassign a client
3. `GET /api/admin/users/:id/tasks` - Return user's tasks
4. `GET /api/admin/users/:id/support-requests` - Return user's support tickets

## Status

- Frontend: 70% complete (state and functions added)
- Dialog JSX: Needs manual update (complex structure)
- Backend APIs: Need to be created

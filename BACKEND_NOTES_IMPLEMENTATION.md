# Backend Implementation: Collaborative Task Notes

## Step 1: Run Database Migration

```bash
cd backend-python
python3 add_task_notes_column.py
```

## Step 2: Update Task Model (app.py)

Find the Task model class (search for `class Task(db.Model)`).
Add notes field:

```python
notes = db.Column(db.Text, nullable=True)  # Collaborative notes
```

## Step 3: Update create_task() Endpoint (line ~3808)

In the Task() constructor, add:

```python
notes=data.get('notes', '') or ''
```

## Step 4: Update update_task() Endpoint (line ~3886)

Add notes to updateable fields:

```python
if 'notes' in data:
    task.notes = data['notes']
```

## Step 5: Add Socket.io Event Handler

Add after existing socket handlers (search for `@socketio.on('task_`):

```python
@socketio.on('task_notes_update')
def handle_task_notes_update(data):
    """Handle real-time task notes updates"""
    try:
        task_id = data.get('task_id')
        notes = data.get('notes', '')
        user_id = data.get('user_id')
        
        if not task_id:
            emit('error', {'message': 'Task ID required'})
            return
        
        # Update task in database
        if DB_AVAILABLE:
            task = Task.query.get(task_id)
            if task:
                task.notes = notes
                task.updated_at = datetime.utcnow()
                db.session.commit()
                
                # Broadcast to all connected clients
                socketio.emit('task_notes_updated', {
                    'task_id': task_id,
                    'notes': notes,
                    'updated_by': user_id,
                    'updated_at': task.updated_at.isoformat() if task.updated_at else None
                }, broadcast=True)
                
                print(f"Task notes updated: {task_id} by user {user_id}")
            else:
                emit('error', {'message': 'Task not found'})
        else:
            emit('error', {'message': 'Database not available'})
            
    except Exception as e:
        print(f"Error updating task notes: {e}")
        import traceback
        traceback.print_exc()
        emit('error', {'message': str(e)})
```

## Step 6: Update task serialization

Find where tasks are converted to JSON (in get_tasks and create_task responses).
Ensure notes field is included:

```python
'notes': task.notes or '',
```

## Summary of Changes

Files modified:
1. `backend-python/add_task_notes_column.py` - NEW migration script
2. `backend-python/app.py` - Updated Task model, create/update endpoints, added Socket.io handler

Total lines added: ~50
Total time: ~30-45 minutes


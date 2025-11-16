# Python Flask Backend for Ventures App

This is the Python Flask backend that replaces the Node.js backend for team task management.

## Features
- RESTful API for task CRUD operations
- PostgreSQL database for data persistence
- Socket.IO for real-time updates to the React dashboard
- CORS enabled for frontend communication

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up PostgreSQL database:
   - Create a PostgreSQL database (Render provides this)
   - Set the `DATABASE_URL` environment variable

3. Run locally:
   ```bash
   python app.py
   ```

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Add environment variable: `DATABASE_URL` (provided by Render's PostgreSQL)
6. Set `PORT` environment variable if needed (Render sets this automatically)

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/<id>` - Update a task
- `DELETE /api/tasks/<id>` - Delete a task

## Socket.IO Events

- `task_created` - Emitted when a new task is created
- `task_updated` - Emitted when a task is updated
- `task_deleted` - Emitted when a task is deleted

The React frontend will automatically update in real-time when these events are received.
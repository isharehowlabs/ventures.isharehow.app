#!/bin/bash

# Kill existing Python backend process
pkill -f "python3 app.py"

# Wait for process to terminate
sleep 2

# Start the backend
cd /home/ishaglcy/public_html/ventures.isharehow.app/backend-python
nohup python3 app.py > /tmp/ventures-backend.log 2>&1 &

# Get the new PID
NEW_PID=$!
echo "Backend restarted with PID: $NEW_PID"

# Verify it's running
sleep 1
if ps -p $NEW_PID > /dev/null; then
    echo "Backend is running successfully"
else
    echo "Backend failed to start. Check /tmp/ventures-backend.log for errors"
fi

#!/bin/bash
# Restart script for ventures backend

echo "Stopping existing Python process..."
pkill -f "python3 app.py" || echo "No process found to stop"

# Wait for process to fully stop
sleep 2

echo "Starting application..."
cd /home/ishaglcy/public_html/ventures.isharehow.app/backend-python

# Start the application in the background
nohup python3 app.py > /tmp/ventures-backend.log 2>&1 &

# Get the PID
NEW_PID=$!
echo "Application started with PID: $NEW_PID"
echo "Logs are being written to /tmp/ventures-backend.log"

# Wait a moment for startup
sleep 3

# Check if it's running
if ps -p $NEW_PID > /dev/null; then
    echo "✓ Application is running"
    echo "Checking logs..."
    tail -20 /tmp/ventures-backend.log
else
    echo "✗ Application failed to start"
    echo "Check logs at /tmp/ventures-backend.log"
    exit 1
fi

#!/bin/bash
# Database Migration Management Script

# Set default to SQLite if DATABASE_URL not set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="sqlite:///instance/ventures.db"
    echo "Using SQLite database: $DATABASE_URL"
fi

export FLASK_APP=app.py

case "$1" in
    current)
        echo "Current migration version:"
        flask db current
        ;;
    migrate)
        if [ -z "$2" ]; then
            echo "Error: Please provide a migration message"
            echo "Usage: $0 migrate \"your message here\""
            exit 1
        fi
        echo "Creating new migration: $2"
        flask db migrate -m "$2"
        ;;
    upgrade)
        echo "Applying migrations..."
        flask db upgrade
        ;;
    downgrade)
        echo "Reverting last migration..."
        flask db downgrade
        ;;
    history)
        echo "Migration history:"
        flask db history
        ;;
    stamp)
        if [ -z "$2" ]; then
            echo "Error: Please provide a revision"
            echo "Usage: $0 stamp <revision>"
            exit 1
        fi
        echo "Stamping database with revision: $2"
        flask db stamp "$2"
        ;;
    *)
        echo "Database Migration Management"
        echo ""
        echo "Usage: $0 {command} [args]"
        echo ""
        echo "Commands:"
        echo "  current              - Show current migration version"
        echo "  migrate \"message\"    - Create new migration"
        echo "  upgrade              - Apply pending migrations"
        echo "  downgrade            - Revert last migration"
        echo "  history              - Show migration history"
        echo "  stamp <revision>     - Mark database at specific revision"
        echo ""
        echo "Environment:"
        echo "  DATABASE_URL=${DATABASE_URL}"
        echo ""
        echo "Examples:"
        echo "  $0 current"
        echo "  $0 migrate \"Add email column to users\""
        echo "  $0 upgrade"
        echo "  DATABASE_URL='postgresql://...' $0 upgrade"
        exit 1
        ;;
esac

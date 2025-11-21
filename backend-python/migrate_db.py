"""
Database migration utility using Flask-Migrate
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

# Import the app and db from your main application
from app import app, db

# Initialize Flask-Migrate
migrate = Migrate(app, db)

if __name__ == '__main__':
    print("Database migration utility loaded.")
    print("Available commands:")
    print("  flask db init       - Initialize migrations directory")
    print("  flask db migrate    - Create new migration")
    print("  flask db upgrade    - Apply migrations")
    print("  flask db downgrade  - Revert migrations")

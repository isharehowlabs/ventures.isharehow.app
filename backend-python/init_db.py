"""
Initialize database - creates all tables defined in app.py
"""

from app import app, db

print("Initializing database...")

with app.app_context():
    # Create all tables
    db.create_all()
    print("✓ All tables created successfully")
    
    # List created tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nCreated {len(tables)} tables:")
    for table in sorted(tables):
        print(f"  - {table}")

print("\nDatabase initialization complete!")

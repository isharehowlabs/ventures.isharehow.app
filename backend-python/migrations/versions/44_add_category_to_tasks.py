"""Add category column to tasks table

Revision ID: 44_add_category_tasks
Revises: 43_add_budget_deadline
Create Date: 2025-12-12 06:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '44_add_category_tasks'
down_revision = '43_add_budget_deadline'
branch_labels = None
depends_on = None


def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    bind = op.get_bind()
    inspector = inspect(bind)
    try:
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns
    except Exception:
        return False


def upgrade():
    """Add category column to tasks table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Check if tasks table exists
    if 'tasks' not in inspector.get_table_names():
        print("Table 'tasks' does not exist, skipping migration")
        return
    
    # Add category column if it doesn't exist
    if not column_exists('tasks', 'category'):
        print("Adding 'category' column to tasks table...")
        op.add_column('tasks',
                     sa.Column('category', sa.String(length=50), nullable=True, server_default='work'))
        print("✓ Added 'category' column")
    else:
        print("'category' column already exists")


def downgrade():
    """Remove category column from tasks table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    if 'tasks' not in inspector.get_table_names():
        print("Table 'tasks' does not exist, skipping downgrade")
        return
    
    # Remove category column if it exists
    if column_exists('tasks', 'category'):
        print("Removing 'category' column from tasks table...")
        op.drop_column('tasks', 'category')
        print("✓ Removed 'category' column")

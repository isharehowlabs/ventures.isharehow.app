"""Add polymorphic linking fields to tasks table

Revision ID: 45_add_polymorphic_tasks
Revises: 44_add_category_tasks
Create Date: 2025-12-12 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '45_add_polymorphic_tasks'
down_revision = '44_add_category_tasks'
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
    """Add polymorphic linking fields to tasks table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    # Check if tasks table exists
    if 'tasks' not in inspector.get_table_names():
        print("Table 'tasks' does not exist, skipping migration")
        return
    
    # Add linked_entity_type column if it doesn't exist
    if not column_exists('tasks', 'linked_entity_type'):
        print("Adding 'linked_entity_type' column to tasks table...")
        op.add_column('tasks',
                     sa.Column('linked_entity_type', sa.String(length=50), nullable=True))
        op.create_index('ix_tasks_linked_entity_type', 'tasks', ['linked_entity_type'])
        print("✓ Added 'linked_entity_type' column and index")
    else:
        print("'linked_entity_type' column already exists")
    
    # Add linked_entity_id column if it doesn't exist
    if not column_exists('tasks', 'linked_entity_id'):
        print("Adding 'linked_entity_id' column to tasks table...")
        op.add_column('tasks',
                     sa.Column('linked_entity_id', sa.String(length=100), nullable=True))
        op.create_index('ix_tasks_linked_entity_id', 'tasks', ['linked_entity_id'])
        print("✓ Added 'linked_entity_id' column and index")
    else:
        print("'linked_entity_id' column already exists")
    
    # Migrate existing support_request_id data to polymorphic fields
    try:
        print("Migrating existing support_request_id data to polymorphic fields...")
        op.execute("""
            UPDATE tasks 
            SET linked_entity_type = 'support_request', 
                linked_entity_id = support_request_id 
            WHERE support_request_id IS NOT NULL 
            AND (linked_entity_type IS NULL OR linked_entity_id IS NULL)
        """)
        print("✓ Migrated existing support_request_id data")
    except Exception as e:
        print(f"Warning: Could not migrate existing data: {e}")


def downgrade():
    """Remove polymorphic linking fields from tasks table"""
    conn = op.get_bind()
    inspector = inspect(conn)
    
    if 'tasks' not in inspector.get_table_names():
        print("Table 'tasks' does not exist, skipping downgrade")
        return
    
    # Remove indexes first
    if column_exists('tasks', 'linked_entity_id'):
        try:
            op.drop_index('ix_tasks_linked_entity_id', 'tasks')
        except Exception:
            pass
    
    if column_exists('tasks', 'linked_entity_type'):
        try:
            op.drop_index('ix_tasks_linked_entity_type', 'tasks')
        except Exception:
            pass
    
    # Remove columns
    if column_exists('tasks', 'linked_entity_id'):
        print("Removing 'linked_entity_id' column from tasks table...")
        op.drop_column('tasks', 'linked_entity_id')
        print("✓ Removed 'linked_entity_id' column")
    
    if column_exists('tasks', 'linked_entity_type'):
        print("Removing 'linked_entity_type' column from tasks table...")
        op.drop_column('tasks', 'linked_entity_type')
        print("✓ Removed 'linked_entity_type' column")

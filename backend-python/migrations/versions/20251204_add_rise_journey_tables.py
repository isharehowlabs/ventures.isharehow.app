"""Add Rise Journey tables

Revision ID: 20251204_add_rise_journey
Revises: 
Create Date: 2024-12-04 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '20251204_add_rise_journey'
down_revision = None
branch_labels = None
depends_on = None


def table_exists(table_name):
    """Check if a table exists in the database"""
    bind = op.get_bind()
    inspector = inspect(bind)
    return table_name in inspector.get_table_names()


def upgrade():
    """Create Rise Journey tables"""
    
    # Rise Journey Quiz
    if not table_exists('rise_journey_quizzes'):
        op.create_table(
            'rise_journey_quizzes',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('answers', sa.Text(), nullable=True),
            sa.Column('recommended_level', sa.String(length=50), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id']),
        )
        print("Created table 'rise_journey_quizzes'")
    else:
        print("Table 'rise_journey_quizzes' already exists, skipping creation")
    
    # Rise Journey Levels
    if not table_exists('rise_journey_levels'):
        op.create_table(
            'rise_journey_levels',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('level_key', sa.String(length=50), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('focus', sa.String(length=200), nullable=True),
            sa.Column('revenue_products', sa.Text(), nullable=True),
            sa.Column('order', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('level_key'),
        )
        print("Created table 'rise_journey_levels'")
    else:
        print("Table 'rise_journey_levels' already exists, skipping creation")
    
    # Rise Journey Lessons
    if not table_exists('rise_journey_lessons'):
        op.create_table(
            'rise_journey_lessons',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('level_id', sa.String(length=36), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('video_url', sa.Text(), nullable=True),
            sa.Column('pdf_url', sa.Text(), nullable=True),
            sa.Column('order', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['level_id'], ['rise_journey_levels.id']),
        )
        print("Created table 'rise_journey_lessons'")
    else:
        print("Table 'rise_journey_lessons' already exists, skipping creation")
    
    # Rise Journey Progress
    if not table_exists('rise_journey_progress'):
        op.create_table(
            'rise_journey_progress',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('level_id', sa.String(length=36), nullable=False),
            sa.Column('state', sa.String(length=20), nullable=True),
            sa.Column('started_at', sa.DateTime(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id']),
            sa.ForeignKeyConstraint(['level_id'], ['rise_journey_levels.id']),
            sa.UniqueConstraint('user_id', 'level_id', name='unique_user_level'),
        )
        print("Created table 'rise_journey_progress'")
    else:
        print("Table 'rise_journey_progress' already exists, skipping creation")
    
    # Rise Journey Lesson Progress
    if not table_exists('rise_journey_lesson_progress'):
        op.create_table(
            'rise_journey_lesson_progress',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('lesson_id', sa.String(length=36), nullable=False),
            sa.Column('completed', sa.Boolean(), nullable=True),
            sa.Column('completed_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id']),
            sa.ForeignKeyConstraint(['lesson_id'], ['rise_journey_lessons.id']),
            sa.UniqueConstraint('user_id', 'lesson_id', name='unique_user_lesson'),
        )
        print("Created table 'rise_journey_lesson_progress'")
    else:
        print("Table 'rise_journey_lesson_progress' already exists, skipping creation")
    
    # Rise Journey Notes
    if not table_exists('rise_journey_notes'):
        op.create_table(
            'rise_journey_notes',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('lesson_id', sa.String(length=36), nullable=False),
            sa.Column('content', sa.Text(), nullable=True),
            sa.Column('is_shared', sa.Boolean(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=True),
            sa.Column('updated_at', sa.DateTime(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id']),
            sa.ForeignKeyConstraint(['lesson_id'], ['rise_journey_lessons.id']),
        )
        print("Created table 'rise_journey_notes'")
    else:
        print("Table 'rise_journey_notes' already exists, skipping creation")
    
    # Rise Journey Trial
    if not table_exists('rise_journey_trials'):
        op.create_table(
            'rise_journey_trials',
            sa.Column('id', sa.String(length=36), nullable=False),
            sa.Column('user_id', sa.String(length=36), nullable=False),
            sa.Column('started_at', sa.DateTime(), nullable=True),
            sa.Column('expires_at', sa.DateTime(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['user_profiles.id']),
            sa.UniqueConstraint('user_id', name='unique_user_trial'),
        )
        print("Created table 'rise_journey_trials'")
    else:
        print("Table 'rise_journey_trials' already exists, skipping creation")


def downgrade():
    """Drop Rise Journey tables"""
    op.drop_table('rise_journey_trials')
    op.drop_table('rise_journey_notes')
    op.drop_table('rise_journey_lesson_progress')
    op.drop_table('rise_journey_progress')
    op.drop_table('rise_journey_lessons')
    op.drop_table('rise_journey_levels')
    op.drop_table('rise_journey_quizzes')


#!/usr/bin/env python3
"""
Direct migration runner for Rise Journey tables - runs migrations without requiring Flask app import
This bypasses the need for flask-jwt-extended and other app dependencies
"""
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

def get_database_url():
    """Get database URL from environment"""
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable is not set")
        print("Please set DATABASE_URL to your PostgreSQL connection string")
        sys.exit(1)
    
    # Convert postgresql:// to postgresql+psycopg:// for psycopg3 support
    if database_url.startswith('postgresql://'):
        database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
    
    return database_url

def check_table_exists(engine: Engine, table_name: str) -> bool:
    """Check if a table exists"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = :table_name
            """), {'table_name': table_name})
            return result.fetchone() is not None
    except Exception as e:
        print(f"Error checking table: {e}")
        return False

def run_migration():
    """Run the migration to create Rise Journey tables"""
    database_url = get_database_url()
    print(f"Connecting to database...")
    
    try:
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
        
        # Rise Journey Quiz
        if not check_table_exists(engine, 'rise_journey_quizzes'):
            print("Creating rise_journey_quizzes table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_quizzes (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id),
                            answers TEXT,
                            recommended_level VARCHAR(50),
                            completed_at TIMESTAMP
                        )
                    """))
                print("✓ Created table 'rise_journey_quizzes'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_quizzes table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_quizzes' already exists")
        
        # Rise Journey Levels
        if not check_table_exists(engine, 'rise_journey_levels'):
            print("Creating rise_journey_levels table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_levels (
                            id VARCHAR(36) PRIMARY KEY,
                            level_key VARCHAR(50) UNIQUE NOT NULL,
                            title VARCHAR(200) NOT NULL,
                            description TEXT,
                            focus VARCHAR(200),
                            revenue_products TEXT,
                            "order" INTEGER,
                            created_at TIMESTAMP
                        )
                    """))
                print("✓ Created table 'rise_journey_levels'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_levels table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_levels' already exists")
        
        # Rise Journey Lessons
        if not check_table_exists(engine, 'rise_journey_lessons'):
            print("Creating rise_journey_lessons table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_lessons (
                            id VARCHAR(36) PRIMARY KEY,
                            level_id VARCHAR(36) NOT NULL REFERENCES rise_journey_levels(id),
                            title VARCHAR(200) NOT NULL,
                            description TEXT,
                            video_url TEXT,
                            pdf_url TEXT,
                            "order" INTEGER,
                            created_at TIMESTAMP
                        )
                    """))
                print("✓ Created table 'rise_journey_lessons'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_lessons table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_lessons' already exists")
        
        # Rise Journey Progress
        if not check_table_exists(engine, 'rise_journey_progress'):
            print("Creating rise_journey_progress table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_progress (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id),
                            level_id VARCHAR(36) NOT NULL REFERENCES rise_journey_levels(id),
                            state VARCHAR(20),
                            started_at TIMESTAMP,
                            completed_at TIMESTAMP,
                            created_at TIMESTAMP,
                            updated_at TIMESTAMP,
                            UNIQUE(user_id, level_id)
                        )
                    """))
                print("✓ Created table 'rise_journey_progress'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_progress table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_progress' already exists")
        
        # Rise Journey Lesson Progress
        if not check_table_exists(engine, 'rise_journey_lesson_progress'):
            print("Creating rise_journey_lesson_progress table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_lesson_progress (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id),
                            lesson_id VARCHAR(36) NOT NULL REFERENCES rise_journey_lessons(id),
                            completed BOOLEAN,
                            completed_at TIMESTAMP,
                            created_at TIMESTAMP,
                            updated_at TIMESTAMP,
                            UNIQUE(user_id, lesson_id)
                        )
                    """))
                print("✓ Created table 'rise_journey_lesson_progress'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_lesson_progress table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_lesson_progress' already exists")
        
        # Rise Journey Notes
        if not check_table_exists(engine, 'rise_journey_notes'):
            print("Creating rise_journey_notes table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_notes (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(id),
                            lesson_id VARCHAR(36) NOT NULL REFERENCES rise_journey_lessons(id),
                            content TEXT,
                            is_shared BOOLEAN,
                            created_at TIMESTAMP,
                            updated_at TIMESTAMP
                        )
                    """))
                print("✓ Created table 'rise_journey_notes'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_notes table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_notes' already exists")
        
        # Rise Journey Trial
        if not check_table_exists(engine, 'rise_journey_trials'):
            print("Creating rise_journey_trials table...")
            try:
                with engine.begin() as conn:
                    conn.execute(text("""
                        CREATE TABLE rise_journey_trials (
                            id VARCHAR(36) PRIMARY KEY,
                            user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES user_profiles(id),
                            started_at TIMESTAMP,
                            expires_at TIMESTAMP NOT NULL,
                            is_active BOOLEAN
                        )
                    """))
                print("✓ Created table 'rise_journey_trials'")
            except Exception as create_error:
                error_str = str(create_error).lower()
                if 'already exists' in error_str or 'duplicate' in error_str:
                    print("✓ rise_journey_trials table already exists (skipped)")
                else:
                    raise
        else:
            print("✓ Table 'rise_journey_trials' already exists")
        
        print("\n✅ All Rise Journey tables created successfully!")
        
        # Verification
        print("\nVerification:")
        tables = [
            'rise_journey_quizzes',
            'rise_journey_levels',
            'rise_journey_lessons',
            'rise_journey_progress',
            'rise_journey_lesson_progress',
            'rise_journey_notes',
            'rise_journey_trials'
        ]
        for table in tables:
            if check_table_exists(engine, table):
                print(f"  ✓ {table} exists")
            else:
                print(f"  ✗ {table} NOT found (migration may have failed)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    print("=" * 60)
    print("Database Migration: Create Rise Journey Tables")
    print("=" * 60)
    print()
    run_migration()


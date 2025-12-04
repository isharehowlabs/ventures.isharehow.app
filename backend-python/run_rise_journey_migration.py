#!/usr/bin/env python3
"""
Direct migration script to create Rise Journey tables
This can be run if flask db upgrade has issues with multiple heads
"""

import os
import sys
from sqlalchemy import inspect, text

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db

def table_exists(table_name: str) -> bool:
    """Check if a table exists in the database"""
    inspector = inspect(db.engine)
    return table_name in inspector.get_table_names()

def run_migration():
    """Run the Rise Journey migration directly"""
    with app.app_context():
        print("Creating Rise Journey tables...")
        
        with db.engine.connect() as conn:
            # Start a transaction
            trans = conn.begin()
            
            try:
                # Rise Journey Quiz
                if not table_exists('rise_journey_quizzes'):
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
                else:
                    print("  Table 'rise_journey_quizzes' already exists")
                
                # Rise Journey Levels
                if not table_exists('rise_journey_levels'):
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
                else:
                    print("  Table 'rise_journey_levels' already exists")
                
                # Rise Journey Lessons
                if not table_exists('rise_journey_lessons'):
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
                else:
                    print("  Table 'rise_journey_lessons' already exists")
                
                # Rise Journey Progress
                if not table_exists('rise_journey_progress'):
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
                else:
                    print("  Table 'rise_journey_progress' already exists")
                
                # Rise Journey Lesson Progress
                if not table_exists('rise_journey_lesson_progress'):
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
                else:
                    print("  Table 'rise_journey_lesson_progress' already exists")
                
                # Rise Journey Notes
                if not table_exists('rise_journey_notes'):
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
                else:
                    print("  Table 'rise_journey_notes' already exists")
                
                # Rise Journey Trial
                if not table_exists('rise_journey_trials'):
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
                else:
                    print("  Table 'rise_journey_trials' already exists")
                
                # Commit the transaction
                trans.commit()
                print("\n✓ All Rise Journey tables created successfully!")
                
            except Exception as e:
                trans.rollback()
                print(f"\n✗ Error creating tables: {e}")
                import traceback
                traceback.print_exc()
                sys.exit(1)

if __name__ == '__main__':
    run_migration()


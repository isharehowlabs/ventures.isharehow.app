#!/usr/bin/env python3
"""
Seed script to initialize Rise Journey levels and structure
Run this after creating the database tables
"""

import os
import sys
from datetime import datetime
import uuid
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app, db
from app import (
    RiseJourneyLevel,
    RiseJourneyLesson,
)

# Journey levels data
JOURNEY_LEVELS = [
    {
        'level_key': 'wellness',
        'title': 'Wellness',
        'description': 'Foundational Physical Health & Energy. Focus on diet, body mechanics, Merkaba, Aura, body electricity, and detoxing.',
        'focus': 'Foundational Physical Health & Energy',
        'revenue_products': ['Rise Supplements'],
        'order': 1,
    },
    {
        'level_key': 'mobility',
        'title': 'Mobility',
        'description': 'Foundational Movement. Focus on exercise, sports, body tapping/stretching, and self lymphatic work.',
        'focus': 'Foundational Movement',
        'revenue_products': ['Rise Athletic Gear'],
        'order': 2,
    },
    {
        'level_key': 'accountability',
        'title': 'Accountability',
        'description': 'Foundational Self-Love & Power. Learn to honor that you and nobody else is responsible for everything in your reality.',
        'focus': 'Foundational Self-Love & Power',
        'revenue_products': ['Interactive Journaling App'],
        'order': 3,
    },
    {
        'level_key': 'creativity',
        'title': 'Creativity',
        'description': 'Mental Clarity & Self-Expression. Explore art, projects, writing, positive thinking, and perspective.',
        'focus': 'Mental Clarity & Self-Expression',
        'revenue_products': [],
        'order': 4,
    },
    {
        'level_key': 'alignment',
        'title': 'Alignment',
        'description': 'Intentional Action & Energetic State. Learn to attract from a place of love instead of fear.',
        'focus': 'Intentional Action & Energetic State',
        'revenue_products': [],
        'order': 5,
    },
    {
        'level_key': 'mindfulness',
        'title': 'Mindfulness',
        'description': 'Deep Inner Focus & Energy Clearing. Practice meditation, hypnosis, flow state, and Reiki.',
        'focus': 'Deep Inner Focus & Energy Clearing',
        'revenue_products': [],
        'order': 6,
    },
    {
        'level_key': 'destiny',
        'title': 'Destiny',
        'description': 'Higher Self Activation & Purpose. Explore scripting, past life regression, and DNA activation.',
        'focus': 'Higher Self Activation & Purpose',
        'revenue_products': [],
        'order': 7,
    },
]

def seed_journey_levels():
    """Create journey levels if they don't exist"""
    with app.app_context():
        print("Seeding Rise Journey levels...")
        
        for level_data in JOURNEY_LEVELS:
            existing = RiseJourneyLevel.query.filter_by(level_key=level_data['level_key']).first()
            if existing:
                print(f"  Level '{level_data['level_key']}' already exists, skipping...")
                continue
            
            level = RiseJourneyLevel(
                id=str(uuid.uuid4()),
                level_key=level_data['level_key'],
                title=level_data['title'],
                description=level_data['description'],
                focus=level_data['focus'],
                revenue_products=json.dumps(level_data['revenue_products']),
                order=level_data['order'],
            )
            db.session.add(level)
            print(f"  Created level: {level_data['title']}")
        
        db.session.commit()
        print("✓ Journey levels seeded successfully!")

def seed_sample_lessons():
    """Create sample lessons for each level"""
    with app.app_context():
        print("\nSeeding sample lessons...")
        
        for level_data in JOURNEY_LEVELS:
            level = RiseJourneyLevel.query.filter_by(level_key=level_data['level_key']).first()
            if not level:
                print(f"  Level '{level_data['level_key']}' not found, skipping lessons...")
                continue
            
            # Check if lessons already exist
            existing_lessons = RiseJourneyLesson.query.filter_by(level_id=level.id).count()
            if existing_lessons > 0:
                print(f"  Level '{level_data['title']}' already has lessons, skipping...")
                continue
            
            # Create sample lessons
            sample_lessons = [
                {
                    'title': f'Introduction to {level_data["title"]}',
                    'description': f'Welcome to the {level_data["title"]} level. This lesson introduces you to the core concepts.',
                    'video_url': '',  # Add YouTube URLs later
                    'pdf_url': '',  # Add PDF URLs later
                    'order': 1,
                },
                {
                    'title': f'{level_data["title"]} Fundamentals',
                    'description': f'Learn the fundamental principles of {level_data["title"]}.',
                    'video_url': '',
                    'pdf_url': '',
                    'order': 2,
                },
            ]
            
            for lesson_data in sample_lessons:
                lesson = RiseJourneyLesson(
                    id=str(uuid.uuid4()),
                    level_id=level.id,
                    title=lesson_data['title'],
                    description=lesson_data['description'],
                    video_url=lesson_data['video_url'],
                    pdf_url=lesson_data['pdf_url'],
                    order=lesson_data['order'],
                )
                db.session.add(lesson)
                print(f"    Created lesson: {lesson_data['title']}")
        
        db.session.commit()
        print("✓ Sample lessons seeded successfully!")

if __name__ == '__main__':
    # Get database URL
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL environment variable not set")
        print("Set it with: export DATABASE_URL='your_connection_string'")
        sys.exit(1)
    
    try:
        seed_journey_levels()
        seed_sample_lessons()
        print("\n✓ All seeding completed successfully!")
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


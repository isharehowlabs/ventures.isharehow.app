# Rise Journey Frontend Integration Guide

## Overview
This guide explains how to integrate the newly created Rise Journey frontend with your backend API.

## What Was Built

### ✅ Components Created
1. **RiseJourney.tsx** - The Path dashboard with 7-level journey map
2. **RiseJourneyLesson.tsx** - The Sanctuary lesson viewer with split-screen layout
3. **useRiseJourney.ts** - Custom hooks for API integration

### ✅ Features Implemented
- 7-level vertical journey cards with visual connectors
- Lock/unlock logic based on user progress
- "Recommended Start" badge from quiz
- Progress bars for each level
- Trial days remaining counter
- Product recommendations per level
- Split-screen lesson view (video + interactive dashboard)
- Three-tab interface: Notes, Journal (4 Pillars), Tasks
- Dark mode theme for lesson view
- Responsive design (mobile-friendly)

## Quick Start

### 1. Update Your Routing

Add these routes to your application:

```typescript
// In your router configuration (e.g., App.tsx or routes.tsx)
import RiseJourney from '@/components/rise/RiseJourney';
import RiseJourneyLesson from '@/components/rise/RiseJourneyLesson';

// Routes:
{
  path: '/rise',
  element: <RiseJourney />
},
{
  path: '/rise/level/:levelId',
  element: <RiseLevelView /> // Create this wrapper
},
{
  path: '/rise/level/:levelId/lesson/:lessonId',
  element: <RiseLessonView /> // Create this wrapper
}
```

### 2. Create Wrapper Components

#### Level View Wrapper
```typescript
// src/pages/RiseLevelView.tsx
import { useParams } from 'react-router-dom';
import { useRiseJourney } from '@/hooks/useRiseJourney';

export default function RiseLevelView() {
  const { levelId } = useParams();
  const { levels } = useRiseJourney();
  
  const level = levels.find(l => l.id === Number(levelId));
  
  if (!level) return <div>Level not found</div>;
  
  // Display level overview with list of lessons
  return (
    <div className="container mx-auto p-6">
      <h1>{level.title}</h1>
      <p>{level.description}</p>
      {/* List lessons here */}
    </div>
  );
}
```

#### Lesson View Wrapper
```typescript
// src/pages/RiseLessonView.tsx
import { useParams } from 'react-router-dom';
import RiseJourneyLesson from '@/components/rise/RiseJourneyLesson';
import { useLessonData } from '@/hooks/useRiseJourney';

export default function RiseLessonView() {
  const { levelId, lessonId } = useParams();
  const { lesson } = useLessonData(Number(lessonId));
  
  if (!lesson) return <div>Loading...</div>;
  
  const lessonData = {
    levelId: Number(levelId),
    levelName: lesson.level_name,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    videoUrl: lesson.video_url,
    pdfUrl: lesson.pdf_url,
    pdfTitle: lesson.pdf_title
  };
  
  return <RiseJourneyLesson lessonData={lessonData} />;
}
```

### 3. Backend API Implementation

You need to create these API endpoints in your backend:

#### Python/Flask Example

```python
# backend-python/routes/rise_journey.py

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, RiseJourneyLevel, RiseJourneyLesson, RiseJourneyUserProgress

rise_journey_bp = Blueprint('rise_journey', __name__)

@rise_journey_bp.route('/api/rise-journey/levels', methods=['GET'])
@login_required
def get_levels():
    """Get all 7 Rise Journey levels"""
    levels = RiseJourneyLevel.query.order_by(RiseJourneyLevel.order_index).all()
    return jsonify([level.to_dict() for level in levels])

@rise_journey_bp.route('/api/rise-journey/progress', methods=['GET'])
@login_required
def get_user_progress():
    """Get user's journey progress"""
    progress = RiseJourneyUserProgress.query.filter_by(
        user_id=current_user.id
    ).first()
    
    if not progress:
        # Create initial progress record
        progress = RiseJourneyUserProgress(
            user_id=current_user.id,
            current_level=1,
            recommended_level=1  # Set from quiz results
        )
        db.session.add(progress)
        db.session.commit()
    
    return jsonify({
        'recommendedLevel': progress.recommended_level,
        'currentLevel': progress.current_level,
        'completedLevels': progress.completed_levels or [],
        'levelProgress': progress.level_progress or {}
    })

@rise_journey_bp.route('/api/rise-journey/lessons/<int:lesson_id>', methods=['GET'])
@login_required
def get_lesson(lesson_id):
    """Get lesson details"""
    lesson = RiseJourneyLesson.query.get_or_404(lesson_id)
    return jsonify(lesson.to_dict())

@rise_journey_bp.route('/api/rise-journey/lessons/<int:lesson_id>/complete', methods=['POST'])
@login_required
def complete_lesson(lesson_id):
    """Mark lesson as complete"""
    from models import RiseJourneyLessonProgress
    
    progress = RiseJourneyLessonProgress.query.filter_by(
        user_id=current_user.id,
        lesson_id=lesson_id
    ).first()
    
    if not progress:
        progress = RiseJourneyLessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id
        )
        db.session.add(progress)
    
    progress.completed = True
    progress.completed_at = datetime.utcnow()
    db.session.commit()
    
    # Update level progress
    update_level_progress(current_user.id, lesson_id)
    
    return jsonify({'success': True})

@rise_journey_bp.route('/api/rise-journey/lessons/<int:lesson_id>/notes', methods=['GET', 'POST'])
@login_required
def lesson_notes(lesson_id):
    """Get or save lesson notes"""
    if request.method == 'POST':
        from models import RiseJourneyNote
        
        data = request.json
        note = RiseJourneyNote.query.filter_by(
            user_id=current_user.id,
            lesson_id=lesson_id,
            note_type='notes'
        ).first()
        
        if not note:
            note = RiseJourneyNote(
                user_id=current_user.id,
                lesson_id=lesson_id,
                note_type='notes'
            )
            db.session.add(note)
        
        note.content = data['content']
        db.session.commit()
        
        return jsonify({'success': True})
    
    # GET
    note = RiseJourneyNote.query.filter_by(
        user_id=current_user.id,
        lesson_id=lesson_id,
        note_type='notes'
    ).first()
    
    return jsonify({'content': note.content if note else ''})

@rise_journey_bp.route('/api/rise-journey/lessons/<int:lesson_id>/journal', methods=['GET', 'POST'])
@login_required
def lesson_journal(lesson_id):
    """Get or save journal entries (4 Pillars)"""
    if request.method == 'POST':
        from models import RiseJourneyNote
        
        data = request.json
        pillar = data['pillar']  # physical, mental, spiritual, wellness
        
        note = RiseJourneyNote.query.filter_by(
            user_id=current_user.id,
            lesson_id=lesson_id,
            note_type='journal',
            pillar=pillar
        ).first()
        
        if not note:
            note = RiseJourneyNote(
                user_id=current_user.id,
                lesson_id=lesson_id,
                note_type='journal',
                pillar=pillar
            )
            db.session.add(note)
        
        note.content = data['content']
        db.session.commit()
        
        return jsonify({'success': True})
    
    # GET
    entries = RiseJourneyNote.query.filter_by(
        user_id=current_user.id,
        lesson_id=lesson_id,
        note_type='journal'
    ).all()
    
    return jsonify([{
        'pillar': e.pillar,
        'content': e.content,
        'created_at': e.created_at.isoformat()
    } for e in entries])

@rise_journey_bp.route('/api/user/trial-status', methods=['GET'])
@login_required
def get_trial_status():
    """Get trial days remaining"""
    from datetime import datetime
    
    # Assuming you have trial_ends_at field on User model
    trial_ends = current_user.trial_ends_at
    if not trial_ends:
        return jsonify({'daysRemaining': 0, 'isActive': False})
    
    days_remaining = (trial_ends - datetime.now()).days
    return jsonify({
        'daysRemaining': max(0, days_remaining),
        'isActive': days_remaining > 0
    })
```

### 4. Update Your Database Models

Ensure you have the `pillar` field in your notes table:

```python
# In your models file, ensure RiseJourneyNote has:
class RiseJourneyNote(db.Model):
    __tablename__ = 'rise_journey_notes'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    lesson_id = db.Column(db.Integer, db.ForeignKey('rise_journey_lessons.id'))
    note_type = db.Column(db.String(20))  # 'notes' or 'journal'
    pillar = db.Column(db.String(20))  # 'physical', 'mental', 'spiritual', 'wellness'
    content = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 5. Task Integration

The components use your existing Task API. Ensure it supports:

```python
# Your existing tasks endpoint should handle:
# - category filter (e.g., category='Rise Journey')
# - lessonId metadata
# - levelId metadata

# Example modification to your task creation:
@tasks_bp.route('/api/tasks', methods=['POST'])
@login_required
def create_task():
    data = request.json
    task = Task(
        user_id=current_user.id,
        text=data['text'],
        category=data.get('category'),  # 'Rise Journey'
        metadata={
            'lessonId': data.get('lessonId'),
            'levelId': data.get('levelId')
        }
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict())
```

## Testing Checklist

After integration, test these flows:

- [ ] Navigate to `/rise` and see the 7-level journey map
- [ ] Click "Enter Path" on a level
- [ ] Open a lesson and see the video player
- [ ] Take notes in the Notes tab (should auto-save)
- [ ] Add journal entries in all 4 pillars
- [ ] Create, complete, and delete tasks
- [ ] Mark lesson as complete
- [ ] Verify progress updates on the journey map
- [ ] Test responsive design on mobile
- [ ] Check that locked levels remain locked
- [ ] Verify "Recommended Start" badge appears correctly

## Next Steps

1. **Connect Goals Dashboard**: Link Rise Journey tasks to user goals
2. **Achievements System**: Award badges for completing levels
3. **Wellness Journal Integration**: Show Rise Journey activities in daily journal
4. **Podcast Integration**: Recommend podcast episodes per level
5. **Analytics**: Track time spent, engagement metrics
6. **Notifications**: Remind users of daily activities

## Troubleshooting

### Issue: API endpoints returning 404
- Verify the backend routes are registered in your Flask app
- Check the blueprint is imported and registered

### Issue: Data not saving
- Check browser console for API errors
- Verify authentication cookies/tokens are being sent
- Check backend logs for errors

### Issue: Components not rendering
- Ensure Tailwind CSS is configured correctly
- Check for missing icon imports (lucide-react)
- Verify React Router is set up

## Support

For questions or issues, refer to:
- Component README: `src/components/rise/README.md`
- Backend migration: `backend-python/migrations/versions/20251204_add_rise_journey_tables.py`
- Seed data script: `backend-python/seed_rise_journey.py`

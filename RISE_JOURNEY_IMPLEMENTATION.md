# Rise Journey Implementation Guide

## Overview
The Rise Journey is a comprehensive 7-level program designed to help users track and grow in personal wellness and consciousness. Each level builds thematically, but users can start at any point based on a quiz assessment.

## Features Implemented

### 1. Quiz System
- **Location**: `src/components/rise/RiseJourneyQuiz.tsx`
- **Purpose**: Determines user's starting point in the journey
- **Questions**: 7 questions covering all journey levels
- **Scoring**: Simple algorithm that recommends the level with the lowest score (area needing most work)
- **Storage**: Quiz results saved to `rise_journey_quizzes` table

### 2. Journey Levels
- **7 Levels**:
  1. **Wellness** - Foundational Physical Health & Energy
  2. **Mobility** - Foundational Movement
  3. **Accountability** - Foundational Self-Love & Power
  4. **Creativity** - Mental Clarity & Self-Expression
  5. **Alignment** - Intentional Action & Energetic State
  6. **Mindfulness** - Deep Inner Focus & Energy Clearing
  7. **Destiny** - Higher Self Activation & Purpose

### 3. Lesson System
- **Structure**: Each level contains multiple lessons
- **Components**:
  - YouTube video embedding
  - PDF resources
  - Collaborative notes (user's own + shared community notes)
  - Task integration (connected to existing task system)
  - Progress tracking

### 4. 7-Day Free Trial
- **Tracking**: `rise_journey_trials` table
- **Activation**: Automatically starts when user completes quiz
- **Display**: Shows days remaining in the UI
- **Status**: Tracks active/inactive state

### 5. Revenue Generation
- **Product Recommendations**: Each level can have associated products
- **Display**: Shown on level cards
- **Current Products**:
  - Wellness: Rise Supplements
  - Mobility: Rise Athletic Gear
  - Accountability: Interactive Journaling App

## Database Schema

### Tables Created

1. **rise_journey_quizzes**
   - Stores user quiz answers and recommended level

2. **rise_journey_levels**
   - Journey level definitions
   - Includes revenue product recommendations

3. **rise_journey_lessons**
   - Lessons within each level
   - Contains video URLs and PDF URLs

4. **rise_journey_progress**
   - User progress through levels (locked, in-progress, completed)

5. **rise_journey_lesson_progress**
   - User progress through individual lessons

6. **rise_journey_notes**
   - User notes for lessons
   - Supports collaborative/shared notes

7. **rise_journey_trials**
   - 7-day free trial tracking per user

## API Endpoints

All endpoints require authentication (`@require_session`):

- `POST /api/rise-journey/quiz` - Submit quiz answers
- `GET /api/rise-journey/quiz` - Get user's quiz result
- `GET /api/rise-journey/trial` - Get trial status
- `GET /api/rise-journey/levels` - Get all levels with progress
- `GET /api/rise-journey/levels/<level_id>/lessons` - Get lessons for a level
- `GET /api/rise-journey/lessons/<lesson_id>/notes` - Get notes for a lesson
- `POST /api/rise-journey/lessons/<lesson_id>/notes` - Save notes
- `POST /api/rise-journey/lessons/<lesson_id>/complete` - Mark lesson complete
- `POST /api/rise-journey/levels/<level_id>/start` - Start a level

## Setup Instructions

### 1. Run Database Migration

```bash
cd backend-python
export DATABASE_URL="your_postgresql_connection_string"
python3 -m flask db upgrade
```

Or run the migration directly:
```bash
python3 migrations/versions/20251204_add_rise_journey_tables.py
```

### 2. Seed Initial Data

```bash
cd backend-python
export DATABASE_URL="your_postgresql_connection_string"
python3 seed_rise_journey.py
```

This will:
- Create all 7 journey levels
- Add sample lessons for each level
- Set up revenue product recommendations

### 3. Add Content

After seeding, you'll need to:
- Add YouTube video URLs to lessons
- Add PDF resource URLs to lessons
- Customize lesson content as needed

## Frontend Components

### Main Components

1. **RiseJourney** (`src/components/rise/RiseJourney.tsx`)
   - Main journey dashboard
   - Shows all levels with progress
   - Handles quiz display
   - Level selection and navigation

2. **RiseJourneyQuiz** (`src/components/rise/RiseJourneyQuiz.tsx`)
   - Quiz interface
   - Progress tracking
   - Answer submission

3. **RiseJourneyLesson** (`src/components/rise/RiseJourneyLesson.tsx`)
   - Lesson viewer with video and PDF
   - Notes interface (personal + shared)
   - Task creation and management
   - Lesson completion tracking

### Integration

The Rise Journey tab has been added to the Rise Dashboard:
- **Location**: `src/pages/rise.tsx`
- **Tab Index**: 5 (after Festivals)
- **Icon**: SelfImprovement icon

## Usage Flow

1. **First Visit**: User sees quiz, completes it
2. **Quiz Result**: System recommends starting level
3. **Trial Starts**: 7-day free trial automatically activated
4. **Level Selection**: User can view all levels, recommended one is highlighted
5. **Level Start**: User clicks on a level to start (unlocks it)
6. **Lesson View**: User sees list of lessons in the level
7. **Lesson Detail**: User clicks lesson to see:
   - YouTube video
   - PDF resource
   - Notes (personal + shared)
   - Task creation
   - Completion tracking

## Customization

### Adding New Lessons

Lessons can be added via the database or through a future admin interface:

```python
lesson = RiseJourneyLesson(
    id=str(uuid.uuid4()),
    level_id=level.id,
    title="Lesson Title",
    description="Lesson description",
    video_url="https://www.youtube.com/embed/VIDEO_ID",
    pdf_url="/path/to/pdf.pdf",
    order=3,
)
db.session.add(lesson)
db.session.commit()
```

### Modifying Quiz Questions

Edit `src/components/rise/RiseJourneyQuiz.tsx`:
- Modify `quizQuestions` array
- Update scoring algorithm in backend (`/api/rise-journey/quiz` endpoint)

### Adding Revenue Products

Edit level data in database:
```python
level.revenue_products = json.dumps(['Product 1', 'Product 2'])
```

## Future Enhancements

1. **Admin Interface**: For managing lessons and levels
2. **Advanced Quiz**: More sophisticated scoring algorithm
3. **Progress Analytics**: Track user engagement and completion rates
4. **Social Features**: Share progress, join study groups
5. **Certification**: Certificates for level completion
6. **Content Management**: Easy upload of videos and PDFs
7. **Mobile App**: Native mobile experience

## Notes

- The quiz scoring algorithm is simplified and can be enhanced
- Lesson content (videos/PDFs) need to be added after initial setup
- Task integration uses existing task system
- Notes support sharing but no real-time collaboration yet
- Trial tracking is automatic but doesn't enforce access restrictions yet


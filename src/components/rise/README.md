# Rise Journey Frontend Components

This directory contains the frontend implementation for the Rise Journey feature - a guided path system for personal growth through 7 consciousness levels.

## Architecture Overview

The Rise Journey frontend follows a two-view architecture:

### 1. The Path (Dashboard) - `RiseJourney.tsx`
The main journey map showing all 7 levels with progress tracking.

**Features:**
- Visual journey map with 7 level cards
- Connector lines between levels
- Lock/unlock status based on user progress
- "Recommended Start" badge from quiz results
- Progress bars for each level
- Product recommendations per level
- Trial days remaining counter
- Responsive design (mobile-friendly)

**7 Levels:**
1. **Wellness** - Physical Health & Energy (Green)
2. **Mobility** - Foundational Movement (Blue)
3. **Accountability** - Self-Love & Power (Indigo)
4. **Creativity** - Mental Clarity (Purple)
5. **Alignment** - Intentional Action (Pink)
6. **Mindfulness** - Energy Clearing (Yellow)
7. **Destiny** - Purpose Activation (Orange)

### 2. The Sanctuary (Lesson View) - `RiseJourneyLesson.tsx`
The immersive learning interface for consuming lesson content.

**Layout:**
- **LEFT (2/3 width)**: Content consumption
  - Embedded video player (YouTube/Vimeo)
  - PDF resource download bar
  
- **RIGHT (1/3 width)**: Interactive dashboard
  - **Notes Tab**: Collaborative class notes
  - **Journal Tab**: 4 Pillars reflection (Physical, Mental, Spiritual, Wellness)
  - **Tasks Tab**: Lesson-specific task checklist

**Features:**
- Dark mode theme (optimized for focus)
- Auto-saving notes and journal entries
- Task management with add/complete/delete
- "Mark Lesson Complete" button
- Responsive: stacks vertically on mobile

## Custom Hooks

### `useRiseJourney()`
Main hook for journey data and user progress.

```typescript
const {
  levels,              // Array of all 7 levels
  userProgress,        // User's progress data
  loading,             // Loading state
  error,               // Error state
  fetchLevels,         // Refresh levels
  fetchUserProgress,   // Refresh progress
  markLessonComplete   // Mark lesson as done
} = useRiseJourney();
```

### `useLessonData(lessonId)`
Hook for lesson-specific data.

```typescript
const {
  lesson,              // Lesson details
  notes,               // Lesson notes
  journalEntries,      // Journal entries
  loading,
  setNotes,
  saveNotes,
  saveJournalEntry
} = useLessonData(lessonId);
```

### `useTasks(lessonId?)`
Hook for task management.

```typescript
const {
  tasks,               // Array of tasks
  loading,
  addTask,             // Add new task
  toggleTask,          // Toggle completion
  deleteTask,          // Remove task
  refetch              // Refresh tasks
} = useTasks(lessonId);
```

## API Endpoints (To Be Implemented)

The components are ready to integrate with these backend endpoints:

### Journey & Progress
- `GET /api/rise-journey/levels` - Fetch all 7 levels
- `GET /api/rise-journey/progress` - Fetch user progress
- `GET /api/rise-journey/lessons/:lessonId` - Fetch lesson details
- `POST /api/rise-journey/lessons/:lessonId/complete` - Mark lesson complete

### Notes & Journal
- `GET /api/rise-journey/lessons/:lessonId/notes` - Fetch notes
- `POST /api/rise-journey/lessons/:lessonId/notes` - Save notes
- `GET /api/rise-journey/lessons/:lessonId/journal` - Fetch journal entries
- `POST /api/rise-journey/lessons/:lessonId/journal` - Save journal entry (with pillar)

### Tasks
- `GET /api/tasks?category=Rise Journey&lessonId=X` - Fetch lesson tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task

### User Status
- `GET /api/user/trial-status` - Get trial days remaining


## Usage

### Displaying the Journey Map

```typescript
import RiseJourney from '@/components/rise/RiseJourney';

function RisePage() {
  return <RiseJourney />;
}
```

### Displaying a Lesson

```typescript
import RiseJourneyLesson from '@/components/rise/RiseJourneyLesson';

function LessonPage() {
  const lessonData = {
    levelId: 1,
    levelName: 'Wellness',
    lessonId: 3,
    lessonTitle: 'The Morning Routine',
    videoUrl: 'https://www.youtube.com/embed/VIDEO_ID',
    pdfUrl: '/documents/lesson-3.pdf',
    pdfTitle: 'Lesson 3 Workbook.pdf'
  };

  return <RiseJourneyLesson lessonData={lessonData} />;
}
```

## Styling

Components use Tailwind CSS for styling. Key color themes:

- **Level Colors**: Each level has a unique color (green, blue, indigo, purple, pink, yellow, orange)
- **Dark Mode**: Lesson view uses gray-900, gray-800, gray-700 for focus
- **Accents**: Blue (notes), Purple (journal), Green (tasks, complete actions)

## Database Tables

The backend should have these tables (already created via migrations):

- `rise_journey_levels` - 7 consciousness levels
- `rise_journey_lessons` - Lessons within each level
- `rise_journey_resources` - Videos, PDFs, etc.
- `rise_journey_user_progress` - User's progress tracking
- `rise_journey_lesson_progress` - Individual lesson completion
- `rise_journey_notes` - User notes and journal entries (with pillar field)

## Future Enhancements

1. **Community Features**
   - Share progress with friends
   - Discussion forums per lesson
   - Group challenges

2. **Gamification**
   - Streak tracking
   - Badges and achievements
   - Leaderboards

3. **Advanced Content**
   - Interactive quizzes
   - Live sessions
   - AI-powered recommendations

4. **Analytics**
   - Time spent per lesson
   - Engagement metrics
   - Completion rates

## Support

For questions or issues, contact the development team or refer to the main project documentation.

---

## 📋 Prioritized TODO

**See [../../TODO_PRIORITIZED.md](../../TODO_PRIORITIZED.md) for the complete, prioritized task list.**

Integration checklist items above are **HIGH PRIORITY** - frontend is complete and waiting for backend connection.

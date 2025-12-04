Rise Journey Frontend Implementation Plan
Problem Statement
This is the critical missing piece - the FACE of the application. We have the data structure (skeleton) and logic (brain), but need the frontend that feels like a "guided path" rather than just a list of files. It must feel strictly organized yet spiritual and fluid.
Requirements
Display 7 journey paths (Wellness → Destiny) from database
Show "Recommended" tag based on quiz results
Embed video lessons, PDF readings, notes, and tasks
Integrate with existing goals/achievements tracking
Connect to wellness, mental, spiritual, and physical journal entries (4 Pillars)
Provide content-based guidance for members
Track daily activities within each journey
Support free trial with days remaining counter
Product recommendations per level (revenue integration)
Current State
Based on the file structure, there are existing components:
src/components/rise/RiseJourney.tsx - Main journey component
src/components/rise/RiseJourneyLesson.tsx - Lesson component
src/components/rise/RiseJourneyQuiz.tsx - Quiz component
src/pages/rise.tsx - Main Rise page
Backend migrations for journey tables completed
Journey consciousness SVG asset available
Proposed Solution
Two-View Architecture
View 1: The Path (Dashboard) - RiseJourney.tsx
A vertical/horizontal scrolling map of the 7 Levels:
Wellness - Physical Health & Energy (green)
Mobility - Foundational Movement (blue)
Accountability - Self-Love & Power (indigo)
Creativity - Mental Clarity (purple)
Alignment - Intentional Action (pink)
Mindfulness - Energy Clearing (yellow)
Destiny - Purpose Activation (orange)
Features:
Visual connector lines between levels
Lock/unlock status based on progress
"Recommended Start" badge from quiz results
Progress bars within each level card
Completion checkmarks
Trial days remaining counter (top-right)
Product recommendations per level ("Pair with: Rise [Level] Essentials")
"Enter Path" / "Review" / "Locked" button states
View 2: The Sanctuary (Lesson View) - RiseJourneyLesson.tsx
A "Focus Mode" split-screen interface:
LEFT (2/3): Content consumption
Video player (embedded YouTube/Vimeo)
PDF resource bar below video
RIGHT (1/3): Interactive dashboard with 3 tabs
Notes Tab: Collaborative class notes (textarea)
Journal Tab: 4 Pillars reflection (Physical, Mental, Spiritual, Wellness)
Tasks Tab: Lesson-specific task checklist with add/check functionality
Top bar: Lesson title + "Mark Lesson Complete" button
Dark mode theme (gray-900 background)
2. Content Components
Build specialized components for:
Video Lessons: Embedded player with progress tracking, playback controls, and completion markers
PDF Readings: PDF viewer with highlighting, bookmarking, and note-taking capabilities
Notes Section: Rich text editor for personal reflections and learnings
Tasks/Activities: Checklist interface with due dates, priority levels, and completion tracking
3. Integration Layer
Connect journey activities to:
Goals Dashboard: Link journey tasks to personal goals
Achievements System: Award badges/points for journey milestones
Wellness Journal: Connect daily activities (mental, spiritual, physical) to journey practices
Podcast Integration: Display related podcast episodes within each journey path
4. Journey Navigation
Implement:
Step-by-step guided flow within each path
Breadcrumb navigation showing current position
"Next Step" recommendations based on progress
Side panel showing overall journey map
5. Progress Tracking
Create:
Visual progress bars for each journey and overall completion
Activity calendar showing daily engagement
Milestone markers and celebration animations
Statistics dashboard (time spent, lessons completed, etc.)
6. Key Features
Responsive Design: Mobile-first approach for on-the-go learning
Offline Support: Download content for offline access
Personalization: Recommend paths based on user interests and goals
Community Features: Share progress, discuss lessons with other members
Reminder System: Notifications for daily activities and upcoming tasks
Implementation Approach
Phase 1: The Path (Dashboard) - src/components/rise/RiseJourney.tsx
Create 7-level vertical card layout with:
Level metadata (id, title, subtitle, color)
Visual connector lines between cards
Icons: CheckCircle (complete), Lock (locked), numbered circles
Progress bars within each level
Badge for "Recommended Start"
Product recommendation links (ShoppingBag icon)
Button states: "Enter Path", "Review", "Locked"
Add header with:
Page title: "Your Rise Journey"
Trial counter badge (orange gradient)
Implement lock logic:
Allow access to recommended level from quiz
Lock levels beyond current progress
Show completion status
Wire API integration:
Replace LEVELS constant with GET /api/rise-journey/levels
Fetch user progress data (completedLevels, currentLevel, recommendedLevel)
Phase 2: The Sanctuary (Lesson View) - src/components/rise/RiseJourneyLesson.tsx
Build split-screen layout:
LEFT: Video player (iframe) + PDF resource bar
RIGHT: Tabbed interface (Notes/Journal/Tasks)
Implement top action bar:
Breadcrumb: "Level X: [Name] / Lesson Y: [Title]"
"Mark Lesson Complete" button (green)
Create three tab panels:
Notes Tab: Full-height textarea for collaborative notes
Journal Tab: 4 separate textareas for Physical/Mental/Spiritual/Wellness pillars
Tasks Tab: Input field + task list with checkboxes
Apply dark theme:
bg-gray-900 base, gray-800 panels, gray-700 borders
Colored accents per tab (blue/purple/green)
Phase 3: Data Integration
Task System:
POST to existing Task API with category="Rise Journey"
Tag tasks with lessonId for tracking
Display existing tasks, allow pinning to lessons
Journal Entries:
Save to rise_journey_notes table with pillar categorization
Link to lessonId for retrieval
Show in daily journal summary
Progress Tracking:
Update lesson_progress table on "Mark Complete"
Trigger achievement checks (badges/points)
Update level completion percentages
Goals Integration:
Allow linking lesson tasks to existing goals
Show goal progress influenced by journey completion
Phase 4: Polish & Enhancement
Add animations:
Card hover effects (scale-102)
Completion celebrations (confetti/animations)
Smooth tab transitions
Responsive design:
Mobile: Stack video/tabs vertically
Tablet: Adjust split ratios
Accessibility:
Keyboard navigation
Screen reader labels
Focus states
Performance:
Lazy load videos
Cache lesson data
Optimize PDF loading
Technical Stack
React/TypeScript for components
Tailwind CSS for styling
Video.js or React Player for video embeds
React-PDF for PDF viewing
Slate.js or TipTap for rich text editing
React Query for data fetching/caching
Zustand or Context API for state management
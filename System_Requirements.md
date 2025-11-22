# System Requirements & Dashboard Feature Set

This document outlines the rephrased and organized requirements for the AI Chat Bot and Mentor Journal application, separating features into the Co-Work Dashboard (professional/venture focus) and the Rise Dashboard (mental, physical, and spiritual growth focus). It includes integration plans for principles, Gen Z workplace fixes, and highlighted code fixes.

## I. Co-Work Dashboard (Professional/Venture Focus)

The Co-Work Dashboard is designed for collaboration, task management, and venture opportunity tracking.

### A. Real-Time Collaboration Board Component

A core feature must be a real-time collaboration board panel, accessible from the Co-Work Dashboard.

- **Component Name**: WhiteBoard or CollaboratingBoard
- **Core Technology**: React component utilizing an HTML Canvas element for drawing, painting, and manipulating graphical elements.
- **Real-Time Sync**: Implement using Firebase Realtime Database for real-time synchronization, replacing initial thoughts of a custom Node.js/app.py WebSocket server.
- **Key UI/UX Features**:
  - **Presence Indicators**: Display which users are currently online, viewing, or editing the shared content to enhance the sense of shared space.
  - **Notifications and Alerts**: Inform users of important events (e.g., user joins/leaves, significant changes to shared content).
  - **Integration**: The panel must be accessible from both the Co-Work and Rise Dashboards.

### B. Task and Opportunity Management

- **Layout**: A unified layout combining tasks and a collection of dashboards, using lists, tables, and cards for displaying different item types.
- **Goal**: Serve as the primary UI for managing venture opportunities and client interactions.
- **Authentication Fix**: Resolve the useTasks hook authentication error. The backend Python server handling the tasks service must be updated to accept and validate the necessary authentication credentials (token, session, or login) as expected by the API.

### C. Financial & Analytics Integration

- **Incentives**: Award users with crypto upon Task completion. Access to the venture program is granted after 100 completed tasks.
- **Retention**: Implement a model where earnings (Crypto) for mentors increase the longer they keep their mentee active in the system.
- **Analytics**: Integrate statistics from Google Analytics for dashboard-level insights.

### D. Strategic & Operational Views

- **Strategic (Executives)**: Offer high-level insights and essential dashboard items for long-term planning and MSSP/SOC Opportunity identification.
- **Operational (Managers)**: Provide real-time data to support daily tasks and monitoring of departmental performance (Tactical view).

### E. Shared Services & Tech Stack

- **Cross-Panel Sync**: Services such as the real-time collaboration board, notifications, and focus/flow helpers must expose the same endpoints for both dashboards so that toggling between Co-Work and Rise feels seamless. Achieve this by wrapping the shared UI in a context provider (e.g., `DashboardPanelContext`) that can be injected into either shell.
- **Firebase Canvas State**: Define a Firebase Realtime Database path per `boardId` with two top-level objects: `canvasState` (strokes, shapes, backgrounds, annotations) and `presence`.
  - `canvasState` stores a compact `version` number, a minimal array of serialized actions, and optional metadata (grid, templates, layers).
  - `presence` maps `userId → { name, avatar, lastSeen, selection }` so frontend components can render user avatars and the active selection.
- **Notifications & Alerts**: Propagate Firebase Cloud Messaging topics for board events. Emit `board:event` records that include `type` (join/leave/update) and `impact` (e.g., “new opportunity added” vs “critical update”), and surface them in both dashboards via a shared `NotificationCenter` component.
- **Telemetry & Analytics**: Log all board sessions, task completions, and fulfillment milestones to Google Analytics (Measurement Protocol or gtag) together with the crypto incentive triggers. Annotate events with `userRole` (mentor/mentee) and `dashboardContext` (Co-Work/Rise) so strategic dashboards can filter by perspective.

## II. Rise Dashboard (Mental, Physical, Spiritual Growth)

The Rise Dashboard is a wellness lab designed to guide users through a path of self-improvement across mental, physical, and spiritual aspects.

### A. Core Content & Structure

- **Data Scope**: Contain all data, promises, and content related to the wellness lab, rye cycling, and the "spiritual and journey through conscious" programs.
- **Programmatic Guide**: Function as a program that guides the user through a structured path for fixing/improving these life aspects.

### B. User Growth Tracking

- **Aspect Chart**: Implement an "aspect chart," similar to video game character stats, to visualize user growth.
- **Database Design**: Plan and detail the database structure (considering the existing database and using Renderer) to incorporate:
  - **Trackable Fields of Growth**: Define fields to measure and track the progress a user achieves through the training program.
  - **Per-User Data**: Ensure each user has a unique, trackable field of growth tied to their completion of the program modules.
- **Module Completion**: Progress is tracked by entering an Activation Key at the end of a model module.

### C. Focus and Mindset Features (Mini-App Integration)

The focus and mindset features from the Co-Work Dashboard must also be available on the Rise Dashboard.

| Feature                  | Details                                                                 | Sync |
|--------------------------|-------------------------------------------------------------------------|------|
| Daily Focus Planner      | A simple planner or Pomodoro-style timer. Allows setting/tracking goals, integrating focus work blocks with built-in breaks, and a visual timer. | Must sync between both Co-Work and Rise Dashboards. |
| Focus/Blocking Modal     | An overlay that blanks out the rest of the app for timed focus work. Includes an option for users to temporarily disable notifications or block certain app parts. | - |
| Rise Mindset Journal     | Component for daily reflections, gratitude entries, or goal check-ins. | - |
| Mindset Prompts          | Prompt users with positive mindset questions (e.g., “What’s one thing I’m grateful for today?”). | - |
| Micro-Learning Cards     | Rotating affirmations, mindset tips, or focus techniques surfaced on every login or dashboard. | - |
| Mentor Cues              | Short audio or video cues from the mentor for encouragement.            | - |

### D. Progress & Accountability

- **Progress & Milestone Tracker**:
  - Visualization of progress towards weekly/monthly goals.
  - Gamification: Award badges for consistency, completed tasks, or journaling streaks.
- **Mood Tracker**:
  - Simple mood selection (emoji, sliders) at the start and end of each session.
  - Trackable Charts: Use charts to visualize mood/focus change over time, allowing users to reflect on impacting factors.
- **Accountability Partner Check-ins**:
  - Weekly check-in/chat feature for mentees to update each other or the mentor on goals and challenges.
  - Scheduled reminders for accountability touch points.

### E. Module Lifecycle & Data Ownership

- **Growth Module Catalog**: Each Rise module (e.g., “Mental Reset,” “Physical Momentum,” “Spiritual Clarity”) must be modeled as a document with `id`, `title`, `description`, `duration`, `prerequisites`, `completionCriteria`, and `activationKey`. Store these records in the wellness database so scheduling, reminders, and activation can read from a canonical source and evolve over time.
- **Activation Keys & State Machine**: Entering an activation key should transition the user from `locked → in-progress → completed` for that module. Persist state in tables that mirror the module catalog (e.g., `wellness_progress`), and trigger milestone badges/crypto incentives when thresholds are reached (modernizing the Gamification plan).
- **Aspect Chart Fields**: Track physical/mental/spiritual stats as a vector in the database: `strength`, `calm`, `clarity`, `focus`, `resilience`, etc. Normalize values (0–100) and expose them through the `wellness/aura` endpoints so the Rise Dashboard can render charts per user.
- **Mentor Signals**: Mentor cues (audio/video) should be linked to module progress and stored as `mentor_cues` entries (`id`, `moduleId`, `type`, `contentUrl`, `duration`, `transcription`). Rendering components should prefetch cues for the upcoming module to avoid playback delay.

## III. AI Agent Development Plan (Markdown Format)

Create a comprehensive plan that a downstream AI agent can read top-to-bottom to build the Real-Time Collaboration Board (WhiteBoard/CollaboratingBoard) described in Section I.

### A. Deliverables & Structure

- **Overview summary**: Introduce the purpose of the collaboration board, its relationship to the Co-Work and Rise dashboards, and the high-level goals (real-time synching, mentor/mentee presence, notification-driven alerts, cross-dashboard access).
- **Component anatomy**: Describe the React component tree (`BoardShell`, `Toolbar`, `CanvasLayer`, `PresenceSidebar`, `NotificationToast`) plus the hooks that manage Firebase connectivity and socket replays.
- **Data contracts**: Spell out the JSON schema for each Firebase collection (`boards/{boardId}/canvasState`, `boards/{boardId}/presence`, `boards/{boardId}/notifications`) and the fields required for notifications, presence, and undo/redo history.

### B. Real-Time Sync Strategy

- **Firebase Realtime Database**: Store serialized strokes, shapes, images, and annotation metadata under `canvasState` with a `sequenceId` so clients can diff by range. Use Firebase `on('child_added')`, `on('child_changed')`, and `on('child_removed')` listeners to keep canvases in sync.
- **Presence indicators**: Update `presence/{userId}` entries every 10 seconds (or on mousemove) with `status`, `cursorPosition`, and `selection`. Provide fallback data (`idle` state) when activity is absent for >45 seconds.
- **Notifications & alerts**: Maintain a `notifications` list of the most recent 20 events (new collaborator, milestone, critical edit). Each notification should include `type`, `message`, `author`, `timestamp`, and `impact`. The AI plan must specify how to display these notifications on both dashboards and how to surface them in the timeline.
- **Conflict resolution**: Provide policies for handling concurrent edits, e.g., last-write-wins for strokes but first-write-wins for board metadata, plus undo/redo via a simple command stack persisted alongside `canvasState`.

### C. Integration & Access

- **Authentication wrap**: Document how the board verifies the logged-in session before reading/writing Firebase (include Firebase security rules referencing `auth.uid`), plus how to fall back to the backend when Firebase is unavailable.
- **Embedding hooks**: Describe the `useBoardContext(boardId)` hook, its returned state (`canvasState`, `presence`, `notifications`, `isConnected`), and the actions it exposes (`addStroke`, `clearBoard`, `broadcastNotification`, `togglePresenceStatus`).
- **Panel access**: Detail how both dashboards mount the component via a shared route or modal, how the `boardId` propagates from the Co-Work dashboard's task/opportunity list and from the Rise dashboard's growth module, and how to persist the last open board per user.

### D. Acceptance Criteria

- Board loads within 2 seconds with cached canvas actions when a previously visited board is reopened.
- Presence indicators accurately report active users and ghost cursors for at least the last 30 seconds of activity.
- Notifications surface important events and are saved so late joiners can read the last 20 notices.
- The Firebase connection gracefully fails over to the backend `/api/board/snapshot` endpoint (if implemented) without crashing the UI.

## IV. Shared Data Contracts & API Definitions

The dashboards rely on backend Flask endpoints, Socket.IO events, and Firebase documents. This section clarifies each contract so the frontend and AI assistant know what to implement.

- **Tasks API (`/api/tasks`)**:
  - `GET`: Returns `{'tasks': Task[]}` with fields `id`, `title`, `description`, `hyperlinks`, `status`, `createdAt`, `updatedAt`. Expect `hyperlinks` to come back as an array parsed from JSON stored in the database.
  - `POST`: Accepts `{ title, description?, hyperlinks?, status? }`. Responds with `{'task': Task}`. The backend validates `title` (not empty) before persisting.
  - `PUT /api/tasks/:id`: Updates `title`, `description`, `hyperlinks`, `status`. Emit a `task_updated` Socket.IO event on success.
  - `DELETE /api/tasks/:id`: Removes a task and emits `task_deleted`.

- **Socket.IO events**:
  - `task_created` → payload: new `Task`.
  - `task_updated` → payload: updated `Task`.
  - `task_deleted` → payload: `{ id }`.
  - The frontend should keep the socket connection alive on the dashboards, gracefully reconnect, and respect the backend’s `CORS` policy (`supports_credentials=True`).

- **Wellness endpoints** (Rise):
  - `/api/wellness/aura` (`GET`/`PUT`): Returns aura values for the current user, each with `auraType`, `value`.
  - `wellness/goals`, `wellness/activity`, and `wellness/achievements`: Follow the same pattern—each response returns `id`, `userId`, timestamps, and JSON-serializable details so the dashboards can render histories and progress.
  - Activation keys for modules can be verified via a future `/api/wellness/activate` endpoint that transitions the module state machine and awards badges/crypto incentives.

- **Firebase Realtime Database structure**:
  - `boards/{boardId}/canvasState/` stores `actions` array, `version`, `lastUpdated`, and optional `ownerId`.
  - `boards/{boardId}/presence/{userId}` stores `name`, `avatar`, `status`, `cursor`, `lastHeartbeat`.
  - `boards/{boardId}/notifications/{notificationId}` stores `type`, `message`, `severity`, `timestamp`, `actor`.
  - Security rules should match `auth.uid === data.child('presence').key` and restrict writes to known board participants.

## Integration of Principles and Gen Z Fixes

To ensure the dashboard design incorporates your principles and addresses the Gen Z workplace issues, I have integrated relevant feature mappings.

| Principle/Gen Z Issue                          | Dashboard Component/Feature from the Plan | Integration/Fix |
|------------------------------------------------|-------------------------------------------|-----------------|
| Family / Spiritual                             | Rise Dashboard (Mental, Physical, Spiritual Growth) | The entire Rise Dashboard (Section II) is dedicated to these principles, including the Rise Mindset Journal and Mindset Prompts. |
| Gaming / Battle Games                          | User Growth Tracking (Aspect Chart)       | The "aspect chart, similar to video game character stats" (II.B) gamifies self-improvement. Gamification (Badges) (II.D) further incorporates a gaming element. |
| Together Events                                | Real-Time Collaboration Board             | The Presence Indicators and the nature of the board (I.A) facilitate "together events" or shared work experiences. |
| Cyber / System Ai / Computer Networking / Robots | Strategic & Operational Views            | Strategic view (I.D) explicitly targets MSSP/SOC Opportunity identification, directly aligning with Cyber/Networking. The plan for an AI Agent Development (III) for the WhiteBoard lays the groundwork for System AI integration. |
| Media Distro                                   | (Requires new feature)                    | The platform for work and growth (Co-Work and Rise) serves as a distribution channel for content (e.g., Micro-Learning Cards). |
| Gen Z questions workplace norms (Flexibility/Balance/Inclusion) | Rise Dashboard, Focus/Blocking Modal, Daily Focus Planner | The split into Co-Work (Professional) and Rise (Wellness) natively promotes work-life balance. The Focus/Blocking Modal (II.C) supports mental health and focused work. |
| Gen Z wants mentorship (Guidance)              | Accountability Partner Check-ins, Mentor Cues | Structured Accountability Partner Check-ins (II.D) and Mentor Cues (II.C) provide the frequent, structured guidance/mentorship Gen Z seeks. |
| Gen Z wants frequent, meaningful feedback      | Progress & Milestone Tracker, Financial Incentives | Gamification/Badges (II.D) and awarding crypto upon Task completion (I.C) provide immediate, quantifiable, and "meaningful" (tied to value) feedback. |
| Gen Z cares about social values                | Financial & Analytics Integration (Retention Model) | The retention model where mentor earnings increase the longer they keep their mentee active (I.C) incentivizes a positive, value-aligned outcome: long-term engagement and success for others. |

## 5. Required Code Fixes Highlighted

- **Backend task persistence (`backend-python/app.py`)**: Lock down `/api/tasks` CRUD handlers so they only respond to authenticated users (`session.get('user')`) and include the user’s `id`/`role` on emitted Socket.IO events. Add telemetry hooks for tracking the `completedTasksCount` per mentor/mentee pair so the crypto incentive logic can run after 100 completions.
- **Blinker for real-time board snapshots**: Introduce a `/api/boards/{boardId}/snapshot` endpoint and a `/api/boards/{boardId}/presence` helper so the server can offer a fallback when Firebase is unreachable. Emit `board_snapshot_ready` events through Socket.IO for clients that fail to connect to Firebase quickly.
- **Task hook UX (`src/hooks/useTasks.ts` + `src/components/dashboard/DocsPanel.tsx`)**: Continue surfacing the “Authentication required” sentinel but pair it with a `useAuthRedirect` helper that suggests re-login. Extend the hook to expose `refresh`, `isStale`, and `lastUpdated` so the UI can show offline indicators and avoid creating duplicate tasks while syncing.
- **Analytics & retention signals (`src/utils/backendUrl.ts`, `src/components/dashboard`)**: Tie dashboard actions (task completion, focus sessions, badge awards) to Google Analytics events that include `userRole`, `dashboardContext`, and `cryptoRewardStatus`. Hook mentor retention metrics (longer mentee engagement) to Firestore/GTM for later dashboards.

## 6. Authentication Fix

The `useTasks` hook currently surfaces “Authentication required” in the UI because the backend rejects anonymous requests. To resolve this:

1. **Server-side lock**: Wrap the `/api/tasks` endpoints with a `require_session` decorator that checks `session.get('user')`. If the session is missing or expired, return `401` with `'Authentication required'` so the frontend can reuse its existing error handling.
2. **Frontend resilience**: In `useTasks`, catch `401` responses explicitly, tag them as `{ authRequired: true }`, and cancel any pending retries. Pass that flag up to components like `DocsPanel` so buttons/inputs stay disabled until the user re-authenticates.
3. **Credential propagation**: Keep using `fetchWithErrorHandling` (which already sets `credentials: 'include'`), but ensure every call sends the same headers as the auth endpoints. Mirror the backend session lifetime in the frontend by refreshing tasks when the user returns from a login flow.
4. **Signal for mentors**: Once the session is restored, emit a Socket.IO `auth_restored` event so dashboards can rehydrate sockets and re-fetch the latest tasks. This also ensures mentoring/crypto incentives resume without manual refreshes.

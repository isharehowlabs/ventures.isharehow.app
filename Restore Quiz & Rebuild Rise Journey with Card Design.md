# Problem Statement
The Rise Journey component needs to be rebuilt with:
1. Quiz component restored and integrated for member journey assessment
2. Card-based design instead of current panel layout
3. All 7 paths with their own built-out subpanels
4. lucide-react dependency installed (DONE)
# Current State
* RiseJourney.tsx exists but uses panel layout without quiz integration
* RiseJourneyQuiz.tsx exists (created Dec 4 02:30) but not integrated
* RiseJourneyLesson.tsx exists with focus mode lesson view
* lucide-react now installed
# Proposed Changes
## 1. Review Existing Quiz Component
Examine RiseJourneyQuiz.tsx to understand its current implementation and assessment logic
## 2. Redesign RiseJourney.tsx with Card Layout
* Replace panel-based layout with card-based design
* Each of the 7 levels should be displayed as a card
* Cards should show: level title, description, progress, lock status, CTA button
* Integrate quiz component at the top for initial assessment
* Add subpanel navigation for each path
## 3. Create Subpanel Components for All 7 Paths
Create dedicated subpanel/detail components for each path:
* Level 1: Wellness Journey
* Level 2: Mobility Journey  
* Level 3: Accountability Journey
* Level 4: Creativity Journey
* Level 5: Alignment Journey
* Level 6: Mindfulness Journey
* Level 7: Destiny Journey
Each subpanel should include:
* Lessons list with progress tracking
* Tasks integration (4 pillars: Wellness, Mental, Spiritual, Physical)
* Journal feature
* Navigation back to main journey view
## 4. Update Quiz Integration Logic
* Quiz should appear for new users or when "Retake Assessment" is clicked
* Quiz results determine recommended starting level
* After quiz completion, show main journey cards with recommended level highlighted
## 5. Test Build
Run build command to verify all changes compile correctly
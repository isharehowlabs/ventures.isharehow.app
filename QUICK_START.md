# Rise Journey - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- ✅ Node.js installed
- ✅ React app already set up
- ✅ Tailwind CSS configured
- ✅ React Router installed

### Step 1: Verify Files Are in Place

```bash
# Check components exist
ls -la src/components/rise/

# Expected files:
# - RiseJourney.tsx
# - RiseJourneyLesson.tsx
# - RiseJourneyQuiz.tsx
# - README.md

# Check hooks exist
ls -la src/hooks/useRiseJourney.ts
```

### Step 2: Install Required Dependencies

```bash
# Install icon library
npm install lucide-react

# Or if using yarn
yarn add lucide-react
```

### Step 3: Add Routes to Your App

Edit your main routing file (e.g., `App.tsx` or `routes.tsx`):

```typescript
import RiseJourney from './components/rise/RiseJourney';
import RiseJourneyLesson from './components/rise/RiseJourneyLesson';

// Add these routes:
const routes = [
  // ... your existing routes
  {
    path: '/rise',
    element: <RiseJourney />
  },
  {
    path: '/rise/test-lesson',
    element: <RiseJourneyLesson />
  }
];
```

### Step 4: Test The Path (Dashboard)

1. Start your dev server:
```bash
npm run dev
# or
yarn dev
```

2. Navigate to: `http://localhost:3000/rise`

3. You should see:
   - ✓ 7-level journey cards
   - ✓ Connector lines
   - ✓ Trial counter (top-right)
   - ✓ Progress bars
   - ✓ Hover effects

### Step 5: Test The Sanctuary (Lesson View)

Navigate to: `http://localhost:3000/rise/test-lesson`

You should see:
- ✓ Split-screen layout
- ✓ Video player (left)
- ✓ 3-tab interface (right)
- ✓ Notes, Journal, Tasks tabs
- ✓ Dark mode theme

### Step 6: Create Mock API Endpoints (Testing Only)

Create a temporary mock API file for testing:

```typescript
// src/api/mockRiseJourney.ts

export const mockAPI = {
  getLevels: async () => {
    return [
      { id: 1, title: 'Wellness', subtitle: 'Physical Health', order_index: 1 },
      { id: 2, title: 'Mobility', subtitle: 'Foundational Movement', order_index: 2 },
      // ... more levels
    ];
  },
  
  getUserProgress: async () => {
    return {
      recommendedLevel: 2,
      completedLevels: [1],
      currentLevel: 2,
      levelProgress: { 1: 100, 2: 45 }
    };
  }
};
```

Temporarily modify hooks to use mock data:

```typescript
// In src/hooks/useRiseJourney.ts
// Replace fetch calls with:
const data = await mockAPI.getLevels();
```

### Step 7: Navigate & Interact

Try these interactions:

1. **On Journey Map:**
   - Hover over level cards (should scale up)
   - Click "Enter Path" button
   - Observe locked levels (should be grayed out)

2. **On Lesson View:**
   - Switch between Notes/Journal/Tasks tabs
   - Type in the notes textarea
   - Add journal entries in all 4 pillars
   - Create a new task
   - Check/uncheck tasks

## 🔧 Troubleshooting

### Icons Not Showing
```bash
# Reinstall lucide-react
npm install lucide-react --force
```

### Tailwind Classes Not Working
Make sure `tailwind.config.js` includes the components path:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  // ...
}
```

### TypeScript Errors
```bash
# Install type definitions
npm install --save-dev @types/react @types/react-router-dom
```

### Components Not Found
Check import paths match your project structure:

```typescript
// Adjust these as needed:
import RiseJourney from '@/components/rise/RiseJourney';
// or
import RiseJourney from './components/rise/RiseJourney';
```

## 📝 Next Steps After Testing

Once components are rendering correctly:

1. **Remove Mock Data**
   - Delete mockAPI.ts
   - Restore original fetch calls in hooks

2. **Implement Backend APIs**
   - Follow `RISE_JOURNEY_INTEGRATION_GUIDE.md`
   - Create Flask/Express endpoints
   - Test with real database

3. **Add Production Routes**
   - Create RiseLevelView wrapper
   - Create RiseLessonView wrapper
   - Add proper navigation

4. **Test with Real Data**
   - Seed database with 7 levels
   - Create test lessons
   - Test complete user flow

## 🎨 Customization

### Change Colors
Edit the LEVELS array in `RiseJourney.tsx`:

```typescript
const LEVELS = [
  { 
    id: 1, 
    title: 'Wellness',
    color: 'bg-green-500',      // ← Change this
    borderColor: 'border-green-500',
    textColor: 'text-green-500'
  },
  // ...
];
```

### Change Video Size
Edit `RiseJourneyLesson.tsx`:

```typescript
// Change width ratio:
<div className="w-full md:w-2/3">  {/* ← Adjust here */}
```

### Disable Auto-Save
Comment out auto-save calls in hooks:

```typescript
// const saveNotes = async (content: string) => {
//   // ... save logic
// };
```

## 📱 Mobile Testing

Test responsive design:

```bash
# Use browser dev tools
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select iPhone or Android device
4. Test navigation and interactions
```

Expected mobile behavior:
- Journey cards stack vertically
- Lesson view switches to vertical layout
- Touch-friendly button sizes
- Readable text at small sizes

## ✅ Success Criteria

You've successfully set up Rise Journey if:

- [x] `/rise` loads without errors
- [x] 7 level cards are visible
- [x] Lesson view shows video and tabs
- [x] Can switch between tabs
- [x] Hover effects work
- [x] Responsive on mobile

## 🆘 Need Help?

Check these resources:

1. **Component Docs**: `src/components/rise/README.md`
2. **Integration Guide**: `RISE_JOURNEY_INTEGRATION_GUIDE.md`
3. **Architecture**: `RISE_JOURNEY_ARCHITECTURE.md`
4. **Checklist**: `RISE_JOURNEY_CHECKLIST.md`

## 🎉 You're Ready!

Once basic functionality is confirmed, proceed to backend integration following the `RISE_JOURNEY_INTEGRATION_GUIDE.md`.

Welcome to the Rise Journey! 🚀✨

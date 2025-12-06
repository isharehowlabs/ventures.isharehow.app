# LookUp.Cafe - Multiplayer Game Platform

## Overview
LookUp.Cafe is a realtime multiplayer game platform similar to Jackbox Party Pack, built for ventures.isharehow.app. It supports up to 16 concurrent players and offers three game types: Guessing Games, Drawing Games, and Puzzle Games.

## Features
- **Free Tier Access**: No authentication required to play
- **Optional Login**: Users can log in to display their account name and avatar
- **Realtime Multiplayer**: WebSocket-based communication via Socket.IO
- **Room System**: 6-character room codes for easy joining
- **Three Game Types**:
  1. **Guessing Games**: One player gives clues, others guess
  2. **Drawing Games**: Draw and guess with realtime canvas synchronization
  3. **Puzzle Games**: Collaborative riddle solving

## Architecture

### Frontend (Next.js + React)
- **Main Page**: `/lookupcafe` - Game lobby and room management
- **Components**:
  - `GameLobby.tsx` - Room creation/joining interface
  - `GameRoom.tsx` - Game container with player list and game selection
  - `GuessingGame.tsx` - Guessing game mechanics
  - `DrawingGame.tsx` - Drawing canvas with realtime sync
  - `PuzzleGame.tsx` - Collaborative puzzle solving
- **Hook**: `useGameSocket.ts` - Socket.IO connection and game state management
- **Types**: `game.ts` - TypeScript definitions for game data structures

### Backend (Flask + Socket.IO)
Located in `backend-python/app.py` (appended handlers):
- `game:create-room` - Create new game room with unique code
- `game:join-room` - Join existing room (max 16 players)
- `game:leave-room` - Leave room and reassign host if needed
- `game:start-game` - Begin game (host only)
- `game:submit-answer` - Submit guesses/answers
- `game:draw` - Broadcast drawing strokes
- `game:clear-canvas` - Clear canvas for all players

### Navigation
Added to left sidebar under "Live Stream":
- Icon: 🎮 (SportsEsports/GamesIcon)
- Label: "LookUp.Cafe"
- Route: `/lookupcafe`
- Auth Required: No (free tier)

## Usage

### For Players
1. Navigate to `/lookupcafe` on ventures.isharehow.app
2. Choose "Create Room" or "Join Room"
3. Enter your name (auto-filled if logged in)
4. Share the 6-character room code with friends
5. Host selects game type and starts the game
6. Play and compete for the highest score!

### For Developers
**Start Development Server:**
```bash
cd /home/ishaglcy/public_html/ventures.isharehow.app
npm run dev
```

**Build and Deploy:**
```bash
npm run build
# Files are automatically copied to web root
```

**Backend Server:**
The Flask backend must be running for realtime features:
```bash
cd backend-python
python app.py
```

## Game Types

### 1. Guessing Games
- 60 seconds per round
- One player gives clues (text/verbal)
- Other players submit guesses
- Points awarded for correct answers
- Rotation system for clue-giver

### 2. Drawing Games
- 90 seconds per round
- One player draws on canvas
- Canvas synchronized in realtime
- Other players guess what's being drawn
- Points for speed and accuracy
- Tools: 8 colors, pen, clear

### 3. Puzzle Games
- 120 seconds per round
- Collaborative riddle solving
- All players work together
- Hints available
- Team-based scoring

## Technical Details

### Socket.IO Events
**Client → Server:**
- `game:create-room` - Create room
- `game:join-room` - Join with code
- `game:leave-room` - Exit room
- `game:start-game` - Start (host)
- `game:submit-answer` - Submit guess
- `game:draw` - Send stroke data
- `game:clear-canvas` - Clear drawing

**Server → Client:**
- `game:room-created` - Room created
- `game:room-joined` - Successfully joined
- `game:player-joined` - New player joined
- `game:player-left` - Player disconnected
- `game:started` - Game started
- `game:round-start` - New round
- `game:round-end` - Round results
- `game:drawing-update` - Canvas update
- `game:canvas-cleared` - Canvas cleared
- `game:error` - Error message

### Data Structures
```typescript
interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  isActive: boolean;
  avatar?: string;
  userId?: string;
}

interface GameRoom {
  roomCode: string;
  hostId: string;
  players: Player[];
  gameType: 'guessing' | 'drawing' | 'puzzle' | null;
  state: 'lobby' | 'playing' | 'roundEnd' | 'gameEnd';
  currentRound: number;
  maxRounds: number;
  currentDrawerId?: string;
  currentWord?: string;
  roundStartTime?: number;
}
```


## Files Created/Modified

### New Files
- `src/types/game.ts`
- `src/hooks/useGameSocket.ts`
- `src/pages/lookupcafe.tsx`
- `src/components/lookupcafe/GameLobby.tsx`
- `src/components/lookupcafe/GameRoom.tsx`
- `src/components/lookupcafe/GuessingGame.tsx`
- `src/components/lookupcafe/DrawingGame.tsx`
- `src/components/lookupcafe/PuzzleGame.tsx`

### Modified Files
- `src/components/Navigation.tsx` - Added LookUp.Cafe nav item
- `backend-python/app.py` - Added game Socket.IO handlers

## Support
For issues or questions, contact the development team or create an issue in the repository.

---
Built with ❤️ for family game nights at ventures.isharehow.app

---

## 📋 Prioritized TODO

**See [TODO_PRIORITIZED.md](TODO_PRIORITIZED.md) for the complete, prioritized task list.**

Future enhancements listed above are **LOW PRIORITY** - focus on testing and MVP stability first.

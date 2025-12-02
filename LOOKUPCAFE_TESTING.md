# LookUp.Cafe Testing Guide

## Quick Start Testing

### 1. Access the Application
Navigate to: `https://ventures.isharehow.app/lookupcafe`

### 2. Test Room Creation
1. Click "Create Room"
2. Enter a name (or use your logged-in username)
3. Click "Create Room"
4. Copy the 6-character room code displayed

### 3. Test Joining (Multi-Window)
1. Open a second browser window/tab (or use different device)
2. Go to the same URL
3. Click "Join Room"
4. Enter a different name
5. Paste the room code
6. Click "Join Room"
7. Verify both players appear in the room

### 4. Test Game Types

#### Drawing Game
1. Host selects "Drawing" game type
2. Click "Start Game"
3. One player gets canvas to draw
4. Other players see the drawing in realtime
5. Try different colors and tools
6. Guessers submit their answers
7. Test the "Clear" button

#### Guessing Game
1. Host selects "Guessing" game type
2. Click "Start Game"
3. Observe 60-second timer
4. Submit guesses
5. Check score updates

#### Puzzle Game
1. Host selects "Puzzle" game type
2. Click "Start Game"
3. Read the riddle
4. Submit answers
5. Check team scoring

### 5. Test Player Management
- Add more players (up to 16)
- Have a player leave
- Verify host migration when host leaves
- Test full room (16 players) rejection

### 6. Test Socket Connection
- Check browser console for connection messages
- Verify realtime updates across windows
- Test reconnection after brief disconnect
- Check error messages for invalid room codes

## Known Limitations (For Production)

### Current Implementation
- Rooms stored in-memory (lost on server restart)
- Basic word list for drawing game
- No persistent leaderboards
- No chat functionality
- Limited puzzle variety

### Recommended for Testing
1. **Backend Server**: Ensure Flask backend is running at `https://api.ventures.isharehow.app`
2. **Socket.IO**: Check connection status in browser dev tools
3. **Network Tab**: Monitor WebSocket messages
4. **Multiple Devices**: Test with phones, tablets, and desktops
5. **Different Browsers**: Chrome, Firefox, Safari, Edge

## Testing Checklist

### Functionality
- [ ] Room creation generates unique code
- [ ] Room joining works with valid code
- [ ] Invalid room code shows error
- [ ] Room full (16 players) rejection
- [ ] Player list updates in realtime
- [ ] Host can start game
- [ ] Non-host cannot start game
- [ ] Timer counts down correctly
- [ ] Drawing syncs across all players
- [ ] Answers submitted successfully
- [ ] Scores update correctly
- [ ] Game end shows final results
- [ ] Leave room works properly
- [ ] Host migration works

### UI/UX
- [ ] Navigation shows LookUp.Cafe
- [ ] Icons display correctly
- [ ] Colors match theme
- [ ] Responsive on mobile
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success feedback shown
- [ ] Buttons disabled appropriately

### Performance
- [ ] Low latency drawing
- [ ] Smooth timer animation
- [ ] No lag with 16 players
- [ ] Canvas renders smoothly
- [ ] Quick room switching

## Troubleshooting

### "Connection failed"
- Check backend server status
- Verify CORS settings
- Check browser console for errors
- Try refreshing the page

### "Room not found"
- Verify room code is correct (6 characters)
- Room may have expired (server restart)
- Case-sensitive: codes are uppercase

### Drawing not syncing
- Check Socket.IO connection
- Verify you're the current drawer
- Try clearing and redrawing
- Check network latency

### Timer issues
- Refresh page to resync
- Check system time
- Server time may differ from client

## Next Steps for Production

1. **Add Redis** for persistent room storage
2. **Implement word database** for drawing game
3. **Add chat system** for player communication
4. **Create leaderboards** for competitive play
5. **Add more game types** (trivia, word games, etc.)
6. **Mobile app** for better mobile experience
7. **Voice chat** integration
8. **Analytics** for game metrics

## Support
For bugs or issues, check browser console and network tab, then contact the development team with:
- Browser version
- Error messages
- Steps to reproduce
- Number of players in room

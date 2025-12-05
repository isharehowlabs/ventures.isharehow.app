# Debugging Theme Issues

## What Changed

### 1. ThemeContext.tsx
- Added extensive console logging to track theme state
- Fixed theme initialization to happen on mount
- Ensured DOM updates happen synchronously with theme changes

### 2. isharehowTheme.ts
- **CRITICAL FIX**: Changed CssBaseline to set background color on `html` element using `data-theme` attribute
- Body now inherits background from html, preventing MUI from overriding

### 3. _document.tsx
- Inline script sets `data-theme` attribute before React hydrates
- This should now match what ThemeContext expects

## How to Debug

### Open Browser Console
When you load the page, you should see console logs like:

```
[ThemeContext] Initial mode from localStorage: system
[ThemeContext] Resolved mode: dark from mode: system systemPref: dark
[ThemeContext] Component mounted, mode: system resolvedMode: dark
[ThemeContext] Updating DOM theme to: dark
```

### Check These Values:

1. **localStorage value**:
   ```javascript
   localStorage.getItem('themeMode')
   ```
   Should be: `"light"`, `"dark"`, or `"system"`

2. **HTML attributes**:
   ```javascript
   document.documentElement.getAttribute('data-theme')
   document.documentElement.className
   ```
   Should show: `data-theme="dark"` and class includes `"dark-mode"`

3. **System preference**:
   ```javascript
   window.matchMedia('(prefers-color-scheme: dark)').matches
   ```
   Should be: `true` if your OS is in dark mode

### What to Look For

#### If pages have mixed themes:
- Check console logs for theme value inconsistencies
- Look for the "Updating DOM theme to:" message
- Verify the `data-theme` attribute on `<html>` element

#### If theme doesn't persist:
- Check if localStorage.setItem is working
- Look for "Failed to save theme preference" errors

#### If system preference doesn't work:
- Check "System preference changed to:" messages
- Verify mode is set to "system" in localStorage

## Force Clear and Reset

If issues persist, try this in console:

```javascript
// Clear theme preference
localStorage.removeItem('themeMode');

// Force reload
location.reload();
```

Then manually set your preferred theme using the toggle button.

## Known Fixed Issues

✅ MUI CssBaseline no longer overrides background color  
✅ Theme is now set on html element via CSS  
✅ Body inherits from html element  
✅ DOM updates happen before render (no flash)  
✅ Extensive logging for debugging  

## If Still Broken

Check these in console:
1. Are there any JavaScript errors preventing ThemeContext from loading?
2. Is the `getInitialTheme()` function in the HTML running?
3. Do the console logs appear at all?

Share the console output and I can help diagnose further.

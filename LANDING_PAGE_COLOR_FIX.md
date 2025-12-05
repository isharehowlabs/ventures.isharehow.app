# Landing Page Color Issue - Diagnosis & Fix

## The Problem
On fresh visit to the landing page, colors appeared "weird" and random - not using proper light or dark mode colors.

## Root Cause
**Multiple conflicting color sources:**

1. **Inline styles in _document.tsx**: Was setting `body.style.backgroundColor` directly
2. **MUI CssBaseline**: Trying to set body background via theme
3. **CSS Modules**: Had default colors (#FFFFFF) with `:global([data-theme="dark"])` overrides
4. **Timing issue**: CSS modules would load with light defaults before `data-theme` attribute was set

This created a cascade of conflicts:
- Inline script sets body to dark
- CSS modules still show light backgrounds
- MUI tries to apply theme
- Result: mixed/random colors

## The Fix

### 1. Removed Inline Body Styles (_document.tsx)
- Script now ONLY sets `data-theme` attribute
- No more direct DOM style manipulation
- Lets CSS handle all styling

### 2. Added CSS Variables (index.css)
- Defined global CSS variables: `--bg-default`, `--bg-paper`, `--text-primary`, etc.
- Set on `:root` as fallback (light theme)
- Override in `html[data-theme="dark"]` and `html[data-theme="light"]`
- Background colors set on `html` element, body inherits

### 3. Kept CSS Modules As-Is
- CSS modules already use `:global([data-theme="dark"])` correctly
- Now work properly because `data-theme` is set before they load

### 4. MUI Theme Uses CSS Inheritance
- Body background set to `inherit` in theme
- HTML element controls the background via CSS
- MUI respects this and doesn't override

## How It Works Now

```
1. Browser parses HTML
2. Inline script runs IMMEDIATELY (before any CSS):
   - Reads localStorage or system preference
   - Sets data-theme="dark" or data-theme="light" on <html>
   - Logs to console: "[_document] Initial theme: dark"

3. CSS loads and applies:
   - html[data-theme="dark"] { background-color: #0f172a; color: #f7fafc; }
   - CSS modules see data-theme and apply correct colors
   - CSS variables are set

4. React hydrates:
   - ThemeContext initializes with same theme
   - MUI CssBaseline applies (but body inherits from html, so no conflict)
   - Everything matches!
```

## Testing

### Open Browser Console
You should see:
```
[_document] Initial theme: dark
[_document] Theme initialized, data-theme: dark
[ThemeContext] Initial mode from localStorage: system
[ThemeContext] Resolved mode: dark from mode: system systemPref: dark
[ThemeContext] Component mounted, mode: system resolvedMode: dark
```

### Check HTML Element
```javascript
// In console:
document.documentElement.getAttribute('data-theme')
// Should be: "dark" or "light"

window.getComputedStyle(document.documentElement).backgroundColor
// Should be: "rgb(15, 23, 42)" for dark or "rgb(255, 255, 255)" for light
```

### Visual Check
- Landing page should have consistent colors immediately
- No flash of wrong colors
- All text should be readable
- Background should be solid color (not mixed)

## If Still Broken

1. **Hard refresh** (Ctrl+Shift+R) to clear cache
2. **Check console** for any errors
3. **Verify data-theme** is set: `document.documentElement.getAttribute('data-theme')`
4. **Check if inline script ran**: Look for "[_document]" logs
5. **Clear localStorage** if needed: `localStorage.clear(); location.reload();`

## Technical Details

### CSS Cascade Priority (Highest to Lowest):
1. Inline styles (removed ✓)
2. CSS specificity  (all use same specificity now)
3. Source order (all sources now agree)

### Theme Initialization Order:
1. _document.tsx inline script (sets data-theme)
2. CSS loads (uses data-theme selectors)
3. React hydrates
4. ThemeContext initializes (matches data-theme)
5. MUI applies theme (inherits from html)

Everything now works in harmony!

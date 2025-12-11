# Dark Vertical Shell - Color Scheme Reference

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (#0a0e1a) - Short 56px                             │
│  Logo | Search | Timer | Notifications | Theme | User      │
└─────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────┐
│              │                                              │
│  SIDEBAR     │  CONTENT AREA                                │
│  (#151b2e)   │  (Light: #f5f5f5 / Dark: #0f172a)          │
│              │                                              │
│  Navigation  │  Dynamic content with theme support         │
│  - Home      │                                              │
│  - Demo      │  This area changes based on:                │
│  - Portfolio │  - User's theme preference (light/dark)     │
│  - Blog      │  - Current page content                     │
│  - About     │                                              │
│  - Live      │                                              │
│  - RISE      │                                              │
│  - CRM       │                                              │
│  ...         │                                              │
│              │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## Color Values

### Shell (Fixed - Always Dark)

| Element | Color | Usage |
|---------|-------|-------|
| Header Background | `#0a0e1a` | Top navigation bar |
| Sidebar Background | `#151b2e` | Left navigation menu |
| Border | `#1e293b` | Dividers, separators |
| Text Primary | `#f7fafc` | Main text, icons |
| Text Secondary | `#cbd5e0` | Secondary text, inactive items |
| Hover State | `rgba(255, 255, 255, 0.08)` | Buttons, menu items on hover |
| Active/Selected | `rgba(144, 202, 249, 0.16)` | Active navigation item |

### Content Area (Theme-Aware)

#### Dark Theme
| Element | Color |
|---------|-------|
| Background Default | `#0f172a` |
| Background Paper | `#1e293b` |
| Text Primary | `#f7fafc` |
| Text Secondary | `#cbd5e0` |
| Divider | `#334155` |

#### Light Theme
| Element | Color |
|---------|-------|
| Background Default | `#f5f5f5` |
| Background Paper | `#FFFFFF` |
| Text Primary | `#212529` |
| Text Secondary | `#6c757d` |
| Divider | `#dee2e6` |

## Contrast Hierarchy

```
Darkest → Lightest (Dark Mode)
─────────────────────────────────
#0a0e1a (Header)
#151b2e (Sidebar)
#1e293b (Content Paper)
#0f172a (Content Default)
```

## Key Features

✓ **No Color Flipping**: Shell always uses `#0a0e1a` and `#151b2e`  
✓ **Short Header**: 56px height for modern, compact design  
✓ **Visual Separation**: Clear distinction between shell and content  
✓ **Theme Support**: Content area respects user's light/dark preference  
✓ **Consistent Borders**: All shell borders use `#1e293b`  
✓ **Accessible Text**: High contrast ratios on dark backgrounds  

## CSS Variables

```css
:root {
  --shell-bg-dark: #0a0e1a;
  --shell-sidebar-dark: #151b2e;
  --shell-header-height: 56px;
  --shell-text-primary: #f7fafc;
  --shell-text-secondary: #cbd5e0;
  --shell-border: #1e293b;
  --shell-hover: rgba(255, 255, 255, 0.08);
  --shell-active: rgba(144, 202, 249, 0.16);
}
```

## Usage in Components

### AppShell
```typescript
import { SHELL_COLORS } from '../isharehowTheme';

// Header
backgroundColor: SHELL_COLORS.header

// Sidebar
backgroundColor: SHELL_COLORS.sidebar

// Borders
border: `1px solid ${SHELL_COLORS.border}`
```

### Navigation
```typescript
// Text colors
color: SHELL_COLORS.textPrimary
color: SHELL_COLORS.textSecondary
```

# Bug Fix: Malformed HTML in Blog Posts

## Issue
Blog posts containing YouTube embeds had malformed HTML where `<div>` and `<iframe>` elements were incorrectly placed inside `href` attributes of `<a>` tags. This caused invalid HTML structure that could break page layouts.

### Example of Malformed HTML
```html
<a href="<div style='...'><iframe src='https://youtube.com/embed/...'></iframe></div>">
```

## Root Cause
The `cleanMalformedHtml()` function in `src/lib/blog.ts` had an ineffective regex pattern that failed to match and sanitize complex nested HTML structures within href attributes.

**Original Pattern:**
```regex
/<a\\s+[^>]*href=[\"']([^\"']*<[^>]*>[\\s\\S]*?)[\"'][^>]*>([\\s\\S]*?)<\\/a>/gi
```

The pattern `[^\"']*` stopped at the first character that wasn't a quote, but didn't properly handle escaped quotes or complex nested structures.

## Solution

### 1. Updated `src/lib/blog.ts`
Rewrote the `cleanMalformedHtml()` function with more robust regex patterns:

```typescript
// New pattern matches href with any HTML content
const anchorPattern = /<a\s+[^>]*?href\s*=\s*["'](<[\s\S]*?)["'][^>]*?>([\s\S]*?)<\/a>/gi;
```

This pattern:
- Uses `[\s\S]*?` for non-greedy matching of any content including newlines
- Properly captures nested HTML structures
- Extracts YouTube video IDs and creates clean iframe embeds
- Removes malformed tags or preserves valid content

### 2. Fixed Existing Static Files
Ran cleanup scripts to fix all existing generated files:
- **111 JSON files** in `_next/data/**/blog/`
- **2 HTML files** in `blog/*/index.html`

All malformed `href` attributes were replaced with properly formatted YouTube iframe embeds.

## Verification

### Blog JSON Files
- Scanned: 1,453 files
- Malformed: 0 ✓

### Blog HTML Files  
- Scanned: 19 files
- Malformed: 0 ✓

### Specific Posts Verified
✓ `creating-jobs-in-property-care-for-disadvantaged-communities`
✓ `unlock-your-voice-lead-the-revolution`

Both now have valid YouTube iframe embeds instead of malformed anchor tags.

## Files Modified
- `src/lib/blog.ts` - Updated `cleanMalformedHtml()` function
- `_next/data/**/blog/*.json` - 111 files cleaned
- `blog/**/index.html` - 2 files cleaned

## Testing
- ✓ TypeScript compilation successful
- ✓ Next.js build completed without errors
- ✓ All static exports regenerated

## Prevention
The fix in `src/lib/blog.ts` prevents this issue from occurring in future blog posts fetched from WordPress, as the `embedYouTubeVideos()` function now properly sanitizes content before it's rendered.

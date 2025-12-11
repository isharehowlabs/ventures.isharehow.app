# YouTube Video Embedding for Blog Posts

## Overview
Implemented automatic YouTube video embedding for blog posts. When a YouTube URL is detected in blog content, it is automatically converted to a responsive embedded video player.

## Implementation Details

### Function: `embedYouTubeVideos()`
**Location:** `src/lib/blog.ts`

The function handles multiple YouTube URL formats:
- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short form: `https://youtu.be/VIDEO_ID`  
- Embed URLs: `https://youtube.com/embed/VIDEO_ID`
- Links in anchor tags: `<a href="...youtube.com/...">...</a>`

### Features
- **Responsive Design**: Video player adapts to container width with 16:9 aspect ratio
- **Lazy Loading**: Videos load only when needed for better performance
- **Multiple Videos**: Handles multiple YouTube URLs in a single blog post
- **Safe Replacement**: Preserves non-YouTube content unchanged

### Integration
The function is automatically applied to all blog post content in the `transformWordPressPost()` function, processing content from WordPress before rendering.

## Usage
No additional code needed! Simply paste a YouTube URL in your WordPress blog post:

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

Or use a short URL:
```
https://youtu.be/dQw4w9WgXcQ
```

The URL will automatically be converted to an embedded video player when the blog post is displayed.

## Technical Details
- Video IDs are extracted using regex patterns
- Creates responsive iframe with 56.25% padding (16:9 ratio)
- Includes YouTube privacy and feature controls
- Supports both HTTP and HTTPS protocols
- Handles URLs with or without `www.` prefix

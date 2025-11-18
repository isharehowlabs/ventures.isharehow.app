# PWA Setup Instructions

## Icon Requirements

The PWA requires the following icon files in the `/public` directory:

1. **icon-192.png** - 192x192 pixels (required)
2. **icon-512.png** - 512x512 pixels (required)

### Creating Icons

You can create these icons from your logo using:
- Online tools: https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
- Design tools: Figma, Photoshop, etc.

The icons should:
- Be square (same width and height)
- Have a transparent or solid background
- Represent your brand/logo clearly
- Be optimized for web (PNG format)

### Quick Icon Generation

If you have a logo file, you can use ImageMagick or online tools to resize:

```bash
# Using ImageMagick (if installed)
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

## Testing PWA

1. **Chrome DevTools**:
   - Open DevTools → Application tab
   - Check "Manifest" section
   - Test "Service Workers" section
   - Use "Lighthouse" to audit PWA features

2. **Mobile Testing**:
   - Android: Visit site → Browser menu → "Add to Home Screen"
   - iOS: Visit site → Share button → "Add to Home Screen"

3. **Install Prompt**:
   - The install button will appear automatically on supported browsers
   - It respects user dismissals (won't show again for 7 days)

## Features Included

✅ Web App Manifest
✅ Service Worker (basic offline support)
✅ Install prompt button
✅ iOS/Android meta tags
✅ Theme color configuration
✅ App shortcuts

## Next Steps

1. Add the icon files (icon-192.png and icon-512.png) to `/public`
2. Rebuild the app: `npm run build`
3. Test the PWA installation on mobile devices
4. Optionally customize the service worker for more advanced caching


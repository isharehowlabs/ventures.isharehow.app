# PWA Setup Checklist

## ✅ Already Completed

1. ✅ Created `public/manifest.json` - Web app manifest
2. ✅ Created `public/sw.js` - Service worker
3. ✅ Created `src/components/PWAInstallButton.tsx` - Install button component
4. ✅ Updated `src/pages/_app.tsx` - Added PWA meta tags and manifest link
5. ✅ Service worker registration in install button component

## ⚠️ Required: Add Icon Files

**You MUST add these icon files to `/public` directory:**

1. **`/public/icon-192.png`** - 192x192 pixels (required)
2. **`/public/icon-512.png`** - 512x512 pixels (required)

### How to Create Icons

**Option 1: Use Online Tools**
- Visit https://realfavicongenerator.net/
- Upload your logo
- Download the generated icons
- Extract `android-chrome-192x192.png` and `android-chrome-512x512.png`
- Rename and place in `/public/`:
  - `icon-192.png`
  - `icon-512.png`

**Option 2: Use PWA Builder**
- Visit https://www.pwabuilder.com/imageGenerator
- Upload your logo
- Download the generated icons

**Option 3: Create Manually**
- Use any image editor (Figma, Photoshop, GIMP, etc.)
- Create square images: 192x192 and 512x512 pixels
- Export as PNG
- Place in `/public/` directory

### Quick Test Icons (Temporary)

If you need to test immediately, you can create simple colored squares:

```bash
# Using ImageMagick (if installed)
convert -size 192x192 xc:#ff6b6b /public/icon-192.png
convert -size 512x512 xc:#ff6b6b /public/icon-512.png
```

Or use any online tool to create simple colored square images.

## 🔧 Build Process

Next.js static export automatically copies files from `/public` to the root during build:

```bash
npm run build
```

This will:
1. Build the Next.js app
2. Copy `/public/*` files to root (including manifest.json, sw.js, icons)
3. The files will be accessible at `/manifest.json`, `/sw.js`, `/icon-192.png`, etc.

## ✅ Verification Steps

After adding icons and rebuilding:

1. **Check Files Exist:**
   ```bash
   ls -la public/icon-*.png
   ```

2. **Build the App:**
   ```bash
   npm run build
   ```

3. **Verify in Browser:**
   - Open DevTools → Application tab
   - Check "Manifest" section (should show no errors)
   - Check "Service Workers" section (should show registered)
   - Check icons are loaded

4. **Test Installation:**
   - Visit the site on mobile or desktop
   - The install button should appear (if browser supports it)
   - Click to install

## 🌐 HTTPS Requirement

**Important:** Service workers require HTTPS (except localhost)

- ✅ Production: `https://ventures.isharehow.app` - Already HTTPS
- ✅ Development: `http://localhost:3000` - Works for testing

## 📱 Browser Support

- ✅ **Chrome/Edge (Android/Desktop)**: Full support with install prompt
- ✅ **Safari (iOS)**: Manual install via Share → Add to Home Screen
- ✅ **Firefox**: Full support
- ⚠️ **Safari (macOS)**: Limited support

## 🐛 Troubleshooting

### Service Worker Not Registering

1. Check browser console for errors
2. Verify `/sw.js` is accessible: `https://ventures.isharehow.app/sw.js`
3. Check HTTPS is enabled
4. Clear browser cache and try again

### Install Button Not Showing

1. Check if app is already installed
2. Check browser supports PWA (Chrome, Edge, Firefox)
3. Verify manifest.json is valid (check DevTools → Application → Manifest)
4. Check icons exist and are accessible

### Icons Not Loading

1. Verify icon files exist in `/public`
2. Rebuild the app: `npm run build`
3. Check icon paths in manifest.json are correct (`/icon-192.png`, `/icon-512.png`)
4. Verify icons are accessible: `https://ventures.isharehow.app/icon-192.png`

## 📝 Next Steps

1. **Add icon files** to `/public/` directory
2. **Rebuild**: `npm run build`
3. **Test** on mobile device
4. **Deploy** to production

Once icons are added, the PWA will be fully functional!


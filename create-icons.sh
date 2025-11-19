#!/bin/bash
# Simple script to create placeholder PWA icons
# This script uses ImageMagick if available, otherwise provides instructions

echo "Creating PWA icons..."

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to create icons..."
    
    # Create 192x192 icon
    convert -size 192x192 xc:none \
        -fill "linear-gradient(45deg, #ff6b6b, #4ecdc4)" \
        -draw "rectangle 0,0 192,192" \
        -fill white \
        -font Arial-Bold \
        -pointsize 48 \
        -gravity center \
        -annotate +0+0 "iSH" \
        public/icon-192.png
    
    # Create 512x512 icon
    convert -size 512x512 xc:none \
        -fill "linear-gradient(45deg, #ff6b6b, #4ecdc4)" \
        -draw "rectangle 0,0 512,512" \
        -fill white \
        -font Arial-Bold \
        -pointsize 128 \
        -gravity center \
        -annotate +0+0 "iSH" \
        public/icon-512.png
    
    echo "✅ Icons created successfully!"
    echo "Files: public/icon-192.png and public/icon-512.png"
else
    echo "⚠️  ImageMagick not found. Please use one of these options:"
    echo ""
    echo "Option 1: Use the HTML generator (easiest)"
    echo "  1. Open create-pwa-icons.html in your browser"
    echo "  2. Click 'Generate Icons'"
    echo "  3. Download both icons"
    echo "  4. Save them to the /public directory"
    echo ""
    echo "Option 2: Install ImageMagick and run this script again"
    echo "  sudo apt-get install imagemagick  # Ubuntu/Debian"
    echo "  brew install imagemagick          # macOS"
    echo ""
    echo "Option 3: Use an online tool"
    echo "  - https://realfavicongenerator.net/"
    echo "  - https://www.pwabuilder.com/imageGenerator"
fi




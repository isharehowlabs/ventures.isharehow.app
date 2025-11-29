#!/bin/bash

# CodeQL Database Cleanup Script
# Removes CodeQL databases and related temporary files to free up space

set -e

echo "🧹 Starting CodeQL database cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track total space freed
SPACE_FREED=0

# Function to calculate directory size
get_size() {
    if [ -d "$1" ] || [ -f "$1" ]; then
        du -sb "$1" 2>/dev/null | cut -f1 || echo "0"
    else
        echo "0"
    fi
}

# Function to remove directory/file and track space
remove_and_track() {
    if [ -e "$1" ]; then
        SIZE=$(get_size "$1")
        SPACE_FREED=$((SPACE_FREED + SIZE))
        echo -e "${YELLOW}Removing:${NC} $1"
        rm -rf "$1"
        echo -e "${GREEN}✓ Removed${NC}"
    fi
}

# CodeQL database directories
echo ""
echo "📦 Cleaning up CodeQL databases..."

# Common CodeQL database locations
remove_and_track "codeql-database"
remove_and_track ".codeql"
remove_and_track "codeql-databases"
remove_and_track ".codeql-databases"

# Find and remove any CodeQL databases
find . -type d -name "*codeql*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read -r dir; do
    if [[ "$dir" != *"node_modules"* ]] && [[ "$dir" != *".git"* ]]; then
        remove_and_track "$dir"
    fi
done

# Remove CodeQL database files
find . -type f -name "*.db" -path "*codeql*" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read -r file; do
    remove_and_track "$file"
done

# Clean up other temporary files
echo ""
echo "🗑️  Cleaning up temporary files..."

# Next.js build cache (optional - uncomment if needed)
# remove_and_track ".next/cache"

# TypeScript build info
remove_and_track "tsconfig.tsbuildinfo"

# Python cache
find . -type d -name "__pycache__" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read -r dir; do
    remove_and_track "$dir"
done

find . -type f -name "*.pyc" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | while read -r file; do
    remove_and_track "$file"
done

# Calculate and display space freed
SPACE_MB=$((SPACE_FREED / 1024 / 1024))
SPACE_KB=$((SPACE_FREED / 1024))

echo ""
if [ $SPACE_FREED -gt 1048576 ]; then
    echo -e "${GREEN}✓ Cleanup complete! Freed approximately ${SPACE_MB} MB${NC}"
elif [ $SPACE_FREED -gt 1024 ]; then
    echo -e "${GREEN}✓ Cleanup complete! Freed approximately ${SPACE_KB} KB${NC}"
else
    echo -e "${GREEN}✓ Cleanup complete! No CodeQL databases found to remove${NC}"
fi

echo ""
echo "💡 Tip: Run 'npm run build' to regenerate build files if needed"
echo ""


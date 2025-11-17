#!/bin/bash

# Build and Commit Script (Auto - Non-interactive)
# This script builds the project and commits changes to git automatically
# Use this for CI/CD or when you want to skip the push confirmation

set -e  # Exit on error

echo "🚀 Starting automated build and commit process..."

# Run the build
echo "📦 Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting commit."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo "📝 No changes to commit. Build completed with no new changes."
    exit 0
fi

# Show status
echo ""
echo "📋 Git status:"
git status --short

# Get commit message (use provided message or auto-generate)
COMMIT_MSG="${1:-Build: Update production files $(date +'%Y-%m-%d %H:%M:%S')}"

# Stage all changes
echo ""
echo "📝 Staging changes..."
git add -A

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully!"
    echo "📝 Commit message: $COMMIT_MSG"
    
    # Auto-push if provided as second argument
    if [ "$2" = "push" ]; then
        echo "📤 Pushing to remote..."
        git push
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to remote!"
        else
            echo "❌ Push failed. You can push manually later with: git push"
            exit 1
        fi
    else
        echo "📌 Commit created. Push manually with: git push"
        echo "💡 Tip: Use './build-and-commit-auto.sh \"message\" push' to auto-push"
    fi
else
    echo "❌ Commit failed!"
    exit 1
fi

echo ""
echo "🎉 Automated build and commit process completed!"


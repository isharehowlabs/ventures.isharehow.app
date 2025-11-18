#!/bin/bash

# Build and Commit Script
# This script builds the project and commits changes to git
# Usage: ./build-and-commit.sh [commit message] [-y|--yes]
#   -y or --yes: Automatically push without prompting

set -e  # Exit on error

# Parse arguments
AUTO_PUSH=false
COMMIT_MSG=""

for arg in "$@"; do
    case $arg in
        -y|--yes)
            AUTO_PUSH=true
            shift
            ;;
        *)
            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="$arg"
            fi
            ;;
    esac
done

echo "🚀 Starting build process..."

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
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Build: Update production files $(date +'%Y-%m-%d %H:%M:%S')"
fi

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
    
    # Push logic
    if [ "$AUTO_PUSH" = true ]; then
        echo ""
        echo "📤 Pushing to remote (auto-push enabled)..."
        git push
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to remote!"
        else
            echo "❌ Push failed. You can push manually later with: git push"
            exit 1
        fi
    else
        # Ask if user wants to push
        echo ""
        read -p "🚀 Push to remote? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "📤 Pushing to remote..."
            git push
            if [ $? -eq 0 ]; then
                echo "✅ Successfully pushed to remote!"
            else
                echo "❌ Push failed. You can push manually later with: git push"
            fi
        else
            echo "📌 Commit created. Push manually with: git push"
        fi
    fi
else
    echo "❌ Commit failed!"
    exit 1
fi

echo ""
echo "🎉 Build and commit process completed!"


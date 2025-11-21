#!/bin/bash

# Test script for wellness API endpoints
# This assumes backend is running and user is authenticated

BACKEND_URL="${1:-http://localhost:5000}"

echo "Testing Wellness API Endpoints at $BACKEND_URL"
echo "=============================================="
echo ""

echo "1. Testing GET /api/wellness/achievements/available (no auth required)"
curl -s "$BACKEND_URL/api/wellness/achievements/available" | python3 -m json.tool | head -20
echo ""
echo "=============================================="
echo ""

echo "Note: Other endpoints require authentication via Patreon OAuth"
echo "To test authenticated endpoints:"
echo "  1. Login via https://ventures.isharehow.app"
echo "  2. Use browser dev tools to get session cookie"
echo "  3. Pass cookie with: curl -H 'Cookie: session=...' $BACKEND_URL/api/wellness/aura"
echo ""


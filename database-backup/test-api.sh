#!/bin/bash

# Test Database Backup API
# ========================

echo "🧪 Testing Database Backup API..."

# Check if the Next.js server is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Next.js server is not running on port 3001"
    echo "   Please start the server with: npm run dev"
    exit 1
fi

echo "✅ Next.js server is running"

# Test GET endpoint (check backup system status)
echo "📡 Testing backup system status..."
curl -s -X GET http://localhost:3001/api/admin/database-backup | jq . || echo "API response (raw):"

echo ""
echo "📋 Test completed!"
echo ""
echo "To test the full backup from admin panel:"
echo "1. Visit http://localhost:3001/admin"
echo "2. Go to 'System' tab"
echo "3. Look for 'Database Backup' section"
echo "4. Click 'Simple Backup' or 'Advanced Backup' button"

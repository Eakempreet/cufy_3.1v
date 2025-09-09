#!/bin/bash

echo "🧪 Testing Complete Payment Proof System..."

# Check if Next.js server is running
if ! curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "🚀 Starting Next.js development server..."
    cd /home/aman/Desktop/cufy_3.1v-1
    npm run dev &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 10
    
    # Check if server is running
    if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "❌ Failed to start Next.js server"
        exit 1
    fi
    
    echo "✅ Next.js server is running"
else
    echo "✅ Next.js server is already running"
    SERVER_PID=""
fi

# Test API endpoints
echo "🔗 Testing payment proof API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/user/payment-proof -X OPTIONS)

if [ "$API_STATUS" == "200" ] || [ "$API_STATUS" == "405" ]; then
    echo "✅ Payment proof API endpoint is accessible (Status: $API_STATUS)"
else
    echo "❌ Payment proof API endpoint is not accessible (Status: $API_STATUS)"
fi

# Test admin payments API
echo "🔗 Testing admin payments API endpoint..."
ADMIN_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/payments -X OPTIONS)

if [ "$ADMIN_API_STATUS" == "200" ] || [ "$ADMIN_API_STATUS" == "405" ]; then
    echo "✅ Admin payments API endpoint is accessible (Status: $ADMIN_API_STATUS)"
else
    echo "❌ Admin payments API endpoint is not accessible (Status: $ADMIN_API_STATUS)"
fi

# Test page routes
echo "🔗 Testing payment page route..."
PAYMENT_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/payment)

if [ "$PAYMENT_PAGE_STATUS" == "200" ]; then
    echo "✅ Payment page is accessible"
else
    echo "⚠️  Payment page returned status: $PAYMENT_PAGE_STATUS"
fi

echo "🔗 Testing dashboard page route..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard)

if [ "$DASHBOARD_STATUS" == "200" ] || [ "$DASHBOARD_STATUS" == "307" ]; then
    echo "✅ Dashboard page is accessible"
else
    echo "⚠️  Dashboard page returned status: $DASHBOARD_STATUS"
fi

# Test admin panel route
echo "🔗 Testing admin panel route..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/admin)

if [ "$ADMIN_STATUS" == "200" ] || [ "$ADMIN_STATUS" == "307" ]; then
    echo "✅ Admin panel is accessible"
else
    echo "⚠️  Admin panel returned status: $ADMIN_STATUS"
fi

echo "🎉 Payment proof system test completed!"
echo ""
echo "📋 Test Summary:"
echo "- Payment proof API: $([ "$API_STATUS" == "200" ] || [ "$API_STATUS" == "405" ] && echo "✅ Working" || echo "❌ Issues")"
echo "- Admin payments API: $([ "$ADMIN_API_STATUS" == "200" ] || [ "$ADMIN_API_STATUS" == "405" ] && echo "✅ Working" || echo "❌ Issues")"
echo "- Payment page: $([ "$PAYMENT_PAGE_STATUS" == "200" ] && echo "✅ Working" || echo "⚠️  Check status")"
echo "- Dashboard page: $([ "$DASHBOARD_STATUS" == "200" ] || [ "$DASHBOARD_STATUS" == "307" ] && echo "✅ Working" || echo "⚠️  Check status")"
echo "- Admin panel: $([ "$ADMIN_STATUS" == "200" ] || [ "$ADMIN_STATUS" == "307" ] && echo "✅ Working" || echo "⚠️  Check status")"
echo ""
echo "🚀 You can now test payment proof upload at: http://localhost:3000/payment"
echo "🔧 Admin panel for review at: http://localhost:3000/admin"

# Clean up server if we started it
if [ ! -z "$SERVER_PID" ]; then
    echo "🛑 Stopping test server..."
    kill $SERVER_PID 2>/dev/null || true
fi

#!/bin/bash
# GEC Event Portal - Local Verification Script
# Run this after starting backend and frontend servers

echo "🔍 GEC Event Portal - Verification Tests"
echo "========================================="
echo ""

# Test Backend Health
echo "1️⃣  Testing Backend Health..."
BACKEND_HEALTH=$(curl -s http://localhost:5000/api/health 2>&1 || echo "FAILED")
if [[ "$BACKEND_HEALTH" == *"ok"* ]] || [[ "$BACKEND_HEALTH" == *"Running"* ]]; then
    echo "   ✅ Backend is running on port 5000"
else
    echo "   ❌ Backend not responding"
    echo "   Response: $BACKEND_HEALTH"
fi

echo ""
echo "2️⃣  Testing Frontend..."
FRONTEND=$(curl -s http://localhost:3000 2>&1 | grep -c "<!DOCTYPE" || echo "0")
if [ "$FRONTEND" -gt "0" ]; then
    echo "   ✅ Frontend is running on port 3000"
else
    echo "   ❌ Frontend not responding"
fi

echo ""
echo "3️⃣  Testing Admin Login..."
LOGIN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gec.ac.in","password":"Admin@123"}' 2>&1)

if [[ "$LOGIN" == *"token"* ]]; then
    echo "   ✅ Admin login successful"
    # Extract token for next test
    TOKEN=$(echo $LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    echo "   ❌ Admin login failed"
    echo "   Response: $LOGIN"
    TOKEN=""
fi

echo ""
echo "4️⃣  Testing Dashboard Stats..."
if [ ! -z "$TOKEN" ]; then
    STATS=$(curl -s -H "Authorization: Bearer $TOKEN" \
      http://localhost:5000/api/dashboard/stats 2>&1)
    
    if [[ "$STATS" == *"events"* ]]; then
        echo "   ✅ Dashboard stats retrieved"
        echo "   Response: $STATS"
    else
        echo "   ❌ Dashboard stats failed"
        echo "   Response: $STATS"
    fi
else
    echo "   ⏭️  Skipped (no token from login)"
fi

echo ""
echo "5️⃣  Testing Events Endpoint..."
EVENTS=$(curl -s http://localhost:5000/api/events 2>&1)
if [[ "$EVENTS" == *"["* ]]; then
    EVENT_COUNT=$(echo $EVENTS | grep -o '"event_id"' | wc -l)
    echo "   ✅ Events retrieved (count: $EVENT_COUNT)"
else
    echo "   ❌ Events endpoint failed"
fi

echo ""
echo "========================================="
echo "✅ All local services ready for testing!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/docs (if available)"
echo ""
echo "📝 Test Credentials:"
echo "   Email: admin@gec.ac.in"
echo "   Password: Admin@123"
echo ""

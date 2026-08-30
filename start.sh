#!/bin/bash

# Startup script for Loyalty Program

echo "Starting Loyalty Program..."

# Start backend
echo "Starting backend server..."
cd loyalty-program/backend
nohup node src/server.js > server.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 3

# Check if backend is running
if curl -s http://localhost:5000/health > /dev/null; then
  echo "Backend is running on http://localhost:5000"
else
  echo "Backend failed to start. Check server.log for details."
  exit 1
fi

# Start frontend
echo "Starting frontend server..."
cd ../frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Wait for frontend to be ready
sleep 3

echo ""
echo "Loyalty Program is running!"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000"
echo ""
echo "To stop the servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo "Or use: pkill -f 'node src/server.js' && pkill -f 'vite'"
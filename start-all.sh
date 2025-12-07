#!/bin/bash

# Start both frontend and backend servers
echo "Starting Alama Abacus Application..."

# Get the directory where this script is located
SCRIPT_DIR="$(dirname "$0")"

# Start backend in background
echo "Starting Backend..."
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 2

# Start frontend in background
echo "Starting Frontend..."
cd "$SCRIPT_DIR/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "Alama Abacus is starting..."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop both servers"

# Handle Ctrl+C to kill both processes
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

# Wait for both processes
wait

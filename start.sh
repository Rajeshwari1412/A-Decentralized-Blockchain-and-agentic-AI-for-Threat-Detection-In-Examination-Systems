#!/bin/bash
echo "======================================================================"
echo "ExamSentinel AI: Decentralized Blockchain and Agentic AI SOC Framework"
echo "======================================================================"

# Start backend
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Systems launched. Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID"
echo "Frontend SOC: http://localhost:5173"
echo "Backend Docs: http://localhost:8000/docs"

wait

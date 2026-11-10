@echo off
echo ======================================================================
echo ExamSentinel AI: Decentralized Blockchain and Agentic AI SOC Framework
echo ======================================================================

echo Starting Python FastAPI Backend on http://localhost:8000 ...
start "ExamSentinel Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting React + Vite SOC Frontend on http://localhost:5173 ...
start "ExamSentinel Frontend" cmd /k "cd frontend && npm run dev"

echo ======================================================================
echo System successfully launched!
echo - SOC Frontend UI: http://localhost:5173
echo - FastAPI Swagger Docs: http://localhost:8000/docs
echo - WebSocket Telemetry: ws://localhost:8000/api/v1/ws
echo ======================================================================

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.exams import router as exams_router
from app.api.v1.activities import router as activities_router
from app.api.v1.ml_threats import router as ml_router
from app.api.v1.agents import router as agents_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.blockchain import router as blockchain_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.ws import router as ws_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(exams_router)
api_router.include_router(activities_router)
api_router.include_router(ml_router)
api_router.include_router(agents_router)
api_router.include_router(incidents_router)
api_router.include_router(blockchain_router)
api_router.include_router(simulation_router)
api_router.include_router(dashboard_router)
api_router.include_router(ws_router)

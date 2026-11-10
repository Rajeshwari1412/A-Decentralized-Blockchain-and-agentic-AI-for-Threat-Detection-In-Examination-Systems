from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.router import api_router
from app.services.simulator_service import SimulatorService
from app.ml.isolation_forest_detector import detector
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing ExamSentinel AI Database Schema...")
    Base.metadata.create_all(bind=engine)
    
    # Pre-seed dataset if DB is fresh
    db = SessionLocal()
    try:
        SimulatorService.seed_synthetic_dataset(db)
        logger.info("ExamSentinel baseline entities seeded.")
    except Exception as e:
        logger.warning(f"Seed note: {e}")
    finally:
        db.close()

    # Pre-warm ML Isolation Forest
    try:
        detector._load_or_train()
        logger.info("ML Threat Detection Engine online.")
    except Exception as e:
        logger.warning(f"ML init note: {e}")

    yield
    logger.info("ExamSentinel AI shutting down.")

app = FastAPI(
    title="ExamSentinel AI API",
    description="A Decentralized Blockchain and Agentic AI Framework for Proactive Insider Threat Detection in Examination Systems",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": "ExamSentinel AI",
        "description": "Decentralized Blockchain & Multi-Agent Framework for Exam Cybersecurity",
        "version": "1.0.0",
        "status": "OPERATIONAL",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

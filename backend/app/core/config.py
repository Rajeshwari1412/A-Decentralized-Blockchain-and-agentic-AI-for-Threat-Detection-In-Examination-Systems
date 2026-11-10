import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ExamSentinel AI"
    ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # JWT Auth
    SECRET_KEY: str = "examsentinel-super-secret-production-grade-jwt-key-change-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Database (PostgreSQL with SQLite fallback)
    DATABASE_URL: str = "sqlite:///./examsentinel.db"
    
    # Blockchain
    BLOCKCHAIN_RPC_URL: str = "http://127.0.0.1:8545"
    BLOCKCHAIN_CHAIN_ID: int = 31337
    BLOCKCHAIN_CONTRACT_ADDRESS: str = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    BLOCKCHAIN_PRIVATE_KEY: str = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
    ENABLE_MOCK_BLOCKCHAIN_FALLBACK: bool = True
    
    # Threat & Anomaly Scoring Parameters
    ISOLATION_FOREST_CONTAMINATION: float = 0.08
    RISK_SCORE_THRESHOLD_LOW: float = 30.0
    RISK_SCORE_THRESHOLD_MEDIUM: float = 60.0
    RISK_SCORE_THRESHOLD_HIGH: float = 80.0
    AUTO_ALERT_THRESHOLD: float = 65.0
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

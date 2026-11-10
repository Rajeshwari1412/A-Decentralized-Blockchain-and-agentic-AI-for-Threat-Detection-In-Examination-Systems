from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.simulator_service import SimulatorService

router = APIRouter(prefix="/simulation", tags=["Threat Simulator"])

@router.get("/scenarios")
def get_scenario_catalog():
    return SimulatorService.SCENARIO_STEPS

@router.post("/seed")
def seed_dataset(db: Session = Depends(get_db)):
    return SimulatorService.seed_synthetic_dataset(db)

@router.post("/step/{step_number}")
async def execute_scenario_step(
    step_number: int,
    db: Session = Depends(get_db)
):
    try:
        res = await SimulatorService.run_scenario_step(db, step_number=step_number)
        return res
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/run-all")
async def run_full_threat_scenario(db: Session = Depends(get_db)):
    """
    Executes the entire 7-step progressive threat scenario in sequence.
    """
    results = []
    for step in range(1, len(SimulatorService.SCENARIO_STEPS) + 1):
        step_res = await SimulatorService.run_scenario_step(db, step_number=step)
        results.append(step_res)
    return {
        "success": True,
        "total_steps_executed": len(results),
        "scenario_results": results
    }

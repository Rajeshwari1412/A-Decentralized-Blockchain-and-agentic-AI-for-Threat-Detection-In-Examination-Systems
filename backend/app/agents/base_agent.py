from abc import ABC, abstractmethod
import time
from typing import Dict, Any
from app.models import AgentRun
from app.core.database import SessionLocal
import logging

logger = logging.getLogger(__name__)

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name

    async def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        try:
            result = await self.process(context)
            duration_ms = (time.time() - start_time) * 1000.0
            
            # Log run to DB
            self._log_run(
                status=result.get("agent_status", "SUCCESS"),
                trigger_event=context.get("event", {}).get("event_type", "GENERIC_EVENT"),
                input_summary=str(result.get("input_summary", "Processed context")),
                output_summary=str(result.get("output_summary", "Agent finished successfully")),
                confidence=result.get("confidence", 0.95),
                duration_ms=duration_ms
            )
            return result
        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000.0
            logger.error(f"Agent {self.name} failed: {e}", exc_info=True)
            self._log_run(
                status="FAILED",
                trigger_event=context.get("event", {}).get("event_type", "ERROR"),
                input_summary=str(context.get("event", {})),
                output_summary=f"Error: {str(e)}",
                confidence=0.0,
                duration_ms=duration_ms
            )
            raise e

    @abstractmethod
    async def process(self, context: Dict[str, Any]) -> Dict[str, Any]:
        pass

    def _log_run(self, status: str, trigger_event: str, input_summary: str, output_summary: str, confidence: float, duration_ms: float):
        try:
            db = SessionLocal()
            run = AgentRun(
                agent_name=self.name,
                status=status,
                trigger_event=trigger_event,
                input_summary=input_summary[:500],
                output_summary=output_summary[:500],
                confidence_score=confidence,
                execution_time_ms=round(duration_ms, 2)
            )
            db.add(run)
            db.commit()
            db.close()
        except Exception as e:
            logger.warning(f"Could not log agent run: {e}")

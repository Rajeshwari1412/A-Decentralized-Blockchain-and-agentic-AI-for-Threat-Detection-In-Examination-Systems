from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.websocket_manager import ws_manager
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket Real-Time Stream"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and receive ping/heartbeats
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"type":"PONG"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception: {e}")
        ws_manager.disconnect(websocket)

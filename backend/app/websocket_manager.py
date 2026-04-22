from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect
from datetime import datetime
import asyncio
import random
import json
import anyio

websocket_router = APIRouter()
# Use dict keyed by id() so we don't rely on WebSocket hashability across versions.
_audit_connections: dict[int, WebSocket] = {}


async def _broadcast_audit_event(payload: dict):
    dead: list[int] = []
    for ws_id, ws in list(_audit_connections.items()):
        try:
            await ws.send_json(payload)
        except Exception:
            dead.append(ws_id)
    for ws_id in dead:
        _audit_connections.pop(ws_id, None)


def publish_audit_event(payload: dict):
    """
    Safe to call from sync routes (threadpool). Uses AnyIO to hop into
    the main event loop and broadcast to connected WebSocket clients.
    """
    try:
        anyio.from_thread.run(_broadcast_audit_event, payload)
    except Exception:
        # No running loop or server not started yet.
        return

@websocket_router.websocket("/ws/energy")
async def energy_socket(websocket: WebSocket):
    """WebSocket for live energy updates"""
    await websocket.accept()
    
    try:
        while True:
            data = {
                "active_sessions": random.randint(10, 30),
                "current_load_kw": round(random.uniform(150, 350), 2),
                "energy_consumed_today": round(random.uniform(2000, 5000), 2),
                "timestamp": str(asyncio.get_event_loop().time())
            }
            await websocket.send_json(data)
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@websocket_router.websocket("/ws/live-stats")
async def live_stats_socket(websocket: WebSocket):
    """WebSocket for live platform statistics"""
    await websocket.accept()
    
    try:
        while True:
            data = {
                "active_users": random.randint(100, 500),
                "active_bookings": random.randint(20, 60),
                "stations_operational": 25,
                "average_wait_time": random.randint(5, 25),
                "customer_satisfaction": round(random.uniform(4.5, 5.0), 1)
            }
            await websocket.send_json(data)
            await asyncio.sleep(3)
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()


@websocket_router.websocket("/ws/audit")
async def audit_socket(websocket: WebSocket):
    """WebSocket for live audit events (admin monitoring)."""
    await websocket.accept()
    _audit_connections[id(websocket)] = websocket
    # Immediate handshake message so clients can confirm WS works.
    try:
        await websocket.send_json(
            {"type": "connected", "timestamp": datetime.utcnow().isoformat()}
        )
    except Exception:
        pass
    try:
        while True:
            # Keep connection open; client can send ping.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"Audit WebSocket error: {e}")
    finally:
        _audit_connections.pop(id(websocket), None)
        try:
            await websocket.close()
        except Exception:
            pass

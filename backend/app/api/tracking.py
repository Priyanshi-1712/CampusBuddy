from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# Dictionary to store active ride connections: {ride_id: [list_of_connected_websockets]}
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, ride_id: str):
        await websocket.accept()
        if ride_id not in self.active_connections:
            self.active_connections[ride_id] = []
        self.active_connections[ride_id].append(websocket)

    def disconnect(self, websocket: WebSocket, ride_id: str):
        self.active_connections[ride_id].remove(websocket)

    async def broadcast_location(self, ride_id: str, message: dict):
        if ride_id in self.active_connections:
            for connection in self.active_connections[ride_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/ride/{ride_id}")
async def ride_tracking_websocket(websocket: WebSocket, ride_id: str):
    await manager.connect(websocket, ride_id)
    try:
        while True:
            # Receive GPS data from the Driver's phone
            data = await websocket.receive_json()
            
            # Data format: {"lat": 26.758, "lng": 75.850, "speed": 40}
            # Broadcast this to all passengers/monitors for this ride
            await manager.broadcast_location(ride_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, ride_id)
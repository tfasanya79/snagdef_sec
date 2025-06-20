from fastapi import WebSocket
import json

class AlertManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    async def broadcast_alert(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))
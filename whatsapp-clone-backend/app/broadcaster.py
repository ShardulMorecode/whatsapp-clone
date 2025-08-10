# app/broadcaster.py
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active_connections.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active_connections:
            self.active_connections.remove(ws)

    async def broadcast(self, message: dict):
        to_remove = []
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception:
                to_remove.append(conn)
        for r in to_remove:
            self.disconnect(r)

manager = ConnectionManager()

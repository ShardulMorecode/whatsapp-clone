from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .db import processed_messages
from bson import ObjectId
import os

app = FastAPI()

# Allow frontend requests (React/Next.js/Vue)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store connected clients
active_connections = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process message
            await websocket.send_json({"type": "new_message", "payload": data})
    except WebSocketDisconnect:
        print(f"User {user_id} disconnected")

@app.get("/api")
def home():
    return {"message": "WhatsApp Clone API is running"}

# 1. Get all conversations grouped by wa_id
@app.get("/api/conversations")
def get_conversations():
    pipeline = [
        {"$sort": {"timestamp": 1}},
        {"$group": {
            "_id": "$wa_id",
            "name": {"$first": "$name"},
            "last_message": {"$last": "$text"},
            "last_timestamp": {"$last": "$timestamp"}
        }},
        {"$sort": {"last_timestamp": -1}}
    ]
    conversations = list(processed_messages.aggregate(pipeline))
    return conversations

# 2. Get messages for a specific user
@app.get("/api/messages/{wa_id}")
def get_messages(wa_id: str):
    messages = list(processed_messages.find({"wa_id": wa_id}).sort("timestamp", 1))
    if not messages:
        raise HTTPException(status_code=404, detail="No messages found")
    for msg in messages:
        msg["_id"] = str(msg["_id"])
    return messages

# 3. Send (store) a new message
@app.post("/api/messages")
def send_message(data: dict):
    required_fields = ["wa_id", "name", "from", "text", "timestamp", "status"]
    for field in required_fields:
        if field not in data:
            raise HTTPException(status_code=400, detail=f"Missing field: {field}")
    data["_id"] = str(ObjectId())  # Unique ID
    processed_messages.insert_one(data)
    return {"message": "Message stored successfully", "data": data}

# -------- Serve Frontend --------
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend_out")

if os.path.exists(FRONTEND_DIR):
    app.mount("/_next/static", StaticFiles(directory=os.path.join(FRONTEND_DIR, "_next", "static")), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index_path = os.path.join(FRONTEND_DIR, "index.html")
        return FileResponse(index_path)

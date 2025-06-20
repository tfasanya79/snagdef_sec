from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from backend.models.database import SessionLocal, engine, Base, User
from backend.routes import auth, agents

# Ensure all tables are created (for dev only; use Alembic in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SnagDef API",
    description="Autonomous Threat Detection & Response System",
    version="0.1.0"
)

# Include routers (prefixes already set in routers)
app.include_router(auth.router)
app.include_router(agents.router)

# CORS Middleware (allow all for dev; restrict in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://snagdefsec.netlify.app"],  # Change to specific domains in production!
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/test-db")
def test_db():
    """Test database connection and count users"""
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        return {"users": user_count}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "SnagDef Backend Running"}

# --- WebSocket for real-time alerts ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # Keep connection alive, ignore incoming
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Utility for other modules to broadcast alerts
def broadcast_alert(message: str):
    import asyncio
    asyncio.create_task(manager.broadcast(message))
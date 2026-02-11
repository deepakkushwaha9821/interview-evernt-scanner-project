from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from interview.router import router
from fastapi import FastAPI, WebSocket
from wsServer import websocket_endpoint
app = FastAPI()

# 🔥 CORS — REQUIRED FOR REACT
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⬇️ ROUTER MUST COME AFTER CORS
app.include_router(router, prefix="/interview")
@app.websocket("/ws")
async def ws_route(ws: WebSocket):
    await websocket_endpoint(ws)
# print("MAIN SERVER LOADED")
# from fastapi import FastAPI, WebSocket
# from fastapi.middleware.cors import CORSMiddleware
# from interview.router import router
# from wsServer import websocket_endpoint
# from proctoring.router import router as proctor_router
# from proctoring.video_router import router as video_router
# from auth.routes import auth_bp
# from admin.routes import admin_bp

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173"
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# from fastapi.staticfiles import StaticFiles

# app.mount("/frames", StaticFiles(directory="frames"), name="frames")
# app.include_router(router, prefix="/interview")
# app.include_router(proctor_router, prefix="/proctor")
# app.include_router(video_router, prefix="/proctor")
# app.register_blueprint(auth_bp, url_prefix="/auth")
# app.register_blueprint(admin_bp, url_prefix="/admin")

# @app.get("/")
# def root():
#     return {"message": "Backend running"}

# @app.websocket("/ws")
# async def ws_route(ws: WebSocket):
#     print("WEBSOCKET ROUTE HIT")
#     await websocket_endpoint(ws)



print("MAIN SERVER LOADED")
import os

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# interview system
from interview.router import router as interview_router

# websocket
from wsServer import websocket_endpoint

# proctoring
from proctoring.router import router as proctor_router
from proctoring.video_router import router as video_router

# auth + admin
from auth.routes import router as auth_router
from admin.routes import router as admin_router

# database
from database import Base, engine
from models.user import User  # noqa: F401
from storage_paths import FRAMES_DIR, RECORDINGS_DIR, ensure_storage_dirs


# ---------------------------------
# Create database tables
# ---------------------------------

Base.metadata.create_all(bind=engine)
ensure_storage_dirs()


# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(
    title="AI Interview System",
    description="Backend for AI interview + proctoring system",
    version="1.0"
)


# ---------------------------------
# CORS (React connection)
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://interview-evernt-scanner-project-b1.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------
# Static Files
# ---------------------------------

app.mount("/frames", StaticFiles(directory=FRAMES_DIR), name="frames")

app.mount(
    "/recordings",
    StaticFiles(directory=RECORDINGS_DIR),
    name="recordings"
)


# ---------------------------------
# API Routers
# ---------------------------------

# interview system
app.include_router(
    interview_router,
    prefix="/interview",
    tags=["Interview"]
)

# proctoring
app.include_router(
    proctor_router,
    prefix="/proctor",
    tags=["Proctoring"]
)

app.include_router(
    video_router,
    prefix="/proctor",
    tags=["Video"]
)

# authentication
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

# admin dashboard
app.include_router(
    admin_router,
    prefix="/admin",
    tags=["Admin"]
)


# ---------------------------------
# Root Endpoint
# ---------------------------------

@app.get("/")
def root():
    return {"message": "Backend running successfully"}


# ---------------------------------
# WebSocket Endpoint
# ---------------------------------

@app.websocket("/ws")
async def ws_route(ws: WebSocket):

    print("WEBSOCKET ROUTE HIT")

    await websocket_endpoint(ws)

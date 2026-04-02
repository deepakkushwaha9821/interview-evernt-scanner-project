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
import re

from fastapi import FastAPI, Request, Response, WebSocket
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

def _normalize_origin(value: str) -> str:
    return value.strip().rstrip("/")


cors_origins = os.getenv(
    "CORS_ORIGINS",
    "https://interview-evernt-scanner-project-b1.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
)

cors_allow_all = os.getenv("CORS_ALLOW_ALL", "false").strip().lower() == "true"

origin_tokens = [
    token for token in re.split(r"[,\n]+", cors_origins) if token.strip()
]
allowed_origins = [_normalize_origin(token) for token in origin_tokens]

# Ensure known production frontend origin is always allowed.
default_frontend_origin = "https://interview-evernt-scanner-project-b1.vercel.app"
if default_frontend_origin not in allowed_origins:
    allowed_origins.append(default_frontend_origin)
cors_origin_regex = os.getenv(
    "CORS_ORIGIN_REGEX",
    r"https://([a-z0-9-]+\.)*(vercel\.app|onrender\.com)$"
)

if cors_allow_all:
    allowed_origins = ["*"]
    cors_origin_regex = None


# ---------------------------------
# CORS (React connection)
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str, request: Request):
    # Keep a concrete OPTIONS endpoint so proxies do not return 405 before CORS runs.
    return Response(status_code=204)


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

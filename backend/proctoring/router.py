import json

from fastapi import APIRouter, Request
from pydantic import BaseModel
import base64
import os
import time

from storage_paths import get_session_frame_path, get_session_frames_dir

router = APIRouter()

# store latest detection and heartbeat per session
latest_detection = {}
_analyze_frame = None


def _get_analyze_frame():
    global _analyze_frame
    if _analyze_frame is None:
        from proctoring.cheating_pipeline import analyze_frame

        _analyze_frame = analyze_frame
    return _analyze_frame


class Frame(BaseModel):
    pairCode: str
    image: str


# -----------------------------
# RECEIVE MOBILE FRAME
# -----------------------------
@router.post("/mobile-frame")
async def mobile_frame(data: Frame):

    img_data = data.image.split(",")[1]
    img_bytes = base64.b64decode(img_data)

    frame_path = get_session_frame_path(data.pairCode)
    os.makedirs(os.path.dirname(frame_path), exist_ok=True)

    with open(frame_path, "wb") as f:
        f.write(img_bytes)

    # run AI detection (lazy import to keep lightweight endpoints responsive)
    try:
        detection = _get_analyze_frame()(frame_path)
    except Exception as error:
        detection = {
            "face": "unknown",
            "phone": False,
            "looking_away": False,
            "error": str(error)
        }

    print("Detection:", detection)

    # store latest result + heartbeat timestamp
    latest_detection[data.pairCode] = {
        "detection": detection,
        "updated_at": time.time()
    }

    return {
        "frame": f"/frames/session_{data.pairCode}/latest.jpg",
        "detection": detection
    }


# -----------------------------
# GET LATEST RESULT
# -----------------------------
@router.get("/latest/{pairCode}")
def latest(pairCode: str):

    entry = latest_detection.get(pairCode)
    detection = None
    connected = False

    if entry:
        detection = entry.get("detection")
        updated_at = entry.get("updated_at", 0)
        connected = (time.time() - updated_at) <= 6

    frame_path = get_session_frame_path(pairCode)
    frame_url = f"/frames/session_{pairCode}/latest.jpg" if os.path.exists(frame_path) else None

    return {
        "frame": frame_url,
        "detection": detection,
        "connected": connected
    }


# -----------------------------
# EVENT LOGGER
# -----------------------------
@router.post("/event")
async def log_event(request: Request):

    data = {}

    try:
        data = await request.json()
    except Exception:
        # Some clients/proxies can send beacon payloads without standard JSON headers.
        try:
            raw = await request.body()
            if raw:
                data = json.loads(raw.decode("utf-8", errors="ignore"))
        except Exception:
            data = {}

    print("Event:", data)

    return {"status": "ok"}

# from fastapi import APIRouter
# from pydantic import BaseModel
# import base64
# import os

# from proctoring.cheating_pipeline import analyze_frame

# router = APIRouter()

# class Frame(BaseModel):
#     pairCode: str
#     image: str


# @router.post("/mobile-frame")
# async def mobile_frame(data: Frame):

#     img_data = data.image.split(",")[1]
#     img_bytes = base64.b64decode(img_data)

#     os.makedirs("frames", exist_ok=True)

#     frame_path = f"frames/{data.pairCode}.jpg"

#     with open(frame_path, "wb") as f:
#         f.write(img_bytes)

#     # IMPORTANT
#     detection = analyze_frame(frame_path)

#     print("Detection:", detection)

#     return {"status": "ok"}
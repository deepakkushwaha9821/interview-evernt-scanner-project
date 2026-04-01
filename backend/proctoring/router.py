from fastapi import APIRouter
from pydantic import BaseModel
import base64
import os
import time

from proctoring.cheating_pipeline import analyze_frame
from storage_paths import FRAMES_DIR

router = APIRouter()

# store latest detection and heartbeat per session
latest_detection = {}


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

    os.makedirs(FRAMES_DIR, exist_ok=True)

    frame_path = os.path.join(FRAMES_DIR, f"{data.pairCode}.jpg")

    with open(frame_path, "wb") as f:
        f.write(img_bytes)

    # run AI detection
    detection = analyze_frame(frame_path)

    print("Detection:", detection)

    # store latest result + heartbeat timestamp
    latest_detection[data.pairCode] = {
        "detection": detection,
        "updated_at": time.time()
    }

    return {
        "frame": f"/frames/{data.pairCode}.jpg",
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

    return {
        "frame": f"/frames/{pairCode}.jpg",
        "detection": detection,
        "connected": connected
    }


# -----------------------------
# EVENT LOGGER
# -----------------------------
@router.post("/event")
def log_event(data: dict):

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
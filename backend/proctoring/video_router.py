from fastapi import APIRouter, UploadFile, File, Form
import os
import shutil
from storage_paths import RECORDINGS_DIR

router = APIRouter()

@router.post("/upload-video")
async def upload_video(
    session_id: str = Form(...),
    role: str = Form(...),
    video: UploadFile = File(...)
):

    print("VIDEO UPLOAD RECEIVED")

    role = role.strip().lower()
    if role not in {"laptop", "mobile"}:
        role = "mobile"

    base = os.path.join(RECORDINGS_DIR, f"session_{session_id}", role)
    os.makedirs(base, exist_ok=True)

    file_path = os.path.join(base, f"{role}_video.webm")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    print("Saved video to:", file_path)

    return {"status": "saved"}
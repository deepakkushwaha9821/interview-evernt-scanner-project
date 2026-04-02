from fastapi import APIRouter
import os
from storage_paths import FRAMES_DIR, RECORDINGS_DIR

router = APIRouter()

VIDEO_FOLDER = RECORDINGS_DIR


@router.get("/videos")
def get_videos():

    sessions = []

    session_names = set()

    if os.path.exists(VIDEO_FOLDER):
        for session in os.listdir(VIDEO_FOLDER):
            if session.startswith("session_"):
                session_names.add(session)

    if os.path.exists(FRAMES_DIR):
        for session in os.listdir(FRAMES_DIR):
            if session.startswith("session_"):
                session_names.add(session)

    if not session_names:
        return []

    for session in sorted(session_names):

        mobile_disk_path = os.path.join(VIDEO_FOLDER, session, "mobile", "mobile_video.webm")
        laptop_disk_path = os.path.join(VIDEO_FOLDER, session, "laptop", "laptop_video.webm")
        frame_disk_path = os.path.join(FRAMES_DIR, session, "latest.jpg")

        mobile_video = f"recordings/{session}/mobile/mobile_video.webm"
        laptop_video = f"recordings/{session}/laptop/laptop_video.webm"
        latest_frame = f"frames/{session}/latest.jpg"

        desc_path = os.path.join(VIDEO_FOLDER, session, "description.txt")

        description = ""

        if os.path.exists(desc_path):

            with open(desc_path) as f:
                description = f.read()

        sessions.append({
            "session": session,
            "video": mobile_video,
            "mobile_video": mobile_video if os.path.exists(mobile_disk_path) else None,
            "laptop_video": laptop_video if os.path.exists(laptop_disk_path) else None,
            "latest_frame": latest_frame if os.path.exists(frame_disk_path) else None,
            "description": description
        })

    return sessions
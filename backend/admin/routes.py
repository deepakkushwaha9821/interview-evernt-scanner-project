from fastapi import APIRouter
import os
from storage_paths import RECORDINGS_DIR

router = APIRouter()

VIDEO_FOLDER = RECORDINGS_DIR


@router.get("/videos")
def get_videos():

    sessions = []

    if not os.path.exists(VIDEO_FOLDER):
        return []

    for session in os.listdir(VIDEO_FOLDER):

        mobile_disk_path = os.path.join(VIDEO_FOLDER, session, "mobile", "mobile_video.webm")
        laptop_disk_path = os.path.join(VIDEO_FOLDER, session, "laptop", "laptop_video.webm")

        mobile_video = f"recordings/{session}/mobile/mobile_video.webm"
        laptop_video = f"recordings/{session}/laptop/laptop_video.webm"

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
            "description": description
        })

    return sessions
import os
import re
import shutil


DATA_DIR = os.getenv("DATA_DIR", "data")
FRAMES_DIR = os.path.join(DATA_DIR, "frames")
RECORDINGS_DIR = os.path.join(DATA_DIR, "recordings")


def _safe_session_token(session_id: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9_-]", "_", str(session_id or "")).strip("_")
    return cleaned or "unknown"


def get_session_frames_dir(session_id: str) -> str:
    return os.path.join(FRAMES_DIR, f"session_{_safe_session_token(session_id)}")


def get_session_frame_path(session_id: str) -> str:
    return os.path.join(get_session_frames_dir(session_id), "latest.jpg")


def cleanup_session_frames(session_id: str) -> None:
    path = get_session_frames_dir(session_id)
    if os.path.isdir(path):
        shutil.rmtree(path, ignore_errors=True)


def clear_frames_on_startup() -> None:
    if os.path.isdir(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR, ignore_errors=True)
    os.makedirs(FRAMES_DIR, exist_ok=True)


def ensure_storage_dirs() -> None:
    os.makedirs(FRAMES_DIR, exist_ok=True)
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

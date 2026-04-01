import os


DATA_DIR = os.getenv("DATA_DIR", "data")
FRAMES_DIR = os.path.join(DATA_DIR, "frames")
RECORDINGS_DIR = os.path.join(DATA_DIR, "recordings")


def ensure_storage_dirs() -> None:
    os.makedirs(FRAMES_DIR, exist_ok=True)
    os.makedirs(RECORDINGS_DIR, exist_ok=True)

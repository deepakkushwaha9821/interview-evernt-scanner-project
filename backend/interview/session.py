import uuid
import random
from interview.questions import QUESTIONS

sessions = {}

def start_session():
    session_id = str(uuid.uuid4())

    # shuffle questions dynamically per session
    shuffled = random.sample(QUESTIONS, len(QUESTIONS))

    sessions[session_id] = {
        "questions": shuffled,
        "current": 0,
        "answers": [],
        "scores": []
    }

    return session_id
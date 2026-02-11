# backend/proctoring/scoreCalculator.py

CHEAT_WEIGHTS = {
    "face_missing": 10,
    "multiple_faces": 30,
    "looking_away": 15,
    "person_detected": 40,
    "tab_switch": 10
}

def calculate_cheating_score(events):
    score = 0
    for e in events:
        score += CHEAT_WEIGHTS.get(e["type"], 0)
    return score
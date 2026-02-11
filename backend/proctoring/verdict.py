# backend/proctoring/verdict.py

def get_verdict(score):
    if score < 30:
        return "clear"
    elif score < 60:
        return "warning"
    elif score < 85:
        return "strong_warning"
    else:
        return "disqualify"
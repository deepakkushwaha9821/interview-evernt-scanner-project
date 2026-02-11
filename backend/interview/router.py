from fastapi import APIRouter
from schemas.interview import AnswerRequest
from interview.session import start_session, sessions
from interview.evaluator import evaluate_answer

router = APIRouter()

# ---------------------------
# START INTERVIEW
# ---------------------------
@router.post("/start")
def start_interview():
    session_id = start_session()
    session = sessions[session_id]

    return {
        "session_id": session_id,
        "question": session["questions"][0]["question"]
    }

# ---------------------------
# SUBMIT ANSWER
# ---------------------------
@router.post("/answer")
def submit_answer(req: AnswerRequest):
    session = sessions.get(req.session_id)

    if not session:
        return {"error": "Invalid session"}

    idx = session["current"]
    questions = session["questions"]

    # 🔴 Interview already finished
    if idx >= len(questions):
        return build_final_result(session)

    # Current question
    q = questions[idx]

    # Evaluate answer
    result = evaluate_answer(
        q["question"],
        q["concepts"],
        req.answer
    )

    session["answers"].append(req.answer)
    session["scores"].append(result)
    session["current"] += 1

    # 🟢 Interview finished AFTER this answer
    if session["current"] >= len(questions):
        return build_final_result(session)

    # 🟢 Continue interview
    return {
        "done": False,
        "next_question": questions[session["current"]]["question"]
    }

# ---------------------------
# FINAL RESULT BUILDER
# ---------------------------
def build_final_result(session):
    total_score = sum(r["score"] for r in session["scores"])
    total_possible = sum(r["total"] for r in session["scores"])
    percentage = int((total_score / total_possible) * 100) if total_possible > 0 else 0

    if percentage >= 80:
        final_verdict = "Excellent"
        summary = "You have a strong understanding of Python concepts."
    elif percentage >= 50:
        final_verdict = "Good"
        summary = "You understand the basics but missed some important concepts."
    else:
        final_verdict = "Needs Improvement"
        summary = "You should revise core Python concepts and practice more."

    return {
        "done": True,
        "final_verdict": final_verdict,
        "score_percentage": percentage,
        "summary": summary,
        "detailed_feedback": session["scores"]
    }
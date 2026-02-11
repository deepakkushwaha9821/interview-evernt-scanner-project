# # def evaluate_answer(question, concepts, answer):
# #     matched = []
# #     missed = []

# #     answer_lower = answer.lower()

# #     for concept in concepts:
# #         if concept.lower() in answer_lower:
# #             matched.append(concept)
# #         else:
# #             missed.append(concept)

# #     score = len(matched)
# #     total = len(concepts)

# #     if score == total:
# #         verdict = "excellent"
# #     elif score > 0:
# #         verdict = "good"
# #     else:
# #         verdict = "poor"

# #     # dynamic correction text
# #     correction = f"The correct answer should mention: {', '.join(concepts)}."

# #     feedback = (
# #         "Good understanding." if verdict == "excellent"
# #         else f"You missed: {', '.join(missed)}." if verdict == "good"
# #         else "Your answer did not cover the required concepts."
# #     )

# #     return {
# #         "question": question,
# #         "verdict": verdict,
# #         "score": score,
# #         "total": total,
# #         "your_answer": answer,
# #         "matched_concepts": matched,
# #         "missed_concepts": missed,
# #         "feedback": feedback,
# #         "correction": correction
# #     }


# from model.inference import generate_correct_answer   model based code

# def evaluate_answer(question, concepts, answer):
#     matched = []
#     missed = []

#     answer_lower = answer.lower()

#     for concept in concepts:
#         if concept.lower() in answer_lower:
#             matched.append(concept)
#         else:
#             missed.append(concept)

#     score = len(matched)
#     total = len(concepts)

#     if score == total:
#         verdict = "excellent"
#         feedback = "Excellent answer. You covered all key concepts."
#     elif score > 0:
#         verdict = "good"
#         feedback = f"You missed: {', '.join(missed)}."
#     else:
#         verdict = "poor"
#         feedback = "Your answer did not cover the required concepts."

#     # 🔥 MODEL-GENERATED CORRECT ANSWER
#     correct_answer = generate_correct_answer(question)

#     return {
#         "question": question,
#         "your_answer": answer,
#         "verdict": verdict,
#         "score": score,
#         "total": total,
#         "matched_concepts": matched,
#         "missed_concepts": missed,
#         "feedback": feedback,
#         "correct_answer": correct_answer
#         "model_feedback": model_feedback
#     }


#  model based code


def evaluate_answer(question, concepts, answer):
    matched = []
    missed = []

    answer_lower = answer.lower()

    for concept in concepts:
        if concept.lower() in answer_lower:
            matched.append(concept)
        else:
            missed.append(concept)

    score = len(matched)
    total = len(concepts)

    if score == total:
        verdict = "excellent"
        feedback = "Excellent answer. You covered all key concepts."
    elif score > 0:
        verdict = "good"
        feedback = f"You missed: {', '.join(missed)}."
    else:
        verdict = "poor"
        feedback = "Your answer did not cover the required concepts."

    # ✅ HARD-CODED BUT DYNAMIC CORRECT ANSWER
    correct_answer = (
        f"A correct answer should include the following concepts: "
        f"{', '.join(concepts)}."
    )

    return {
        "question": question,
        "your_answer": answer,
        "verdict": verdict,
        "score": score,
        "total": total,
        "matched_concepts": matched,
        "missed_concepts": missed,
        "feedback": feedback,
        "correct_answer": correct_answer
    }
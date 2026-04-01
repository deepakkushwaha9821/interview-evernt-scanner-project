def calculate_score(events):

    score = 0

    for e in events:

        if e["face"] == "multiple_people":
            score += 5

        if e["face"] == "no_face":
            score += 3

        if e["phone"]:
            score += 5

        if e["looking_away"]:
            score += 2

    return score
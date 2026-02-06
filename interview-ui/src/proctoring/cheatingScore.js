let score = 0;

const RULES = {
  NO_FACE: 10,
  MULTIPLE_FACES: 30,
  LOOKING_AWAY: 5,
  TAB_SWITCH: 15,
  MOBILE_DETECTED: 40
};

export function addCheatingScore(eventType) {
  if (RULES[eventType]) {
    score += RULES[eventType];
  }

  if (score > 100) score = 100;

  return score;
}

export function getCheatingScore() {
  return score;
}

export function resetCheatingScore() {
  score = 0;
}

export function getCheatingLevel() {
  if (score < 30) return "NORMAL";
  if (score < 60) return "WARNING";
  if (score < 85) return "CRITICAL";
  return "DISQUALIFY";
}
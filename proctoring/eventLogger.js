const events = [];

export function logEvent(type, details = {}) {
  const event = {
    type,
    details,
    timestamp: Date.now()
  };

  events.push(event);
  console.warn("🚨 Proctoring event:", event);
}

export function getEvents() {
  return events;
}

export function clearEvents() {
  events.length = 0;
}
# backend/proctoring/storeEvents.py

event_store = {}

def store_event(event):

    session_id = event.get("sessionId")

    if not session_id:
        return

    if session_id not in event_store:
        event_store[session_id] = []

    event_store[session_id].append(event)


def get_session_events(session_id):

    return event_store.get(session_id, [])
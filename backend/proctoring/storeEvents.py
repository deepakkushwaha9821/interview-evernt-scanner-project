# backend/proctoring/storeEvents.py

event_store = {}

def store_event(event):
    session_id = event["sessionId"]

    if session_id not in event_store:
        event_store[session_id] = []

    event_store[session_id].append(event)
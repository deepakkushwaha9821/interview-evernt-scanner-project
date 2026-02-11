# backend/sockets/sessionLinker.py
laptop_sessions = {}
mobile_sessions = {}

def link_mobile(pair_code, mobile_ws):
    laptop_ws = laptop_sessions.get(pair_code)
    if laptop_ws:
        mobile_sessions[pair_code] = mobile_ws
        laptop_ws.send_json({"type": "mobile_connected"})
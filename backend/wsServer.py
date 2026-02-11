# # backend/wsServer.py
# from fastapi import WebSocket

# sessions = {}

# async def websocket_endpoint(ws: WebSocket):
#     await ws.accept()
#     data = await ws.receive_json()

#     pair_code = data.get("pairCode")
#     role = data.get("role")

#     if not pair_code or not role:
#         await ws.close()
#         return

#     if pair_code not in sessions:
#         sessions[pair_code] = {}

#     sessions[pair_code][role] = ws
#     print(f"{role} joined session {pair_code}")

#     # notify laptop when mobile joins
#     if "laptop" in sessions[pair_code] and "mobile" in sessions[pair_code]:
#         await sessions[pair_code]["laptop"].send_json({
#             "type": "mobile_connected"
#         })

#     try:
#         while True:
#             msg = await ws.receive_text()
#             print(f"{role} says:", msg)
#     except:
#         print(f"{role} disconnected from {pair_code}")
#         sessions[pair_code].pop(role, None)

# backend/wsServer.py
from fastapi import WebSocket
from proctoring.storeEvents import store_event
from proctoring.scoreCalculator import calculate_cheating_score
from proctoring.verdict import get_verdict

sessions = {}
events = {}

async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    data = await ws.receive_json()

    pair_code = data["pairCode"]
    role = data["role"]

    if pair_code not in sessions:
        sessions[pair_code] = {}

    sessions[pair_code][role] = ws
    events.setdefault(pair_code, [])

    try:
        while True:
            msg = await ws.receive_json()

            if msg.get("action") == "cheating_event":
                event = msg["payload"]
                store_event(event)
                events[pair_code].append(event)

                score = calculate_cheating_score(events[pair_code])
                verdict = get_verdict(score)

                # notify laptop
                if "laptop" in sessions[pair_code]:
                    await sessions[pair_code]["laptop"].send_json({
                        "type": "cheating_update",
                        "score": score,
                        "verdict": verdict
                    })

    except:
        sessions[pair_code].pop(role, None)
from fastapi import WebSocket
from proctoring.storeEvents import store_event
from proctoring.scoreCalculator import calculate_cheating_score
from proctoring.verdict import get_verdict

# active websocket sessions
sessions = {}

# cheating events storage
events = {}


async def websocket_endpoint(ws: WebSocket):

    print("WebSocket connected")

    await ws.accept()

    pair_code = None
    role = None

    try:

        # first message must include pairCode + role
        data = await ws.receive_json()

        pair_code = data.get("pairCode")
        role = data.get("role")

        if not pair_code or not role:
            print("Invalid websocket init message:", data)
            await ws.close()
            return

        # create session if not exists
        if pair_code not in sessions:
            sessions[pair_code] = {}

        sessions[pair_code][role] = ws
        events.setdefault(pair_code, [])

        print(f"{role} joined session {pair_code}")

        # notify laptop when mobile joins
        if role == "mobile" and "laptop" in sessions[pair_code]:
            await sessions[pair_code]["laptop"].send_json({
                "type": "mobile_joined"
            })

        # ---------------------------
        # message loop
        # ---------------------------
        while True:

            msg = await ws.receive_json()

            # cheating event from client
            if msg.get("action") == "cheating_event":

                event = msg.get("payload")

                if not event:
                    continue

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

    except Exception as e:
        print("WebSocket error:", e)

    finally:

        # cleanup on disconnect
        if pair_code and role:
            if pair_code in sessions and role in sessions[pair_code]:
                sessions[pair_code].pop(role)

        print(f"{role} disconnected from {pair_code}")

# from fastapi import WebSocket
# from proctoring.storeEvents import store_event
# from proctoring.scoreCalculator import calculate_cheating_score
# from proctoring.verdict import get_verdict

# # active websocket sessions
# sessions = {}

# # cheating events storage
# events = {}


# async def websocket_endpoint(ws: WebSocket):

#     print("WebSocket connected")

#     await ws.accept()

#     try:
#         # first message must include pairCode + role
#         data = await ws.receive_json()

#         pair_code = data.get("pairCode")
#         role = data.get("role")

#         if not pair_code or not role:
#             print("Invalid websocket init message:", data)
#             await ws.close()
#             return

#         # create session if not exists
#         if pair_code not in sessions:
#             sessions[pair_code] = {}

#         sessions[pair_code][role] = ws
#         events.setdefault(pair_code, [])

#         print(f"{role} joined session {pair_code}")

#         # notify laptop if mobile joins
#         if role == "mobile" and "laptop" in sessions[pair_code]:
#             await sessions[pair_code]["laptop"].send_json({
#                 "type": "mobile_joined"
#             })

#         # ---------------------------
#         # message loop
#         # ---------------------------
#         while True:

#             msg = await ws.receive_json()

#             # --------------------------------
#             # CHEATING EVENT PROCESSING
#             # --------------------------------
#             if msg.get("action") == "cheating_event":

#                 event = msg.get("payload")

#                 if not event:
#                     continue

#                 store_event(event)
#                 events[pair_code].append(event)

#                 score = calculate_cheating_score(events[pair_code])
#                 verdict = get_verdict(score)

#                 if "laptop" in sessions[pair_code]:
#                     await sessions[pair_code]["laptop"].send_json({
#                         "type": "cheating_update",
#                         "score": score,
#                         "verdict": verdict
#                     })

#             # --------------------------------
#             # WEBRTC OFFER
#             # --------------------------------
#             elif msg.get("type") == "offer":

#                 if "mobile" in sessions[pair_code]:
#                     await sessions[pair_code]["mobile"].send_json(msg)

#             # --------------------------------
#             # WEBRTC ANSWER
#             # --------------------------------
#             elif msg.get("type") == "answer":

#                 if "laptop" in sessions[pair_code]:
#                     await sessions[pair_code]["laptop"].send_json(msg)

#             # --------------------------------
#             # ICE CANDIDATES
#             # --------------------------------
#             elif msg.get("type") == "ice_candidate":

#                 target = "mobile" if role == "laptop" else "laptop"

#                 if target in sessions[pair_code]:
#                     await sessions[pair_code][target].send_json(msg)

#     except Exception as e:
#         print("WebSocket error:", e)

#     finally:
#         # cleanup on disconnect
#         if pair_code in sessions and role in sessions[pair_code]:
#             sessions[pair_code].pop(role)
#         print("INIT MESSAGE:", data)
#         print(f"{role} disconnected from {pair_code}")
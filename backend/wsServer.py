import base64
import os

from fastapi import WebSocket
from proctoring.storeEvents import store_event
from proctoring.scoreCalculator import calculate_cheating_score
from proctoring.verdict import get_verdict
from proctoring.cheating_pipeline import analyze_frame
from storage_paths import cleanup_session_frames, get_session_frame_path

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
        # first message must include type=init + pairCode + role
        data = await ws.receive_json()

        message_type = data.get("type")
        pair_code = data.get("pairCode")
        role = data.get("role")

        if message_type not in {None, "init"}:
            print("Invalid websocket init type:", data)
            await ws.close()
            return

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

            msg_type = msg.get("type")

            if msg_type == "frame" and role == "mobile":
                image_data_url = msg.get("image")

                if not image_data_url or "," not in image_data_url:
                    continue

                try:
                    image_b64 = image_data_url.split(",", 1)[1]
                    image_bytes = base64.b64decode(image_b64)

                    frame_path = get_session_frame_path(pair_code)
                    os.makedirs(os.path.dirname(frame_path), exist_ok=True)

                    with open(frame_path, "wb") as frame_file:
                        frame_file.write(image_bytes)

                    detection = analyze_frame(frame_path)
                except Exception as error:
                    detection = {
                        "face": "unknown",
                        "phone": False,
                        "looking_away": False,
                        "error": str(error)
                    }

                if "laptop" in sessions[pair_code]:
                    await sessions[pair_code]["laptop"].send_json({
                        "type": "frame_update",
                        "image": image_data_url,
                        "detection": detection,
                        "connected": True
                    })
                continue

            # cheating event from client
            if msg_type == "cheating_event" or msg.get("action") == "cheating_event":

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

            if (
                role == "mobile"
                and pair_code in sessions
                and "laptop" in sessions[pair_code]
            ):
                try:
                    await sessions[pair_code]["laptop"].send_json({
                        "type": "mobile_disconnected",
                        "connected": False
                    })
                except Exception:
                    pass

            # remove session data once all peers disconnect
            if pair_code in sessions and not sessions[pair_code]:
                sessions.pop(pair_code, None)
                events.pop(pair_code, None)
                cleanup_session_frames(pair_code)

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
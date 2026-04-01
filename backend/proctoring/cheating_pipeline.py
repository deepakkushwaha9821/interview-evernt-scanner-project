from proctoring.face_detection import detect_faces
from proctoring.phone_detection import detect_phone
from proctoring.head_pose import detect_looking_away

def analyze_frame(frame_path):

    face_result = detect_faces(frame_path)
    phone_result = detect_phone(frame_path)
    look_result = detect_looking_away(frame_path)

    result = {
        "face": face_result,
        "phone": phone_result,
        "looking_away": look_result
    }

    print("Detection result:", result)

    return result
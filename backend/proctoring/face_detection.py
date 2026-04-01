import cv2
import mediapipe as mp

# load model once
mp_face = mp.solutions.face_detection
face_detector = mp_face.FaceDetection(
    model_selection=0,
    min_detection_confidence=0.5
)

def detect_faces(frame_path):

    img = cv2.imread(frame_path)

    # if frame not saved yet
    if img is None:
        return "no_face"

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    result = face_detector.process(rgb)

    if not result.detections:
        return "no_face"

    if len(result.detections) > 1:
        return "multiple_people"

    return "single_face"
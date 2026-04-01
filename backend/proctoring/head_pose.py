import cv2
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh

def detect_looking_away(frame):

    img = cv2.imread(frame)

    with mp_face_mesh.FaceMesh(static_image_mode=True) as face_mesh:

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        result = face_mesh.process(rgb)

        if not result.multi_face_landmarks:
            return False

        landmarks = result.multi_face_landmarks[0]

        nose = landmarks.landmark[1]

        if nose.x < 0.3 or nose.x > 0.7:
            return True

    return False
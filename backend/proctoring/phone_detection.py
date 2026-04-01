from ultralytics import YOLO
import cv2

model = YOLO("yolov8n.pt")

def detect_phone(frame):

    img = cv2.imread(frame)

    results = model(img)

    for r in results:
        for box in r.boxes:

            cls = int(box.cls)
            label = model.names[cls]

            if label == "cell phone":
                return True

    return False
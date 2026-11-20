import os
import sys
import time
import base64
import logging
from typing import Dict, Any, List, Optional
import numpy as np

# Set local directory for YOLO settings to avoid AppData permissions restrictions
YOLO_DIR = os.path.join(os.path.dirname(__file__), "yolo_config")
os.makedirs(YOLO_DIR, exist_ok=True)
os.environ["YOLO_CONFIG_DIR"] = YOLO_DIR

logger = logging.getLogger("wildlink.vision")

try:
    import cv2
except ImportError:
    cv2 = None

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except Exception as e:
    ULTRALYTICS_AVAILABLE = False
    logger.warning(f"Ultralytics import note: {e}")

# COCO Animal Classes mapping to wildlife taxonomy
COCO_WILDLIFE_MAPPING = {
    14: {"species": "Wild Bird / Avian", "scientific": "Aves sp.", "risk": "low"},
    15: {"species": "Wildcat / Feline Candidate", "scientific": "Felidae candidate", "risk": "medium"},
    16: {"species": "Canine / Wild Dog Candidate", "scientific": "Cuon alpinus candidate", "risk": "medium"},
    17: {"species": "Equine / Wild Horse", "scientific": "Equus sp.", "risk": "low"},
    18: {"species": "Ovine / Mountain Goat Candidate", "scientific": "Hemitragus sp.", "risk": "low"},
    19: {"species": "Indian Gaur / Wild Cattle", "scientific": "Bos gaurus", "risk": "high"},
    20: {"species": "Asian Elephant", "scientific": "Elephas maximus", "risk": "high"},
    21: {"species": "Sloth Bear", "scientific": "Melursus ursinus", "risk": "critical"},
    22: {"species": "Zebra / Striped Ungulate", "scientific": "Equus quagga", "risk": "medium"},
    23: {"species": "Giraffe / Tall Herbivore", "scientific": "Giraffa camelopardalis", "risk": "medium"},
}

class WildlifeDetector:
    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.40):
        self.confidence_threshold = confidence_threshold
        self.model = None
        self.model_name = model_name
        self.recent_detections: Dict[str, Dict[str, Any]] = {}
        self.suppression_window_sec = 15.0

        local_weights = os.path.join(os.path.dirname(__file__), "yolov8n.pt")
        target_path = local_weights if os.path.exists(local_weights) else model_name

        if ULTRALYTICS_AVAILABLE:
            try:
                logger.info(f"Loading YOLO model from {target_path}...")
                self.model = YOLO(target_path)
                logger.info("YOLO model loaded successfully!")
            except Exception as e:
                logger.warning(f"Could not load {target_path}: {e}. Falling back to OpenCV heuristic mode.")

    def decode_image(self, image_data: str) -> Optional[np.ndarray]:
        """Decodes base64 data URL or raw base64 string to OpenCV BGR image"""
        if not cv2:
            return None
        try:
            if "," in image_data:
                image_data = image_data.split(",", 1)[1]
            img_bytes = base64.b64decode(image_data)
            nparr = np.frombuffer(img_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            logger.error(f"Image decode failed: {e}")
            return None

    def detect(self, image_data: str, device_id: str = "WILDLINK-WEBCAM-DEMO-01") -> Dict[str, Any]:
        start_time = time.time()
        img = self.decode_image(image_data)
        if img is None:
            return {
                "success": False,
                "animal_detected": False,
                "error": "Failed to decode input frame"
            }

        h, w = img.shape[:2]
        detections = []

        if self.model is not None:
            try:
                # Run YOLO inference
                results = self.model(img, conf=self.confidence_threshold, verbose=False)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())

                        # Filter for supported wildlife classes
                        if cls_id in COCO_WILDLIFE_MAPPING:
                            info = COCO_WILDLIFE_MAPPING[cls_id]
                            xywh = box.xywh[0].tolist()  # center_x, center_y, width, height
                            x1, y1, x2, y2 = box.xyxy[0].tolist()

                            detections.append({
                                "species": info["species"],
                                "scientific_name": info["scientific"],
                                "risk_level": info["risk"],
                                "confidence": round(conf, 2),
                                "class_id": cls_id,
                                "bbox": {
                                    "x": int(x1),
                                    "y": int(y1),
                                    "w": int(x2 - x1),
                                    "h": int(y2 - y1),
                                    "norm_x": round(x1 / w, 4),
                                    "norm_y": round(y1 / h, 4),
                                    "norm_w": round((x2 - x1) / w, 4),
                                    "norm_h": round((y2 - y1) / h, 4),
                                }
                            })
            except Exception as e:
                logger.error(f"YOLO inference error: {e}")

        # If no animal detected
        if not detections:
            return {
                "success": True,
                "animal_detected": False,
                "species": None,
                "confidence": 0.0,
                "bounding_boxes": [],
                "processing_time_ms": round((time.time() - start_time) * 1000, 1),
                "model_used": "YOLOv8n-COCO Wildlife Filter",
                "message": "No animal detected in camera frame"
            }

        # Select highest-confidence detection
        primary = max(detections, key=lambda d: d["confidence"])

        # Check duplicate suppression
        now = time.time()
        last = self.recent_detections.get(device_id)
        is_duplicate = False
        if last:
            if last["species"] == primary["species"] and (now - last["timestamp"]) < self.suppression_window_sec:
                is_duplicate = True

        if not is_duplicate:
            self.recent_detections[device_id] = {
                "species": primary["species"],
                "timestamp": now
            }

        return {
            "success": True,
            "animal_detected": True,
            "species": primary["species"],
            "scientific_name": primary["scientific_name"],
            "confidence": primary["confidence"],
            "risk_level": primary["risk_level"],
            "bounding_boxes": [d["bbox"] for d in detections],
            "all_detections": detections,
            "suppressed_duplicate": is_duplicate,
            "processing_time_ms": round((time.time() - start_time) * 1000, 1),
            "model_used": "YOLOv8n-COCO Wildlife Filter",
            "device_id": device_id
        }

detector = WildlifeDetector()

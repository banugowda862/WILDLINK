"""
WILDLINK IoT Edge Node - Optional RGB Optical Camera Interface
Supports OpenCV USB/CSI camera with synthetic wildlife test frame generation.
"""

import time
import logging
import numpy as np
from typing import Optional, Tuple

logger = logging.getLogger("wildlink.hardware.rgb")

try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    logger.info("OpenCV not installed. RGB camera running in simulated generator mode.")

class RGBCamera:
    def __init__(self, simulate: bool = False, camera_index: int = 0, width: int = 1280, height: int = 720):
        self.simulate = simulate or (not OPENCV_AVAILABLE)
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.cap = None
        self.is_connected = False

        if not self.simulate:
            self._init_camera()
        else:
            self.is_connected = True
            logger.info("RGB Camera initialized in SIMULATION MODE.")

    def _init_camera(self):
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            ret, _ = self.cap.read()
            if ret:
                self.is_connected = True
                logger.info(f"Physical camera initialized on index {self.camera_index}")
            else:
                logger.warning("Failed to grab initial test frame. Switching to simulation.")
                self.simulate = True
                self.is_connected = True
        except Exception as e:
            logger.error(f"Error initializing camera: {e}")
            self.simulate = True
            self.is_connected = True

    def capture_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        if self.simulate or not OPENCV_AVAILABLE:
            # Generate simulated forest frame with synthetic bounding watermark
            img = np.zeros((self.height, self.width, 3), dtype=np.uint8)
            # Forest green background tint
            img[:] = (25, 45, 20)
            if OPENCV_AVAILABLE:
                cv2.putText(img, "WILDLINK RGB OPTICAL PREVIEW [MOCK]", (50, 80),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.2, (100, 240, 120), 2)
                cv2.putText(img, f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}", (50, 130),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (200, 200, 200), 1)
            return True, img

        ret, frame = self.cap.read()
        return ret, frame

    def release(self):
        if self.cap:
            self.cap.release()
            self.is_connected = False

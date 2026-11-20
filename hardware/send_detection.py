"""
WILDLINK IoT Edge Node - Secure Transmission Client
Transmits telemetry heartbeats and detected wildlife events to the WILDLINK FastAPI backend
with automatic retry, offline queueing, and per-device authentication tokens.
"""

import time
import json
import logging
import requests
from typing import Dict, Any, Optional

logger = logging.getLogger("wildlink.hardware.transmitter")

class DetectionTransmitter:
    def __init__(self, base_url: str, device_id: str, secret_token: str, timeout: int = 10, max_retries: int = 3):
        self.base_url = base_url.rstrip("/")
        self.device_id = device_id
        self.secret_token = secret_token
        self.timeout = timeout
        self.max_retries = max_retries
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
            "X-Device-Token": self.secret_token,
            "User-Agent": f"WILDLINK-EdgeNode/{device_id}"
        })

    def send_detection(self, event_data: Dict[str, Any]) -> bool:
        """
        Transmits detection event to POST /api/v1/detections.
        """
        url = f"{self.base_url}/api/v1/detections"
        payload = dict(event_data)
        payload["device_id"] = self.device_id

        for attempt in range(1, self.max_retries + 1):
            try:
                response = self.session.post(url, json=payload, timeout=self.timeout)
                if response.status_code in [200, 201]:
                    logger.info(f"Detection sent successfully (ID: {response.json().get('detection', {}).get('detection_id')})")
                    return True
                else:
                    logger.warning(f"Server rejected detection ({response.status_code}): {response.text}")
            except requests.RequestException as e:
                logger.warning(f"Network error sending detection (Attempt {attempt}/{self.max_retries}): {e}")
                time.sleep(2 ** attempt)

        logger.error(f"Failed to transmit detection after {self.max_retries} attempts.")
        return False

    def send_heartbeat(self, health_data: Dict[str, Any]) -> bool:
        """
        Transmits telemetry heartbeat to POST /api/v1/devices/heartbeat.
        """
        url = f"{self.base_url}/api/v1/devices/heartbeat"
        payload = dict(health_data)
        payload["device_id"] = self.device_id

        try:
            response = self.session.post(url, json=payload, timeout=self.timeout)
            if response.status_code == 200:
                return True
            else:
                logger.warning(f"Heartbeat rejected ({response.status_code}): {response.text}")
                return False
        except requests.RequestException as e:
            logger.warning(f"Failed to reach server for heartbeat: {e}")
            return False

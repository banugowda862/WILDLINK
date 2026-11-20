"""
WILDLINK IoT Edge Node - AI Animal Detection Interface
Interchangeable AI inference pipeline supporting:
  1. Heuristic Thermal Candidate Detection (Baseline)
  2. Optional RGB Optical Analysis (Future YOLO/TensorFlow Lite model)
  3. Strict Human Verification tagging

Ethical & Technical Rule: Low-resolution thermal signatures are NEVER labeled
as confirmed species without human verification or high-confidence RGB fusion.
"""

import time
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("wildlink.hardware.ai")

class AnimalDetector:
    def __init__(self, mode: str = "heuristic_thermal", confidence_threshold: float = 0.70):
        self.mode = mode
        self.confidence_threshold = confidence_threshold
        self.recent_detections = []

    def evaluate(self, thermal_metrics: Dict[str, Any], rgb_frame: Optional[Any] = None) -> Optional[Dict[str, Any]]:
        """
        Evaluates thermal metrics and optional RGB frame to yield structured event.
        """
        candidates = thermal_metrics.get("candidates", [])
        if not candidates:
            return None

        # Take primary candidate
        primary = max(candidates, key=lambda c: c["pixel_count"])
        peak_temp = primary["peak_temp"]
        ambient = thermal_metrics["ambient_temp"]
        cluster_size = primary["pixel_count"]

        # Biological temperature consistency check (32°C - 41°C for mammals/birds)
        if peak_temp < 30.0 or peak_temp > 45.0:
            # Likely hot rock, solar heated soil or artificial metal object
            return None

        # Estimate confidence score based on temperature contrast and cluster cohesion
        temp_delta = peak_temp - ambient
        base_confidence = min(0.92, max(0.55, 0.50 + (temp_delta * 0.04) + (cluster_size * 0.01)))

        # Tentative heuristic categorization (strictly tagged as candidate, not confirmed species)
        if cluster_size >= 18:
            species_label = "Large Wildlife / Mammal (Candidate)"
            risk_level = "high"
        elif cluster_size >= 6:
            species_label = "Medium Wildlife / Quadruped (Candidate)"
            risk_level = "medium"
        else:
            species_label = "Small Wildlife / Avian (Candidate)"
            risk_level = "low"

        detection_event = {
            "event_type": "wildlife_detection",
            "detection_method": "thermal" if rgb_frame is None else "fusion",
            "possible_species": species_label,
            "detection_confidence": round(base_confidence, 2),
            "candidate_count": len(candidates),
            "risk_level": risk_level,
            "max_temp_celsius": peak_temp,
            "ambient_temp_celsius": ambient,
            "verification_status": "pending",  # Must be verified by human forest officer
            "bounding_boxes": [
                {
                    "x": primary["x"],
                    "y": primary["y"],
                    "w": primary["w"],
                    "h": primary["h"],
                    "label": species_label
                }
            ],
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        return detection_event

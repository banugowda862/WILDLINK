"""
WILDLINK IoT Edge Node - Thermal Image Processing
Processes 32x24 (768-pixel) thermal frames to detect warm candidate objects,
calculate ambient and peak thermal metrics, and isolate spatial bounding boxes.

Note: MLX90640 has 768 pixels total. It isolates candidate heat clusters,
not high-resolution anatomical animal species features.
"""

import math
import logging
import numpy as np
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("wildlink.hardware.processing")

class ThermalProcessor:
    def __init__(self, min_temp_threshold: float = 30.0, delta_above_ambient: float = 4.0):
        self.min_temp_threshold = min_temp_threshold
        self.delta_above_ambient = delta_above_ambient
        self.prev_candidates: List[Dict[str, Any]] = []

    def process_frame(self, raw_frame: List[float]) -> Dict[str, Any]:
        """
        Analyzes a 768-float thermal array.
        Returns:
            Dict containing:
                ambient_temp: float
                max_temp: float
                min_temp: float
                candidates: List[Dict] with bounding boxes and cluster stats
                has_thermal_candidate: bool
        """
        if len(raw_frame) != 768:
            logger.warning(f"Invalid frame length: {len(raw_frame)} != 768")
            return {
                "ambient_temp": 0.0,
                "max_temp": 0.0,
                "min_temp": 0.0,
                "candidates": [],
                "has_thermal_candidate": False
            }

        grid = np.array(raw_frame, dtype=np.float32).reshape((24, 32))
        ambient_temp = float(np.median(grid))
        max_temp = float(np.max(grid))
        min_temp = float(np.min(grid))

        # Effective detection threshold
        threshold = max(self.min_temp_threshold, ambient_temp + self.delta_above_ambient)
        hot_mask = grid >= threshold

        candidates = []
        visited = np.zeros_like(hot_mask, dtype=bool)

        # Connected component clustering in 24x32 grid
        for r in range(24):
            for c in range(32):
                if hot_mask[r, c] and not visited[r, c]:
                    # Breadth-first search for cluster
                    cluster_pixels = []
                    queue = [(r, c)]
                    visited[r, c] = True

                    while queue:
                        curr_r, curr_c = queue.pop(0)
                        cluster_pixels.append((curr_r, curr_c, grid[curr_r, curr_c]))

                        for dr, dc in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                            nr, nc = curr_r + dr, curr_c + dc
                            if 0 <= nr < 24 and 0 <= nc < 32:
                                if hot_mask[nr, nc] and not visited[nr, nc]:
                                    visited[nr, nc] = True
                                    queue.append((nr, nc))

                    # Filter tiny single-pixel sensor noise (need at least 2 adjacent warm pixels)
                    if len(cluster_pixels) >= 2:
                        rs = [p[0] for p in cluster_pixels]
                        cs = [p[1] for p in cluster_pixels]
                        temps = [p[2] for p in cluster_pixels]

                        min_r, max_r = min(rs), max(rs)
                        min_c, max_c = min(cs), max(cs)
                        peak_val = max(temps)

                        candidate = {
                            "x": int(min_c),
                            "y": int(min_r),
                            "w": int(max_c - min_c + 1),
                            "h": int(max_r - min_r + 1),
                            "pixel_count": len(cluster_pixels),
                            "peak_temp": round(float(peak_val), 2),
                            "mean_temp": round(float(sum(temps) / len(temps)), 2),
                            "label": "Thermal Candidate Signature"
                        }
                        candidates.append(candidate)

        self.prev_candidates = candidates
        return {
            "ambient_temp": round(ambient_temp, 2),
            "max_temp": round(max_temp, 2),
            "min_temp": round(min_temp, 2),
            "candidates": candidates,
            "has_thermal_candidate": len(candidates) > 0
        }

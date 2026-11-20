"""
WILDLINK IoT Edge Node - Thermal Camera Driver
Supports MLX90640 32x24 Far-Infrared Thermal Sensor with automatic fallback
to high-fidelity mock sensor simulation for development and bench testing.
"""

import time
import math
import random
import logging
from typing import Tuple, List, Optional

logger = logging.getLogger("wildlink.hardware.thermal")

try:
    import board
    import busio
    import adafruit_mlx90640
    HARDWARE_I2C_AVAILABLE = True
except ImportError:
    HARDWARE_I2C_AVAILABLE = False
    logger.info("Adafruit MLX90640 libraries not detected. Falling back to software simulation mode.")

class MLX90640Driver:
    def __init__(self, simulate: bool = False, i2c_bus: int = 1, refresh_rate_hz: int = 4):
        self.simulate = simulate or (not HARDWARE_I2C_AVAILABLE)
        self.refresh_rate_hz = refresh_rate_hz
        self.sensor = None
        self.is_healthy = False
        self.error_count = 0
        self.last_read_time = 0.0

        # Simulation state
        self._sim_t = 0.0
        self._ambient_temp = 22.5
        self._target_cluster_active = True

        if not self.simulate:
            self._init_physical_sensor()
        else:
            logger.info("MLX90640 Initialized in HIGH-FIDELITY SIMULATION MODE (32x24 array).")
            self.is_healthy = True

    def _init_physical_sensor(self):
        try:
            logger.info("Initializing physical MLX90640 on I2C bus...")
            i2c = busio.I2C(board.SCL, board.SDA, frequency=400000)
            self.sensor = adafruit_mlx90640.MLX90640(i2c)
            # MLX90640 refresh rate enum mapping
            rates = {
                1: adafruit_mlx90640.RefreshRate.REFRESH_1_HZ,
                2: adafruit_mlx90640.RefreshRate.REFRESH_2_HZ,
                4: adafruit_mlx90640.RefreshRate.REFRESH_4_HZ,
                8: adafruit_mlx90640.RefreshRate.REFRESH_8_HZ,
            }
            self.sensor.refresh_rate = rates.get(self.refresh_rate_hz, adafruit_mlx90640.RefreshRate.REFRESH_4_HZ)
            self.is_healthy = True
            logger.info("Physical MLX90640 sensor initialized successfully at 400kHz I2C.")
        except Exception as e:
            logger.error(f"Failed to initialize physical MLX90640 sensor: {e}. Switching to simulation fallback.")
            self.simulate = True
            self.is_healthy = True

    def read_frame(self) -> Tuple[bool, List[float], float, float]:
        """
        Reads a 768-pixel thermal frame (24 rows x 32 columns).
        Returns:
            (success: bool, frame_data: List[float], min_temp: float, max_temp: float)
        """
        if self.simulate:
            return self._generate_simulated_frame()

        frame = [0.0] * 768
        try:
            self.sensor.getFrame(frame)
            self.error_count = 0
            self.last_read_time = time.time()
            min_temp = min(frame)
            max_temp = max(frame)
            return True, frame, min_temp, max_temp
        except ValueError as ve:
            # Common MLX90640 subpage framing error
            self.error_count += 1
            logger.warning(f"MLX90640 frame dropped: {ve}")
            return False, [], 0.0, 0.0
        except Exception as e:
            self.error_count += 1
            logger.error(f"Error reading MLX90640: {e}")
            if self.error_count > 5:
                self.is_healthy = False
            return False, [], 0.0, 0.0

    def _generate_simulated_frame(self) -> Tuple[bool, List[float], float, float]:
        """
        Generates realistic 32x24 thermal gradient with an ambient background
        and a moving warm biological heat signature (e.g. 34-37°C).
        """
        self._sim_t += 0.2
        frame = [0.0] * 768

        # Simulated animal moving across frame
        center_x = 16 + 8 * math.sin(self._sim_t * 0.5)
        center_y = 12 + 4 * math.cos(self._sim_t * 0.3)
        radius = 3.5
        animal_core_temp = 36.5 + 0.5 * math.sin(self._sim_t)

        idx = 0
        for y in range(24):
            for x in range(32):
                # Base ambient temperature with slight noise
                ambient = self._ambient_temp + random.uniform(-0.3, 0.3) + (y * 0.05)
                # Distance to heat cluster center
                dist = math.sqrt((x - center_x) ** 2 + (y - center_y) ** 2)
                if dist < radius:
                    # Gaussian heat distribution
                    delta = (animal_core_temp - ambient) * math.exp(-0.5 * (dist / 1.5) ** 2)
                    temp = ambient + delta
                else:
                    temp = ambient
                frame[idx] = round(temp, 2)
                idx += 1

        self.last_read_time = time.time()
        return True, frame, min(frame), max(frame)

    def get_health_status(self) -> str:
        if not self.is_healthy:
            return "sensor_failure"
        if self.simulate:
            return "simulated_ok"
        return "healthy"

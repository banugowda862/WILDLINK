"""
WILDLINK IoT Edge Node - Main Execution Loop
Orchestrates thermal frame acquisition, spatial heat clustering, candidate evaluation,
telemetry heartbeats, and secure API transmission.

Usage:
    python main.py --simulate --base-url http://localhost:8000
"""

import sys
import os
import time
import signal
import logging
import argparse
import yaml

from thermal_camera import MLX90640Driver
from camera import RGBCamera
from thermal_processing import ThermalProcessor
from animal_detection import AnimalDetector
from send_detection import DetectionTransmitter
from device_health import DeviceHealthMonitor

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("wildlink.hardware.main")

running = True

def signal_handler(signum, frame):
    global running
    logger.info("Shutdown signal received. Stopping edge node...")
    running = False

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def load_config(config_path: str = "config.example.yaml") -> dict:
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {}

def main():
    global running
    parser = argparse.ArgumentParser(description="WILDLINK Raspberry Pi Sensor Node")
    parser.add_argument("--simulate", action="store_true", default=True, help="Run in sensor simulation mode")
    parser.add_argument("--device-id", default="WILDLINK-ROAD-001", help="Unique Device Identifier")
    parser.add_argument("--base-url", default="http://localhost:8000", help="FastAPI Server Base URL")
    parser.add_argument("--token", default="wildlink-secure-token-default", help="Device Secret Token")
    parser.add_argument("--lat", type=float, default=11.6664, help="Device Latitude")
    parser.add_argument("--lng", type=float, default=76.6291, help="Device Longitude")
    parser.add_argument("--heartbeat-interval", type=int, default=30, help="Heartbeat interval in seconds")
    parser.add_argument("--poll-interval", type=float, default=2.0, help="Frame poll interval in seconds")
    parser.add_argument("--config", default="config.example.yaml", help="Path to config YAML")
    args = parser.parse_args()

    cfg = load_config(args.config)
    dev_cfg = cfg.get("device", {})
    srv_cfg = cfg.get("server", {})

    device_id = args.device_id or dev_cfg.get("device_id", "WILDLINK-ROAD-001")
    base_url = args.base_url or srv_cfg.get("base_url", "http://localhost:8000")
    secret_token = args.token or dev_cfg.get("secret_token", "wildlink-secure-token-default")
    latitude = args.lat or dev_cfg.get("latitude", 11.6664)
    longitude = args.lng or dev_cfg.get("longitude", 76.6291)

    logger.info("=" * 60)
    logger.info(f"Starting WILDLINK IoT Edge Node: {device_id}")
    logger.info(f"Target Server: {base_url}")
    logger.info(f"Simulation Mode: {args.simulate}")
    logger.info("=" * 60)

    # Initialize components
    thermal_driver = MLX90640Driver(simulate=args.simulate)
    rgb_cam = RGBCamera(simulate=args.simulate)
    processor = ThermalProcessor()
    detector = AnimalDetector()
    transmitter = DetectionTransmitter(base_url=base_url, device_id=device_id, secret_token=secret_token)
    health_monitor = DeviceHealthMonitor(device_id=device_id)

    last_heartbeat_time = 0.0
    last_detection_time = 0.0
    suppression_window_sec = 60.0

    logger.info("Edge node initialization complete. Entering monitoring loop...")

    while running:
        curr_time = time.time()

        # 1. Periodic Heartbeat
        if curr_time - last_heartbeat_time >= args.heartbeat_interval:
            telemetry = health_monitor.get_telemetry(
                thermal_sensor_status=thermal_driver.get_health_status(),
                rgb_status="connected" if rgb_cam.is_connected else "disconnected"
            )
            success = transmitter.send_heartbeat(telemetry)
            if success:
                logger.info(f"Telemetry heartbeat sent. Battery: {telemetry['battery_level']}%, Temp: {telemetry['temp_celsius']}°C")
            last_heartbeat_time = curr_time

        # 2. Acquire Thermal Frame
        success, raw_frame, min_t, max_t = thermal_driver.read_frame()
        if success and raw_frame:
            # 3. Process Thermal Array
            metrics = processor.process_frame(raw_frame)

            if metrics["has_thermal_candidate"]:
                logger.info(f"Heat candidate detected! Peak: {metrics['max_temp']}°C, Ambient: {metrics['ambient_temp']}°C, Candidates: {len(metrics['candidates'])}")
                
                # Check duplicate suppression window
                if curr_time - last_detection_time >= suppression_window_sec:
                    # 4. AI Candidate Evaluation
                    detection_event = detector.evaluate(metrics, rgb_frame=None)
                    if detection_event:
                        detection_event["latitude"] = latitude
                        detection_event["longitude"] = longitude
                        detection_event["simulated"] = args.simulate

                        # 5. Transmit to Backend
                        sent = transmitter.send_detection(detection_event)
                        if sent:
                            last_detection_time = curr_time
                else:
                    logger.debug("Detection event suppressed within hold-off window.")

        time.sleep(args.poll_interval)

    rgb_cam.release()
    logger.info("WILDLINK Edge Node gracefully stopped.")

if __name__ == "__main__":
    main()

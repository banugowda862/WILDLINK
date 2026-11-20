# WILDLINK — Raspberry Pi & MLX90640 Hardware Integration Guide

This guide details configuring an edge wildlife monitoring sentry node using a **Raspberry Pi 4 / 5** and an **MLX90640 Far-Infrared Thermal Sensor**.

---

## 1. Bill of Materials (BOM)

| Item | Component | Notes |
|------|-----------|-------|
| 1 | Raspberry Pi 4 Model B (4GB) or Raspberry Pi 5 | Single-board computer running Raspberry Pi OS (Bookworm) |
| 2 | MLX90640 Far-Infrared Sensor Breakout | 32×24 array (55° or 110° Field of View), I2C interface |
| 3 | Optional Optical Camera | Raspberry Pi Camera Module 3 or USB Night-Vision Webcam |
| 4 | Power Supply | 12V 20W Solar Panel + 12V LiFePO4 battery pack + 5V 3A step-down BEC |
| 5 | Enclosure | IP66 Weatherproof outdoor junction box with silicon gasket and optical IR window |

---

## 2. GPIO Pinout & Wiring

Connect the MLX90640 breakout board to the 40-pin header of the Raspberry Pi:

```
Raspberry Pi 40-Pin Header
┌─────────────────────────────┐
│ Pin 1  (3.3V Power)   ──────┼───>  VIN / VCC on MLX90640 Breakout
│ Pin 3  (GPIO 2 / SDA) ──────┼───>  SDA on MLX90640 Breakout
│ Pin 5  (GPIO 3 / SCL) ──────┼───>  SCL on MLX90640 Breakout
│ Pin 9  (Ground)       ──────┼───>  GND on MLX90640 Breakout
└─────────────────────────────┘
```

> [!IMPORTANT]
> **Breakout Voltage Compatibility**:
> Verify whether your breakout board (Adafruit, Pimoroni, Waveshare) includes an onboard 3.3V low-dropout regulator. While most modern breakouts accept 3.3V or 5V, connecting 5V to the I2C lines directly without level shifting will permanently damage the Raspberry Pi GPIO pins.

---

## 3. Raspberry Pi OS Configuration

1. **Enable the I2C Interface**:
   ```bash
   sudo raspi-config
   # Select: Interface Options -> I2C -> Enable -> Yes
   ```

2. **Configure 400kHz I2C Baudrate**:
   The default I2C baudrate (100kHz) is too slow to pull 768 pixels at 4Hz. Increase to 400kHz by editing `/boot/firmware/config.txt` (or `/boot/config.txt`):
   ```ini
   dtparam=i2c_arm=on
   dtparam=i2c_arm_baudrate=400000
   ```
   Save and reboot: `sudo reboot`.

3. **Verify Sensor on I2C Bus**:
   ```bash
   sudo apt-get update && sudo apt-get install -y i2c-tools
   i2cdetect -y 1
   ```
   Address `0x33` must appear in the grid:
   ```
        0  1  2  3  4  5  6  7  8  9  a  b  c  d  e  f
   00:          -- -- -- -- -- -- -- -- -- -- -- -- --
   10: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
   20: -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --
   30: -- -- -- 33 -- -- -- -- -- -- -- -- -- -- -- --
   ```

---

## 4. Software Deployment on Raspberry Pi

1. **Clone project and create virtual environment**:
   ```bash
   git clone <repo-url> ~/wildlife
   cd ~/wildlife/hardware
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install adafruit-circuitpython-mlx90640
   ```

2. **Configure Node Settings**:
   Edit `config.example.yaml`:
   ```yaml
   device:
     device_id: "WILDLINK-ROAD-001"
     secret_token: "your-assigned-device-secret-token"
     latitude: 11.6664
     longitude: 76.6291
   server:
     base_url: "https://your-cloud-wildlink-domain.com"
   thermal_sensor:
     simulate: false # Use actual hardware sensor
     refresh_rate_hz: 4
   ```

3. **Test Direct Frame Capture**:
   ```bash
   python -c "
   import board, busio, adafruit_mlx90640
   i2c = busio.I2C(board.SCL, board.SDA, frequency=400000)
   mlx = adafruit_mlx90640.MLX90640(i2c)
   frame = [0.0] * 768
   mlx.getFrame(frame)
   print('Capture success! Ambient:', min(frame), 'C, Peak:', max(frame), 'C')
   "
   ```

4. **Install Systemd Daemon for 24/7 Autostart**:
   ```bash
   sudo cp wildlink-sensor.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable wildlink-sensor.service
   sudo systemctl start wildlink-sensor.service
   sudo journalctl -u wildlink-sensor.service -f
   ```

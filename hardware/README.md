# WILDLINK IoT Edge Node & Thermal Sensor Guide

This directory contains the production software for running WILDLINK monitoring nodes on **Raspberry Pi 4 / Raspberry Pi 5** equipped with an **MLX90640** 32x24 Far-Infrared Thermal Sensor and optional optical RGB camera.

---

## 1. Hardware Pinout & Wiring (MLX90640 to Raspberry Pi)

The MLX90640 communicates via I2C (Bus 1). Connect standard breakout board to the 40-pin GPIO header:

| Sensor Pin | Raspberry Pi Pin | Description |
|------------|------------------|-------------|
| **VIN / VCC** | Pin 1 (3.3V) or Pin 2 (5V) | *Verify breakout voltage regulator! Most Adafruit/Pimoroni boards take 3.3V or 5V.* |
| **GND** | Pin 6, Pin 9 or Pin 14 | Ground |
| **SDA** | Pin 3 (GPIO 2 / I2C1 SDA) | I2C Data line |
| **SCL** | Pin 5 (GPIO 3 / I2C1 SCL) | I2C Clock line |

> [!IMPORTANT]
> **I2C Clock Speed**: MLX90640 requires 400kHz or 1MHz clock speed to read full 24x32 frames at 4Hz–8Hz without frame drops.
> Edit `/boot/config.txt` (or `/boot/firmware/config.txt` on Bookworm):
> ```bash
> dtparam=i2c_arm=on
> dtparam=i2c_arm_baudrate=400000
> ```
> Reboot afterwards with `sudo reboot`.

---

## 2. Raspberry Pi Setup Instructions

1. **Enable I2C**:
   ```bash
   sudo raspi-config
   # Navigate to: Interface Options -> I2C -> Enable -> Yes
   ```

2. **Verify Sensor Detection on I2C Bus**:
   ```bash
   sudo apt-get install -y i2c-tools python3-pip python3-venv
   i2cdetect -y 1
   ```
   *You should see address `0x33` appear in the grid.*

3. **Install Dependencies**:
   ```bash
   cd ~/wildlife/hardware
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install adafruit-circuitpython-mlx90640
   ```

4. **Test Sensor Acquisition**:
   ```bash
   # Test real sensor:
   python -c "import board, busio, adafruit_mlx90640; i2c = busio.I2C(board.SCL, board.SDA, frequency=400000); mlx = adafruit_mlx90640.MLX90640(i2c); frame = [0]*768; mlx.getFrame(frame); print('Success! Min temp:', min(frame), 'Max temp:', max(frame))"
   ```

---

## 3. Running the Node

### Simulation Mode (No hardware required / Laptop testing):
```bash
python main.py --simulate --base-url http://localhost:8000
```

### Physical Hardware Mode (On Raspberry Pi with MLX90640):
```bash
python main.py --device-id WILDLINK-ROAD-001 --base-url https://your-wildlink-domain.com
```

---

## 4. Automatic Boot via Systemd

Copy the included service file to autostart the sensor node on power-up:
```bash
sudo cp wildlink-sensor.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable wildlink-sensor.service
sudo systemctl start wildlink-sensor.service
sudo journalctl -u wildlink-sensor.service -f
```

# HVC Watcher 🔍

Watch for High Volume Closes (HVC) and unusual volume patterns.

## Features

### Volume Pattern Detection
* **High Volume Close (HVC)** 🟠 markers when volume exceeds a configurable multiple of the SMA (default: 3.0x)
* **Highest Volume Ever (HVE)** 🟢 markers for all-time high volume bars (disabled by default)
* HVE takes priority over HVC to avoid overlapping markers. When HVE display is disabled, bars that are both HVC and HVE still display as HVC.

### HVC Zones
* Horizontal zones marking the high/low range of HVC bars for support/resistance
* Fixed length (default: 90 bars) or extend to the right edge of the chart
* Configurable zone color and transparency for both fill and edges

### Volume Multiplier Labels
* Optional labels showing the exact volume multiplier (e.g., "5x") next to HVC bars
* Optional real-time multiplier for the current (incomplete) bar

### Customization Options
* **SMA Length** - Moving average period (default: 20)
* **HVC Multiplier Threshold** - Volume must be at least this many times the SMA (default: 3.0x)
* **Show HVE Markers** - Toggle Highest Volume Ever markers (default: off)
* **Shape Styles** - Choose from circles, triangles, diamonds, crosses, or X-crosses
* **Zone Settings** - Toggle zones, extend right, fixed length, color, and transparency
* **Multiplier Labels** - Toggle HVC and current bar multiplier labels with custom colors

### Alert Support 🔔
* Highest Volume Ever (HVE) alert
* High Volume Close (HVC) alert
* Combined HVE or HVC alert

### Data Window
Volume, Volume SMA, and HVE Threshold are available in TradingView's data window for inspection.

## How to Use

1. **Watch for markers**: Orange circles above bars indicate High Volume Closes
2. **Enable HVE** (optional): Turn on Highest Volume Ever markers to spot all-time volume records
3. **Use zones**: HVC zones highlight price ranges where high volume occurred, useful as support/resistance
4. **Adjust thresholds**: Tune the SMA length and multiplier threshold to match your trading style
5. **Set alerts**: Configure TradingView alerts for HVC, HVE, or both

All settings are fully configurable. Enjoy! 🤓

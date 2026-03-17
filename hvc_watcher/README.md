# HVC Watcher 🔍

Spots High Volume Closes (HVCs) on your chart and draws support/resistance zones around them. An HVC fires when a bar's volume hits a configurable multiple of its moving average (default: 3x the 20-bar SMA).

## Features

### 🔶 HVC Detection & Markers

Marks bars where volume >= multiplier × SMA with a configurable shape above the bar. Tweak the multiplier threshold, SMA length, marker color, and shape style to match your setup.

### 📐 HVC Zones

Draws horizontal zones spanning the high-to-low range of each HVC bar. These act as visual support/resistance levels. Zones can extend to the right edge of the chart or stop after a fixed number of bars.

* **Zone color & transparency** are configurable separately for the fill and edges

### 🏷️ Volume Multiplier Labels

Optionally display the rounded volume multiplier (e.g., "5x") next to HVC bars. There's also a real-time label for the current (incomplete) bar so you can watch volume build intraday.

### 🔔 Alerts

Set a TradingView alert for HVC events. Fires whenever volume crosses the multiplier threshold.

### 📊 Data Window

Volume and Volume SMA are available in TradingView's data window for quick reference.

## Settings

| Group | Setting | Default | Description |
|-------|---------|---------|-------------|
| Volume | SMA Length | 20 | Bars used for the volume SMA |
| Volume | HVC Multiplier Threshold | 3.0x | Volume must be at least this many times the SMA |
| Markers | HVC Color | 🟠 Orange | Marker color for HVC bars |
| Markers | Shape Style | Circles | circles, triangleup, diamond, cross, xcross |
| Zones | Show HVC Zones | ✅ On | Draw high/low zones on HVC bars |
| Zones | Extend Zones Right | ✅ On | Extend to right edge (off = fixed length) |
| Zones | Zone Length | 90 bars | Fixed length when extend is off |
| Zones | Zone Color | 🔵 Blue | Zone fill and edge color |
| Zones | Fill Transparency | 95% | Zone fill opacity |
| Zones | Edge Transparency | 80% | Zone border opacity |
| Labels | Show Multiplier Labels | ❌ Off | Display "Nx" labels on HVC bars |
| Labels | Show Current Bar Multiplier | ❌ Off | Real-time multiplier for the current bar |

## How to Use

1. 🔶 **Watch for markers** above price bars. Orange circle = volume hit the HVC threshold.
2. 📐 **Use the zones** as support/resistance. HVC bars often mark levels where institutional activity happened.
3. 🏷️ **Enable multiplier labels** if you want to see exactly how strong the volume spike was.
4. 🔔 **Set alerts** in TradingView to get notified on HVC events without staring at the chart.
5. ⚙️ **Tune the threshold** up if you're getting too many markers, down if you're missing important ones.

Enjoy! 🤓


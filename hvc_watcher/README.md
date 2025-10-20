# HVC Watcher 🔍

Watch for High Volume Closes (HVC) and unusual volume patterns with this comprehensive indicator!

## Features

### Volume Pattern Detection
* **Highest volumes ever** - Green markers for all-time high volume bars 🟢
* **High volume spikes** - Yellow markers for volume greater than 3x the SMA (configurable) 🟡
* **Low volume periods** - Red markers for volume under 50% of the SMA (configurable) 🔴

### Volume Filtering ⏰
Filter volume analysis to specific trading hours (NYC timezone):
* Works on both **intraday** and **daily** timeframes
* For intraday charts: filters based on bar time
* For daily charts: aggregates lower timeframe data within the time window
* Default filter: 10:30 - 15:00 NYC time

### HVC Streak Tracker 📊
Monitor momentum in High Volume Close events:
* **Automatic streak detection** - Tracks consecutive HVCs trending in the same direction
* **Directional indicators** - Shows whether HVCs are closing higher ⬆️ or lower ⬇️
* **Real-time updates** - See the current streak count as new HVCs occur
* Example: "Last 5 HVCs ⬆️ up" indicates 5 consecutive HVCs with increasing close prices

### Info Panel Display 📋
Unified information panel showing active features:
* **Configurable position** - Place in any corner or center position (default: top center)
* **Dynamic content** - Shows HVC streak and/or time filter info as enabled
* **Compact design** - Single panel with separator when both features are active
* **Visual feedback** - Background color changes based on streak direction:
  - 🟢 Soft green background when HVCs are trending up
  - 🔴 Soft red background when HVCs are trending down
  - ⚫ Black background when no streak or showing time filter only
* Example: "📊 Last 3 HVCs ⬆️ up  |  ⏰ Filter: 10:30 - 15:00 (NYC)"

### Customization Options
* **SMA Length** - Adjust the moving average period (default: 20)
* **Volume Multiplier** - Set the threshold for high volume detection (default: 3.0x)
* **Low Volume Threshold** - Define what constitutes low volume (default: 0.5x SMA)
* **Shape Styles** - Choose from circles, triangles, diamonds, crosses, or X-crosses
* **Priority Mode** - Show only the highest priority marker per bar
* **Rectangle Overlays** - Highlight high volume periods with colored rectangles
* **Multiplier Labels** - Display exact volume multiplier values
* **Real-Time Current Bar** - Track the current bar's volume multiplier in real-time

### Alert Support 🔔
* All-time high volume alerts
* High volume spike alerts

## How to Use

1. **Enable Time Filter** (optional): Turn on volume filtering to focus on specific trading hours
2. **Monitor HVC Streaks**: Watch the streak tracker table to identify momentum in high volume events
3. **Adjust Settings**: Customize thresholds, colors, and display options to match your trading style
4. **Watch for Markers**: Green = exceptional volume, Yellow = high volume, Red = unusually low volume
5. **Set Alerts**: Configure TradingView alerts for volume spikes

All settings are fully configurable. Enjoy! 🤓


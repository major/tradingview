# 📊 Volume Ratio vs SPY Indicator

A Pine Script indicator that compares the current symbol's trading volume against a benchmark symbol (default: SPY) to help identify relative volume strength or weakness.

## 🎯 What It Does

This indicator calculates and visualizes the ratio between:
- **Current Symbol Volume** ÷ **Comparison Symbol Volume** (default: SPY)

The ratio helps you understand whether the current symbol is experiencing higher or lower volume activity compared to the broader market benchmark.

## 📈 Key Features

### Visual Display
- **Color-coded columns** representing the volume ratio:
  - 🟢 **Bright Green**: High ratio (≥ 2.0) - volume significantly exceeds comparison
  - 🟢 **Light Green**: Above 1.0 - volume higher than comparison
  - 🔴 **Light Red**: Below 1.0 - volume lower than comparison
  - 🔴 **Bright Red**: Low ratio (≤ 0.5) - volume significantly below comparison

### Reference Lines
- **1.0 line**: Equal volume between symbols (baseline)
- **2.0 line**: High ratio threshold (dotted)
- **0.5 line**: Low ratio threshold (dotted)

### Optional Features
- **SMA smoothing**: Toggle a simple moving average to smooth out the ratio and identify trends
- **Customizable comparison symbol**: Compare against any symbol (SPY, QQQ, DIA, etc.)

## 🔔 Alert Conditions

The indicator includes two alert conditions:

1. **🔥 High Volume Ratio**: Triggers when ratio exceeds the high threshold (default: 2.0)
2. **❄️ Low Volume Ratio**: Triggers when ratio falls below the low threshold (default: 0.5)

## ⚙️ Configuration Options

### Main Settings
- **Comparison Symbol**: Symbol to compare against (default: `SPY`)
- **Show SMA**: Enable/disable the SMA overlay
- **SMA Length**: Period for the SMA calculation (default: 10)
- **High Ratio Alert Threshold**: Ratio value to trigger high alerts (default: 2.0)
- **Low Ratio Alert Threshold**: Ratio value to trigger low alerts (default: 0.5)

### Color Customization
All colors are fully customizable:
- High ratio color (≥ 2.0)
- Above 1.0 color
- Below 1.0 color
- Low ratio color (≤ 0.5)
- SMA line color
- Reference line color

## 💡 Use Cases

### Identifying Unusual Volume Activity
When the ratio is ≥ 2.0, the current symbol has at least twice the relative volume of the comparison symbol, which could indicate:
- Strong buying/selling pressure
- News events or earnings announcements
- Institutional activity
- Potential breakout or breakdown setups

### Spotting Weak Volume
When the ratio is ≤ 0.5, the current symbol has significantly lower relative volume, which might suggest:
- Lack of interest or participation
- Consolidation periods
- Lower volatility expectations
- Potential for range-bound trading

### Relative Strength Analysis
Comparing individual stocks against SPY helps identify:
- Stocks with stronger momentum (consistently > 1.0)
- Stocks with weaker momentum (consistently < 1.0)
- Divergences between price action and volume ratios

## 🚀 Installation

1. Open TradingView and navigate to any chart
2. Click on "Pine Editor" at the bottom of the screen
3. Copy the entire contents of `volume_ratio.pine`
4. Paste into the Pine Editor
5. Click "Add to Chart"

## 📊 Data Window Values

The indicator displays the following values in the TradingView data window (hover over any bar):
- Current Volume
- Comparison Volume
- Volume Ratio
- Volume Ratio SMA (if enabled)

## 🔧 Technical Details

- **Pine Script Version**: v6
- **Indicator Type**: Non-overlay (separate pane)
- **Format**: Volume format
- **Data Source**: Real-time volume data via `request.security()`
- **Zero Division Protection**: Handles cases where comparison volume is zero or N/A

## 📝 Example Interpretations

| Ratio Value | Meaning |
|-------------|---------|
| 2.5 | Current symbol has 2.5x the volume of SPY - very high relative activity |
| 1.5 | Current symbol has 50% more volume than SPY - elevated activity |
| 1.0 | Equal volume between symbols - neutral |
| 0.7 | Current symbol has 30% less volume than SPY - reduced activity |
| 0.3 | Current symbol has only 30% of SPY's volume - very low relative activity |

## 📄 License

Copyright 2025 Major Hayden

Licensed under the Apache License, Version 2.0. See the LICENSE file in the repository root for details.

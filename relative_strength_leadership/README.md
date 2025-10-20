# 📊 Relative Strength Leadership Indicator

## Overview

The **Relative Strength Leadership** indicator identifies critical turning points when a stock transitions from underperforming to outperforming a benchmark (like SPY), or vice versa. It's designed to catch inflection points in relative performance before they become obvious.

## What It Does

This indicator answers the question: **"Is this stock starting to lead or lag the market?"**

Instead of just showing relative strength, it detects **changes in leadership** using moving average crossovers of the relative strength ratio. This helps you spot:

- 🚀 **Bullish Turning Points**: When a lagging stock starts to outperform
- 📉 **Bearish Turning Points**: When a leading stock starts to underperform

## How It Works

### Core Calculation

1. **RS Ratio** = Stock Price / Benchmark Price (typically SPY)
   - This ratio rises when the stock outperforms
   - This ratio falls when the stock underperforms

2. **Fast Moving Average** (default: 20 periods)
   - Responsive to recent changes in relative strength
   - Catches near-term momentum shifts

3. **Slow Moving Average** (default: 50 periods)
   - Establishes the longer-term RS trend
   - Filters out short-term noise

### Signal Generation

- **🟢 Bullish Crossover**: Fast MA crosses **above** slow MA
  - The stock has been lagging but is now transitioning to leadership
  - Relative strength is accelerating upward
  - Potential entry signal for strength-based strategies

- **🔴 Bearish Crossover**: Fast MA crosses **below** slow MA
  - The stock has been leading but is now transitioning to weakness
  - Relative strength is decelerating
  - Potential exit signal or warning of underperformance ahead

## Display Features

The indicator appears in a **separate panel** below the price chart with:

1. **RS Ratio Line** (white): The actual relative strength ratio
2. **Fast MA** (aqua/cyan): 20-period moving average showing recent RS trend
3. **Slow MA** (orange): 50-period moving average showing established RS trend
4. **Background Color**:
   - 🟩 Green = Stock is currently leading (fast MA > slow MA)
   - 🟥 Red = Stock is currently lagging (fast MA < slow MA)
5. **Triangle Markers**:
   - ▲ Green triangle at bottom = Bullish turning point (transitioning to leadership)
   - ▼ Red triangle at top = Bearish turning point (transitioning to weakness)

## Settings

### Comparison Settings
- **Comparison Symbol** (default: SPY): The benchmark to compare against
  - Common choices: SPY (S&P 500), QQQ (Nasdaq), sector ETFs, industry leaders

### Moving Average Settings
- **Fast MA Length** (default: 20, range: 5-50)
  - Lower values = more responsive, more signals (may be noisier)
  - Higher values = smoother, fewer signals

- **Slow MA Length** (default: 50, range: 20-100)
  - Should always be significantly larger than fast MA
  - Typical ratios: 20/50, 10/30, 30/80

### Display Options
- **Show Crossover Markers**: Display triangles at turning points
- **Show Background Color**: Color the panel background based on leadership state
- **Normalize to 100**: Scale the RS ratio to start at 100 (like an index)
  - Useful for visual comparison across different price ranges
  - When off, shows actual price ratio

### Color Customization
All colors are fully customizable in the indicator settings.

## Usage Examples

### Example 1: Identifying Emerging Leaders
You're watching a tech stock that's been weak relative to QQQ. The indicator shows:
- Background has been red (lagging) for several weeks
- Fast MA starts curving up and crosses above slow MA
- 🟢 Green triangle appears at the bottom

**Interpretation**: The stock is transitioning from lagging to leading QQQ. This could be an early signal of improving relative strength before it's obvious on the price chart.

### Example 2: Spotting Early Weakness
You hold a position in a stock that's been outperforming SPY. The indicator shows:
- Background has been green (leading) for months
- Fast MA starts declining and crosses below slow MA
- 🔴 Red triangle appears at the top

**Interpretation**: The stock is losing relative strength momentum. Consider tightening stops or taking profits as the leadership dynamic is shifting.

### Example 3: Sector Rotation
Compare different stocks within a sector against the sector ETF to identify which names are gaining or losing leadership within their peer group.

## Timeframe Considerations

The indicator works on any timeframe, but the significance changes:

- **Daily Charts**: Catches swing trade opportunities and intermediate trends
- **Weekly Charts**: Identifies major leadership shifts, good for position trading
- **Intraday Charts**: More noise, but can catch intraday momentum shifts

**Medium-term traders** (the default configuration) typically use:
- Daily timeframe
- 20/50 MA combination
- Focus on crossovers that persist for multiple days

## Alert Conditions

The indicator includes built-in alert conditions:

1. **Bullish RS Turning Point**: Triggered when fast MA crosses above slow MA
2. **Bearish RS Turning Point**: Triggered when fast MA crosses below slow MA

To set up alerts:
1. Right-click on the indicator → Add Alert
2. Condition: Select "Bullish RS Turning Point" or "Bearish RS Turning Point"
3. Set your alert delivery preferences

## Tips for Best Results

1. **Context Matters**: Don't use this indicator in isolation
   - Confirm with price action, volume, and market conditions
   - Best signals occur when they align with support/resistance

2. **Reduce False Signals**:
   - Use longer MA periods for smoother signals
   - Wait for confirmation (e.g., 2-3 bars after crossover)
   - Filter by market conditions (trending vs choppy)

3. **Combine with Other Analysis**:
   - Use with volume indicators to confirm conviction
   - Check if crossovers happen at key price levels
   - Consider overall market trend (harder to lead in bear markets)

4. **Sector Comparison**:
   - Compare stock vs sector ETF to find sector leaders
   - Compare sectors vs SPY to identify rotating sectors

## Interpretation Notes

### Strong Bullish Signal
- Fast MA crosses above slow MA
- Background turns green
- RS ratio itself is also rising
- High volume on stock during crossover

### Strong Bearish Signal
- Fast MA crosses below slow MA
- Background turns red
- RS ratio itself is also falling
- Price making lower highs while SPY makes new highs

### Neutral/Choppy
- Many quick crossovers back and forth
- Indicates neither leadership nor clear weakness
- Wait for clearer trend before acting

## Data Window Values

When you hover over the indicator, the data window shows:
- Current Close: The stock's closing price
- Comparison Close: The benchmark's closing price
- Raw RS Ratio: The actual price ratio
- RS Ratio (Displayed): What's plotted (raw or normalized)
- Fast MA Value: Current fast moving average
- Slow MA Value: Current slow moving average

This helps with debugging and understanding the exact values behind the visuals.

## Technical Notes

- Uses `request.security()` to fetch comparison symbol data
- Prevents lookahead bias with `barmerge.lookahead_off`
- Handles division by zero gracefully
- All calculations use closing prices for consistency

## License

Copyright 2025 Major Hayden

Licensed under the Apache License, Version 2.0

# Launch Pad Setup Indicator

An early entry indicator that identifies when price consolidates tightly near key moving averages, signaling potential breakout opportunities.

## Overview

The Launch Pad setup is a volatility compression pattern that fires when the closing price converges with all three moving averages simultaneously. This equilibrium between buyers and sellers typically precedes a directional breakout.

**Reverse-engineered from:** [DeepVue's Launch Pad Indicator](https://deepvue.com/indicators/launch-pad-the-early-entry-technique/)

## Signal Logic

A Launch Pad signal triggers when the closing price is within **3%** of ALL THREE moving averages:

| Moving Average | Type | Period |
| -------------- | ---- | ------ |
| Fast MA        | SMA  | 21     |
| Medium MA      | SMA  | 50     |
| Slow MA        | EMA  | 65     |

```
Launch Pad = (|close - SMA21| / SMA21 ≤ 3%) AND
             (|close - SMA50| / SMA50 ≤ 3%) AND
             (|close - EMA65| / EMA65 ≤ 3%)
```

## Visual Style

- **Green X** marker below the candle when signal fires (matching DeepVue's style)
- Optional moving average lines overlay
- Info table showing current distances from each MA
- Customizable colors, sizes, and threshold

## Features

- Configurable proximity threshold (default 3%)
- Toggle MA visibility
- Customizable MA periods
- Info table with real-time distance calculations
- Alert conditions for new signals

## Usage

1. Add indicator to chart
2. Look for green X markers during consolidation periods
3. Signal clusters (multiple consecutive days) indicate strong setups
4. Enter on breakout from the tight range
5. Place stop at opposite end of consolidation range

## Validated Examples

| Symbol | Date(s)            | Outcome              |
| ------ | ------------------ | -------------------- |
| NVDA   | Jan 3, 2024        | +100% in 6 months    |
| FSLR   | Mar 21-26, 2024    | +20% in 3 weeks      |
| COIN   | Oct 31-Nov 1, 2023 | +150% run            |
| AVGO   | May 5-8, 2023      | +28% in 3 weeks      |

## Settings

### Signal Settings
- **Proximity Threshold (%)**: Maximum distance from MAs to trigger signal (default: 3%)

### Moving Averages
- **Show Moving Averages**: Toggle MA line visibility
- **Fast SMA Length**: Period for fast SMA (default: 21)
- **Medium SMA Length**: Period for medium SMA (default: 50)  
- **Slow EMA Length**: Period for slow EMA (default: 65)

### Visual Settings
- **Signal Color**: Color of the X marker (default: lime green)
- **Signal Size**: Size of marker (tiny/small/normal/large)
- **Show Label**: Display "Launch Pad" text label

## Alerts

- **Launch Pad Signal**: Fires on every bar where conditions are met
- **New Launch Pad Signal**: Fires only on first bar of a new signal sequence

## License

Apache License 2.0

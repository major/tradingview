# 📊 Filtered Volume Percentage Indicators

A pair of complementary TradingView indicators that help identify when "quality" volume (filtered by time) dominates versus HFT/institutional noise outside core trading hours.

## 📑 Table of Contents

- [🎯 Purpose](#-purpose)
- [📦 The Indicators](#-the-indicators)
  - [1️⃣ Filtered Volume Percentage](#1️⃣-filtered-volume-percentage-volume_filter_percentagepine)
  - [2️⃣ Filtered Volume Markers](#2️⃣-filtered-volume-markers-volume_filter_percentage_overlaypine)
- [🚀 Installation](#-installation)
  - [Step 1: Add Main Indicator](#step-1-add-main-indicator)
  - [Step 2: Add Overlay Indicator](#step-2-add-overlay-indicator)
  - [Step 3: Synchronize Settings](#step-3-synchronize-settings-)
- [⚙️ Settings Guide](#️-settings-guide)
  - [Volume Filtering Hours (NYC Time)](#volume-filtering-hours-nyc-time)
  - [Color Zone Thresholds](#color-zone-thresholds)
  - [Headband Settings](#headband-settings-main-indicator-only)
  - [Marker Settings](#marker-settings-overlay-only)
- [📖 How It Works](#-how-it-works)
  - [Calculation Method](#calculation-method)
  - [Example](#example)
- [🎓 Trading Insights](#-trading-insights)
  - [What to Look For](#what-to-look-for)
  - [Pattern Recognition](#pattern-recognition)
  - [🔍 Advanced Interpretation: Understanding Volume Discrepancies](#-advanced-interpretation-understanding-volume-discrepancies)
  - [Headband Statistics](#headband-statistics)
- [💡 Usage Tips](#-usage-tips)
- [🎯 Quick Reference: Diagnostic Decision Tree](#-quick-reference-diagnostic-decision-tree)
  - [Step 1: Calculate the Gap](#step-1-calculate-the-gap)
  - [Step 2: Check Absolute Filtered Volume](#step-2-check-absolute-filtered-volume)
  - [Step 3: Analyze Multi-Day Context](#step-3-analyze-multi-day-context)
  - [Step 4: Confirm with Price Action](#step-4-confirm-with-price-action)
  - [Quick Action Matrix](#quick-action-matrix)
- [🔧 Technical Details](#-technical-details)
- [📝 License](#-license)
- [🤝 Contributing](#-contributing)
- [⚠️ Disclaimer](#️-disclaimer)

## 🎯 Purpose

These indicators answer the question: **"What percentage of today's volume occurred during my filtered time period?"**

This helps you identify:
- Days when quality institutional volume dominated (high %)
- Days when HFT/pre-market/after-hours noise dominated (low %)
- Patterns in volume distribution across different market conditions

## 📦 The Indicators

### 1️⃣ Filtered Volume Percentage (`volume_filter_percentage.pine`)

**Main indicator** - Displays in a separate pane below your chart.

**Features:**
- 📊 Vertical bars showing filtered volume percentage (0-100%)
- 🎨 Color-coded bars:
  - 🔴 **Red**: < 30% (most volume was outside filtered hours - noise dominated)
  - ⚪ **White**: 30-70% (balanced volume distribution)
  - 🟢 **Green**: > 70% (most volume was during filtered hours - quality dominated)
- 📈 Reference lines at 30%, 50%, and 70%
- 📋 Headband showing:
  - Time filter settings (e.g., "⏰ 10:30 - 15:00 (NYC)")
  - Statistics: Count of green/red bars in last N periods

**Performance optimizations:**
- ⚡ Conditional lower timeframe fetching (only when needed)
- ⚡ 30-minute aggregation for daily+ charts (vs 5-min for better performance)
- ⚡ Single-pass calculation

### 2️⃣ Filtered Volume Markers (`volume_filter_percentage_overlay.pine`)

**Companion indicator** - Overlays directly on your price chart.

**Features:**
- 🟢 Green circles below bars when filtered volume > 70% (high quality)
- 🔴 Red circles below bars when filtered volume < 30% (noise dominated)
- 🔘 Auto-sized circles
- ⚙️ Toggles to show/hide green or red markers independently

## 🚀 Installation

### Step 1: Add Main Indicator

1. Open TradingView and go to the Pine Editor
2. Copy the contents of `volume_filter_percentage.pine`
3. Paste into Pine Editor
4. Click "Add to Chart"
5. The indicator will appear in a separate pane below your chart

### Step 2: Add Overlay Indicator

1. In Pine Editor, create a new script
2. Copy the contents of `volume_filter_percentage_overlay.pine`
3. Paste into Pine Editor
4. Click "Add to Chart"
5. Circles will now appear on your price chart

### Step 3: Synchronize Settings ⚙️

**Important**: Both indicators must have matching settings!

Configure these settings **identically on both indicators**:
- **Start Hour**: Default 10 (10:00 AM NYC)
- **Start Minute**: Default 30
- **End Hour**: Default 15 (3:00 PM NYC)
- **End Minute**: Default 00
- **Low Threshold**: Default 30%
- **High Threshold**: Default 70%

💡 **Tip**: The default settings filter for **10:30 AM - 3:00 PM NYC time**, which excludes:
- Pre-market noise (before 10:30 AM)
- Opening volatility/HFT activity
- Late afternoon low-volume periods

## ⚙️ Settings Guide

### Volume Filtering Hours (NYC Time)

| Setting | Default | Description |
|---------|---------|-------------|
| Start Hour | 10 | Start of filtered period (24-hour format) |
| Start Minute | 30 | Minute component of start time |
| End Hour | 15 | End of filtered period (24-hour format) |
| End Minute | 00 | Minute component of end time |

**Example Configurations:**
- **Core hours only**: 10:30 - 15:00 (default)
- **Full trading day**: 09:30 - 16:00
- **Mid-day only**: 11:00 - 14:00

### Color Zone Thresholds

| Setting | Default | Description |
|---------|---------|-------------|
| Low Threshold | 30% | Below this = red bars/markers |
| High Threshold | 70% | Above this = green bars/markers |

### Headband Settings (Main Indicator Only)

| Setting | Default | Description |
|---------|---------|-------------|
| Show Time Filter Headband | ✅ True | Display info banner |
| Headband Position | Bottom Center | Where to place the banner |
| Stats Lookback Period | 200 | How many bars to analyze for statistics |

### Marker Settings (Overlay Only)

| Setting | Default | Description |
|---------|---------|-------------|
| Show Green Markers | ✅ True | Show circles for high-quality volume days |
| Show Red Markers | ✅ True | Show circles for noise-dominated days |

## 📖 How It Works

### Calculation Method

1. **For intraday charts** (1m, 5m, 15m, 1h, etc.):
   - Checks if current bar's time falls within filtered range
   - Filtered volume = bar volume if in range, 0 if outside

2. **For daily charts and higher** (D, W, M):
   - Fetches 30-minute lower timeframe bars
   - Sums volume from all 30-min bars within filtered time range = **filtered volume**
   - Sums volume from all 30-min bars for the day = **unfiltered volume**
   - Percentage = (filtered / unfiltered) × 100

### Example

Let's say on a daily bar:
- **Total volume**: 10,000,000 shares
- **Volume from 10:30 AM - 3:00 PM**: 7,500,000 shares
- **Percentage**: 75%
- **Result**: 🟢 Green bar (>70% threshold)

This tells you that 75% of the day's volume occurred during core trading hours - a sign of quality institutional activity rather than HFT noise.

## 🎓 Trading Insights

### What to Look For

#### 🟢 High Percentage Days (Green Bars/Circles)
**Interpretation**: Most volume occurred during your filtered period
- ✅ Institutional participation
- ✅ Quality price discovery
- ✅ More reliable price action
- 📈 Breakouts/breakdowns may be more significant

#### 🔴 Low Percentage Days (Red Bars/Circles)
**Interpretation**: Most volume was outside your filtered period
- ⚠️ HFT/algorithmic noise dominated
- ⚠️ Pre-market or after-hours driven
- ⚠️ Less reliable price action
- 📉 Breakouts/breakdowns may be false signals

#### ⚪ Middle Range (White Bars)
**Interpretation**: Balanced volume distribution
- 🤷 Mixed participation
- 🤷 No clear dominance of quality vs noise

### Pattern Recognition

**Consistent Green Bars** = Strong institutional interest, reliable trends

**Green → Red transition** = Quality participation fading, potential trend exhaustion

**Red → Green transition** = Institutions returning, potential trend resumption

**Mostly White Bars** = Consolidation, waiting for catalyst

### 🔍 Advanced Interpretation: Understanding Volume Discrepancies

The power of these indicators lies in understanding **when and why** filtered volume differs from total volume. Here are the key patterns to recognize:

#### 🔴 Large Gap (Low % - Red Bars): Noise Dominated Trading

**Pattern**: Filtered volume is significantly lower than total volume (< 30%)

**What this typically means:**
1. **HFT/Algorithmic Activity** (Most Common)
   - High-frequency traders dominate first/last 30 minutes
   - Creates message traffic spikes and stale quotes
   - Volume is NOT organic institutional buying/selling
   - **Action**: ⚠️ Fade this signal - treat as noise, not conviction

2. **Market-On-Open/Close Orders**
   - Mutual funds and ETF rebalancing
   - Index reconstitution flows
   - Passive mechanical flows, not directional bets
   - **Action**: ⚠️ Ignore for directional signals

3. **Retail Panic/FOMO**
   - News released at market open triggers emotional trading
   - Overnight gaps cause reactive trading
   - Often reverses as institutions step in during quality hours
   - **Action**: ⚠️ Consider as counter-indicator

**Example**: Stock shows 10M total volume but only 3M during 10:30-15:00 (30%). This 70% gap suggests most activity was open/close noise - likely HFT activity or mechanical rebalancing rather than institutional positioning.

#### 🟢 Small Gap (High % - Green Bars): Quality Institutional Flow

**Pattern**: Filtered volume nearly matches total volume (> 70%)

**What this typically means:**
1. **Institutional Accumulation/Distribution** (Most Common)
   - Smart money deliberately trades during quality hours
   - Avoids open/close volatility and information asymmetry
   - Uses careful execution, often via dark pools
   - **Action**: ✅ Follow this signal - represents real conviction

2. **Intraday News/Catalyst**
   - Important announcement during trading hours (FDA approval, analyst upgrade)
   - Market reacts during quality hours, not open/close
   - Immediate informed response
   - **Action**: ✅ Strong signal - legitimate market reaction

3. **Block Trades**
   - Large institutional prints executed away from volatile periods
   - Shows conviction at specific price levels
   - Often precedes larger moves
   - **Action**: ✅ Very significant - watch for follow-through

**Institutional Accumulation Checklist:**
- ✅ Filtered volume > 2x its 20-day average
- ✅ Total volume NOT dramatically elevated (rules out noise)
- ✅ Price action steady, not gap-and-run
- ✅ Pattern persists over multiple days
- ✅ No major news (suggests informed positioning)

**Example**: Stock shows 5M total volume with 4.5M during quality hours (90%). This small 10% gap indicates institutions are actively positioning - particularly bullish if this pattern builds over 3-5 days.

#### 🌊 Both Elevated: Market-Wide Events

**Pattern**: Both filtered AND total volume surge proportionally

**What this typically means:**
1. **Macro Events** (FOMC, Fed announcements)
   - Affects all stocks simultaneously
   - Both quality and noise hours spike
   - Even "quality" hours become corrupted with reactive flows
   - **Action**: ⚠️ Wait it out - edge diminishes in chaos

2. **Volatility Spikes / Market Crashes**
   - VIX surges correlate with message traffic increases
   - Everyone trading simultaneously
   - Extreme staleness even during normal quality hours
   - **Action**: 🛑 Step aside - your filtering edge disappears

3. **Sector-Wide Catalysts**
   - FDA approves entire drug class
   - New regulations affect whole industry
   - Sector rotation events
   - **Action**: ⚠️ Trade only sector leaders, avoid laggards

**Key Diagnostic**: Compare your stock's volume spike to SPY. If both moving proportionally together (correlation > 0.8), it's market-wide, not stock-specific.

#### 📅 Multi-Day Pattern Analysis

The most powerful signals emerge from **sequences** over time:

**Building Quality Volume (Very Bullish)**
```
Day 1: Total 5M, Filtered 4M (80% quality)
Day 2: Total 7M, Filtered 6M (86% quality)
Day 3: Total 10M, Filtered 9M (90% quality)
```
- Gap shrinking while volume builds = increasing institutional conviction
- Often precedes major moves
- Classic accumulation pattern before breakout
- **Action**: ✅✅ High-conviction signal

**Consistent Noise Pattern (Neutral)**
```
Day 1: Total 10M, Filtered 4M (60% gap)
Day 2: Total 12M, Filtered 5M (58% gap)
Day 3: Total 11M, Filtered 4.5M (59% gap)
```
- Repetitive pattern suggests algorithmic/systematic flow
- Could be ETF rebalancing over multiple days
- NOT directional signal
- **Action**: 📊 Ignore pattern, wait for change

**Bullish Divergence (Very Bullish)**
```
Week shows: Price down 4% BUT filtered volume up 150%
```
- Price declining on low open/close volume (mechanical selling)
- Institutions accumulating during quality hours (hidden buying)
- Classic "shakeout before markup"
- **Action**: ✅✅ Strong buy signal - institutions buying the dip

**Bearish Divergence (Warning)**
```
Stock rallying BUT filtered volume declining
```
- Price rising on mechanical MOC/MOO flows
- Institutions NOT participating during quality hours
- Likely unsustainable rally
- **Action**: ⚠️ Be cautious - rally lacks institutional support

### Headband Statistics

The headband shows: `Last 200 bars: 🟢 45 | 🔴 12`

This means:
- Out of last 200 bars, 45 had high-quality volume (>70%)
- 12 bars had noise-dominated volume (<30%)
- Remaining 143 bars were in the middle range

**High green count** = Stock seeing consistent institutional activity
**High red count** = Stock dominated by HFT/noise, be cautious

## 💡 Usage Tips

1. **Match your trading style**: Adjust the time filter to match when YOU trade
2. **Compare stocks**: Stocks with higher average percentages may offer better quality setups
3. **Confirm with price action**: High percentage + strong close = more conviction
4. **Watch for divergences**: Price up but volume % declining = potential warning
5. **Different timeframes**: Works on both intraday (for that day's quality) and daily (for each day's quality)

## 🎯 Quick Reference: Diagnostic Decision Tree

Use this flowchart when analyzing volume patterns:

### Step 1: Calculate the Gap
```
Gap = (Total Volume - Filtered Volume) / Total Volume × 100

Gap > 50%  → Extreme noise (likely HFT/algo dominated)
Gap 30-50% → Moderate noise (check other factors)
Gap < 30%  → High quality signal (institutions active)
```

### Step 2: Check Absolute Filtered Volume
```
Is filtered volume elevated (>2x its 20-day average)?

✅ YES + Small gap (<30%)  → STRONG SIGNAL - Institutional activity
⚠️  YES + Large gap (>50%) → MIXED - Could be market-wide event
📊 NO + Small gap          → Quiet day, no clear signal
🚫 NO + Large gap          → Pure noise trading, avoid
```

### Step 3: Analyze Multi-Day Context
```
Is this a 1-day anomaly?
└─ Likely news-driven, wait for confirmation

Is this a 3-5 day building pattern?
└─ Institutional positioning, HIGH CONFIDENCE signal

Does this happen every single day?
└─ Systematic/algorithmic flow, ignore
```

### Step 4: Confirm with Price Action
```
Quality volume ↑ + Price ↑ → BULLISH ✅
Quality volume ↑ + Price ↓ → VERY BULLISH ✅✅ (divergence/accumulation)
Quality volume ↓ + Price ↑ → BEARISH ⚠️ (no institutional follow-through)
Quality volume ↓ + Price ↓ → Noise, no actionable signal
```

### Quick Action Matrix

| Filtered % | Filtered Vol vs Avg | Price Action | Signal | Action |
|-----------|---------------------|--------------|--------|---------|
| >70% (Green) | >2x average | Rising | Strong Bullish | ✅✅ Long |
| >70% (Green) | >2x average | Falling | Very Bullish | ✅✅ Long (divergence) |
| <30% (Red) | Normal | Any | Noise | 🚫 Avoid |
| 30-70% (White) | >3x average | Any | Market chaos | ⚠️ Wait |
| >70% 3+ days | Increasing | Rising | Accumulation | ✅✅ High conviction |

## 🔧 Technical Details

- **Pine Script Version**: 6 (for v5 compatibility, change to `//@version=5`)
- **Dynamic Requests**: Enabled for conditional lower timeframe fetching
- **Aggregation Timeframe**: 30 minutes (optimized for performance)
- **Timezone**: America/New_York (configurable in code)

## 📝 License

Copyright 2025 Major Hayden

Licensed under the Apache License, Version 2.0. See LICENSE file for details.

## 🤝 Contributing

This is part of a collection of open-source TradingView indicators. Feel free to fork, modify, and share!

## ⚠️ Disclaimer

These indicators are for informational purposes only. They do not constitute financial advice. Always do your own research and consult with a qualified financial advisor before making trading decisions.

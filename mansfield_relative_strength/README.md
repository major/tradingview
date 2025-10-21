# 📈 Mansfield Relative Strength (Weinstein Method)

A TradingView Pine Script implementation of Stan Weinstein's Mansfield Relative Strength indicator, a cornerstone of his Stage Analysis methodology for identifying market leaders and laggards.

## 📚 Background

The Mansfield Relative Strength (MRS) is a key technical indicator developed by Stan Weinstein and detailed in his seminal book:

> **Weinstein, S. (1988). *Secrets for Profiting in Bull and Bear Markets*. New York: McGraw-Hill.**

Unlike the popular RSI (Relative Strength Index) which measures momentum, the Mansfield RS measures how a stock performs **relative to a benchmark index** over time. This makes it ideal for identifying true market leaders that are outperforming the broader market.

## ✨ Visual Features

This enhanced implementation includes several visual aids to make Stage Analysis easier:

- 🎨 **Color-Coded Line**: Green when outperforming (MRS ≥ 0), Red when underperforming (MRS < 0)
- 📊 **Compact Info Table**: Real-time display of current stage and trend direction
- 🏷️ **Stage Transition Markers**: Optional labels marking Stage 2 (BUY) and Stage 4 (AVOID) entries
- ⚪ **Dotted Zero Line**: Subtle reference showing the critical dividing line
- 🎯 **Stage Smoothing**: Configurable sensitivity to reduce noise and stage flipping

All visual elements are configurable - turn them on/off and position them to your preference!

## 🧮 The Formula

The Mansfield Relative Strength calculation follows a two-step process as defined by Weinstein:

### Step 1: Calculate Relative Performance (RP)
```
RP = (Stock Close / Index Close) × 100
```

### Step 2: Calculate Mansfield Relative Strength (MRS)
```
MRS = ((RP / SMA(RP, n)) - 1) × 100
```

**Where:**
- **n = 52** for weekly charts (Weinstein's primary timeframe)
- **n = 200** for daily charts (alternative)
- **SMA** = Simple Moving Average
- **Default benchmark** = S&P 500 Index

## 🎯 Interpretation

The Mansfield RS oscillates around a **zero line**, which serves as the key reference point:

- **MRS > 0** 📊 Stock is **outperforming** the index relative to its historical average
- **MRS = 0** ➡️ Stock is performing **exactly at** its historical average pace
- **MRS < 0** 📉 Stock is **underperforming** the index relative to its historical average

### What Makes It Unique

As Weinstein explains in his book:

> *"The formula for measuring relative strength is simply the price of a stock (or group average) divided by the price of a market average."* (Weinstein, 1988, p. 18)

He further clarifies:

> *"How a given stock (or group) acts in relation to the overall market. For instance, if stock XYZ rallies 10 percent while the market moves ahead 20 percent, that's poor relative strength even though the stock has advanced. On the other hand, if stock XYZ declines 10 percent while the market averages decline 20 percent, that's favorable relative strength even though the stock has moved lower."* (Weinstein, 1988, p. 18)

## 🔄 Weinstein's Stage Analysis

The Mansfield RS is a critical component of Weinstein's four-stage market cycle analysis. Understanding these stages is essential for successful trading:

### Stage 1: Basing / Accumulation 📉➡️
- **MRS Behavior:** Typically below zero, starting to stabilize
- **Characteristics:** Downtrend ending, base forming
- **52-week MA:** Flattening out
- **Action:** Watch and wait; prepare for potential Stage 2 breakout

### Stage 2: Advancing / Markup 🚀✅
- **MRS Behavior:** **Crosses above zero and continues rising**
- **Characteristics:** Uptrend confirmed, strong price momentum
- **52-week MA:** Rising
- **Action:** ✅ **BEST TIME TO BUY** - Enter long positions
- **Critical Rule:** Weinstein emphasized that for Stage 2 breakouts, the MRS should be rising and close to or above zero. Breakouts occurring below a still-declining MRS have a higher probability of failure.

### Stage 3: Topping / Distribution ➡️📈
- **MRS Behavior:** Still above zero but starting to decline or flatten
- **Characteristics:** Uptrend losing momentum, potential top forming
- **52-week MA:** Flattening out
- **Action:** Take profits, tighten stops, prepare to exit

### Stage 4: Declining / Markdown 📉❌
- **MRS Behavior:** **Below zero and declining**
- **Characteristics:** Confirmed downtrend, price below declining MA
- **52-week MA:** Declining
- **Action:** ❌ **AVOID OR SHORT** - Stay out or take short positions

## ⚙️ Indicator Settings

### Input Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Benchmark Symbol** | `SPCFD:SPX` | Index to compare against (S&P 500) |
| **Timeframe** | `W` (Weekly) | Data resolution - Weinstein used weekly charts |
| **MA Length** | `52` | Moving average period (52 for weekly, 200 for daily) |
| **Stage Smoothing** | `3` | Bars required to confirm trend change (reduces stage flipping) |

### Display Options

| Parameter | Default | Description |
|-----------|---------|-------------|
| **Color-Coded MRS Line** | `true` | Green above zero (outperforming), Red below zero (underperforming) |
| **Stage Transition Markers** | `false` | Show labels when entering Stage 2 (BUY) or Stage 4 (AVOID) |
| **Show Info Table** | `true` | Display compact status bar showing current stage and trend |
| **Table Position** | `top_center` | Position of info table (9 positions available) |

### Recommended Settings

**For Weekly Analysis (Weinstein's Method):** ⭐
- Timeframe: `W` (Weekly)
- MA Length: `52`
- Stage Smoothing: `3`
- Chart: **Any timeframe** - the indicator will use weekly data regardless!

**For Daily Analysis:**
- Timeframe: `D` (Daily)
- MA Length: `200`
- Stage Smoothing: `5-7` (daily data is noisier, use more smoothing)
- Chart: **Any timeframe**

**💡 Pro Tip:** View a daily chart but set Timeframe to `W` for the best of both worlds - see daily price action while analyzing weekly relative strength!

## 🚀 How to Use

### Installation

1. Open TradingView and navigate to your chart
2. Open the Pine Editor (bottom of screen)
3. Copy the entire contents of `mansfield_relative_strength.pine`
4. Paste into Pine Editor
5. Click **"Add to Chart"**

### Trading with Stage Analysis

Following Weinstein's methodology from *Secrets for Profiting in Bull and Bear Markets*:

1. **Identify Stage 2 Candidates** 🔍
   - Look for stocks where MRS is rising and approaching/crossing zero
   - Confirm price is above rising 30-week moving average
   - Wait for breakout from base on high volume

2. **Entry Timing** 🎯
   - Enter when MRS crosses above zero with rising momentum
   - Price should break out from Stage 1 base
   - Volume should expand on breakout

3. **Hold During Stage 2** 💎
   - Stay invested while MRS remains positive and rising
   - Use 30-week MA as trailing stop guide
   - Monitor for signs of Stage 3 transition

4. **Exit Signals** 🚪
   - MRS peaks and starts declining (Stage 3 warning)
   - MRS crosses back below zero (Stage 4 confirmed)
   - Price breaks below 30-week MA on heavy volume

5. **Avoid Stage 4 Stocks** 🚫
   - Never buy stocks with declining MRS below zero
   - Wait for complete Stage 1 base formation
   - Be patient - stages can last months or years

## ⚡ Key Improvements in This Version

This corrected and enhanced implementation includes several critical improvements over the original:

### 🛡️ Critical Bug Fixes

**Repainting Protection:**
- Added `lookahead=barmerge.lookahead_off` to prevent historical data changes
- Ensures signals don't change after the fact

**Timeframe Mismatch Fixed:**
- **CRITICAL FIX:** Both stock and benchmark now use the same timeframe
- Original had stock using chart timeframe while benchmark used weekly
- Now both symbols correctly use the configured `Timeframe` setting
- Ensures accurate apples-to-apples comparison

### 🎨 Visual Enhancements

**Simplified Color-Coded Line:**
- 🟢 Green when MRS ≥ 0 (outperforming market)
- 🔴 Red when MRS < 0 (underperforming market)
- Much cleaner than constantly changing 4-color scheme
- Instantly shows market position at a glance

**Stage Transition Markers (Optional):**
- Labels automatically mark Stage 2 entries (BUY signals) ✓
- Labels automatically mark Stage 4 entries (AVOID signals) ✗
- Off by default to keep chart clean
- Enable in settings when you want explicit signals

**Compact Info Table:**
- Real-time stage and trend display
- Single-line horizontal format (won't cover indicator)
- Configurable position (9 locations)
- Color-coded stage indication

**Refined Zero Line:**
- White dotted line for subtle reference
- Less visually distracting than solid blue

### 🎯 Stage Detection Improvements

**Stage Smoothing:**
- Configurable lookback period (default: 3 bars)
- Eliminates constant stage flipping from weekly noise
- Requires consistent trend over multiple bars
- Adjustable from 1-10 bars for different sensitivities

### 📊 Flexibility & Accuracy

**True Multi-Timeframe Capability:**
- View indicator on ANY chart timeframe
- Calculations always use configured timeframe
- Perfect for Weinstein's weekly analysis on daily charts
- User-configurable timeframe input

### 📝 Better Documentation
- Comprehensive inline comments
- Weinstein Stage Analysis reference guide
- Clear variable names and tooltips
- Proper book citations

### ⚙️ Modern Pine Script
- Upgraded to Pine Script v6
- Follows current best practices
- Apache 2.0 licensed (open source)

## 📊 Example Use Cases

### Finding Market Leaders
Compare multiple stocks in the same sector:
- Stock with MRS > 0 and rising = Sector leader ✅
- Stock with MRS < 0 and falling = Sector laggard ❌
- Buy the leaders, avoid the laggards

### Market Timing
Use with broader market analysis:
- Many stocks entering Stage 2 = Bull market ✅
- Many stocks entering Stage 4 = Bear market ❌
- Adjust strategy based on overall market stage

### Relative Rotation
Track sector rotation:
- Rising MRS in Technology = Tech sector strengthening
- Falling MRS in Utilities = Defensive sector weakening
- Rotate into sectors showing Stage 2 characteristics

## 🔬 Technical Notes

### Repainting Prevention
The indicator uses `lookahead=barmerge.lookahead_off` on both `request.security()` calls to ensure that higher timeframe data doesn't repaint. This means historical signals remain stable and accurate for backtesting.

### Multi-Timeframe Architecture
**Key Feature:** Both the stock and benchmark data are fetched at the **same configured timeframe**, ensuring accurate relative strength calculations.

```pinescript
benchmarkClose = request.security(sym, resolution, close, lookahead=barmerge.lookahead_off)
stockClose = request.security(syminfo.tickerid, resolution, close, lookahead=barmerge.lookahead_off)
```

This means:
- 📊 **Chart timeframe**: Independent - use any timeframe you prefer for viewing
- 📈 **Indicator timeframe**: Controlled by the `Timeframe` setting
- ✅ **Both symbols**: Always compared at the same resolution

**Example:** View a 4-hour chart with `Timeframe = W` setting:
- Your chart shows 4-hour candles (for detailed price action)
- The indicator calculates using weekly data for both stock and S&P 500
- Perfect for day trading with weekly stage context!

### Stage Smoothing Algorithm
The stage detection uses `ta.rising()` and `ta.falling()` with a configurable lookback:

```pinescript
mrsRising = ta.rising(mansfieldRS, stageSmoothingPeriod)  // Default: 3 bars
```

**How it works:**
- `stageSmoothingPeriod = 3`: MRS must rise for 3 consecutive bars to confirm "rising"
- Prevents stage flipping from single-bar noise
- Higher values = more stable stages, slower to react
- Lower values = more responsive, but may flip more

**Recommended values:**
- Weekly data: 3-4 bars
- Daily data: 5-7 bars (more noise, needs more smoothing)

### Timeframe Considerations
- **Weekly analysis:** Use `Timeframe = W`, `MA Length = 52` (Weinstein's preferred method)
- **Daily analysis:** Use `Timeframe = D`, `MA Length = 200` (approximately one trading year)
- **Avoid lower timeframes:** Stage Analysis works best on weekly/daily data for the indicator timeframe

### Data Requirements
- Requires at least 52 bars (weeks/days) of data for accurate MA calculation
- Historical data needed for both stock and benchmark symbol
- TradingView premium may be required for certain timeframes/symbols

## 📖 Further Reading

For a deep dive into Stage Analysis and the Mansfield Relative Strength methodology, consult the original source:

**Weinstein, S. (1988). *Secrets for Profiting in Bull and Bear Markets*. New York: McGraw-Hill.**

Key chapters:
- Chapter 1: All the Right Moves
- Chapter 2: A Matter of Timing
- Chapter 3: When to Buy (Stage Analysis fundamentals)

Additional resources:
- [Stage Analysis Website](https://www.stageanalysis.net/) - Community and education
- [Stan Weinstein's Methodology](https://www.stageanalysis.net/blog/) - Articles and tutorials

## 📄 License

Copyright 2025

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Original version © stageanalysis

## 🤝 Contributing

Found an issue or have an improvement? Contributions are welcome! Please ensure any modifications maintain accuracy with Weinstein's original methodology.

## ⚠️ Disclaimer

This indicator is provided for educational purposes only. Trading stocks involves risk, including the potential loss of principal. Past performance does not guarantee future results. Always conduct your own research and consider consulting with a financial advisor before making investment decisions.

---

**Happy Trading!** 📈✨ May you catch all the Stage 2 breakouts! 🚀

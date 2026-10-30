# 📈 Mansfield Relative Strength (Weinstein Method)

## 🎯 Weekly crossover overlay

Use **[`mansfield_relative_strength_overlay.pine`](mansfield_relative_strength_overlay.pine)** for zero-crossing markers directly on the price chart, without a separate indicator pane. It uses Pine Script v6 and requires a **standard 1W chart**.

### Calculation and signal rules

The overlay calculates the stock/benchmark price ratio on each weekly bar, then normalizes it against its own **52-observation weekly SMA**:

```text
Ratio = Weekly Stock Close / Weekly Benchmark Close
Mansfield RS = 100 × (Ratio / SMA(Ratio, 52) - 1)
```

- 🟢 A small `RS` triangle appears below a completed weekly candle when RS crosses from **at or below zero to above zero**, provided another signal is allowed.
- 🔒 After that signal, another crossing is blocked until RS closes **strictly below the reset level**, which defaults to **−1.0**. Touching −1.0 does not reset it.
- 🕒 A **2-week cooldown** also blocks signals on the next two weekly bars after an accepted signal. The earliest possible repeat is on the third following bar, provided RS has reset and makes a fresh upward crossing. Setting the cooldown to `0` disables only the time filter.
- 🔁 RS may reset during cooldown. Ignored crossings do not restart the timer, consume eligibility, or queue a marker when the cooldown expires.
- 🔁 Small dips below zero therefore do not create repeated markers. This changes signal eligibility, not the Mansfield calculation.
- ⏳ Open weekly candles cannot generate markers, alerts, or eligibility changes. There is no additional one-week delay after a qualifying weekly close.
- 🏁 The first valid crossover is eligible without a prior reset. A first valid reading already above zero is not a crossover.
- 📊 The Data Window shows confirmed **Mansfield RS** to four decimal places and **Ready for Next Crossover** (`1` means both reset and cooldown rules allow a crossing on that bar; `0` means waiting for either rule, or a signal just occurred). Readiness is hidden until both current and previous weekly RS values are valid. Open-week values are hidden.
- 👻 Both numeric plots use invisible colors and disable Style editing so only crossover markers can draw on the price chart. When updating an older instance that shows blue lines, remove it and add the updated indicator again to clear saved Style overrides.
- 🎨 Marker and text controls live in **Inputs → Display** only, not in the Style tab. Toggle markers or just the `RS` text, and choose marker and text colors independently. Display settings do not change signals, reset/cooldown state, or alerts.

| Setting | Default | Meaning |
|---|---|---|
| Benchmark | `SP:SPX` | S&P 500 price index |
| Reset Distance Below Zero | `1.0` | After a signal, require RS strictly below −1.0 before another signal |
| Cooldown Weeks | `2` | Suppress signals on the next two weekly bars; `0` disables the cooldown |
| Show Markers | `true` | Show the triangle and, when enabled, its text; hiding them does not disable alerts |
| Marker Color | Lime | Color of the upward triangle |
| Show RS Text | `true` | Show or hide `RS` text without hiding the triangle |
| Text Color | Lime | Independent color for the `RS` text |

The reset distance is measured in Mansfield RS points. RS of −1.0 means the price ratio is 1% below its 52-observation average, not that the stock lost 1%. The default is a starting choice, not an optimized threshold. Larger reset distances filter more repeat signals. At `0.0`, a strictly negative close is still required to reset; merely touching zero does not reset.

Crossing and reset comparisons use **unrounded values**, not the displayed decimals. For example, RS of `+0.004` is positive and `−1.004` is below the default reset level. Four displayed decimal places help inspect these boundaries but do not change the calculation.

The cooldown counts weekly chart bars, not calendar weeks with no chart bar. It does not delay the first eligible crossing. Its two-week default is a starting choice, not a backtested optimum. Markers and alerts share the same reset and cooldown rules.

**Example:** RS values `−2.00, +0.20, −0.15, +0.30, −0.40, +0.10, −1.20, +0.15` produce markers only at the first `+0.20` and the final `+0.15` with the default reset.

### Install and test in TradingView

1. Open a US stock on a standard **1W candlestick chart** with at least 53 weeks of available history.
2. Paste `mansfield_relative_strength_overlay.pine` into a new indicator in Pine Editor, save, and select **Add to chart**.
3. Keep `SP:SPX`, reset distance `1.0`, and cooldown `2` for the initial check. Remove or hide the old pane indicator if you do not want that pane.
4. Open the **Data Window** and inspect historical `RS` triangles. The current and previous weekly RS should be valid, with the previous value at or below zero and the current value above zero.
5. Between two triangles, verify that at least one completed weekly RS was **below −1.0**. The next two weekly bars after a triangle must not have another triangle, even after a deep reset. A shallow dip and rebound should not add a triangle either.
6. Use **Bar Replay** to advance one weekly candle at a time. Confirm the first eligible crossing, shallow-recross suppression, and rearming after a deeper dip. An open live weekly candle must not show a provisional triangle.
7. Change reset distance to `2.0` and check that repeat signals require a deeper reset. Set it to `0.0` to permit resets on any strictly negative weekly close. Set cooldown to `0` to check depth-only filtering, then restore `2`. A blocked crossing must not produce a delayed marker if RS remains above zero when cooldown ends. Changing settings recalculates historical eligibility.
8. Create an alert using **Mansfield RS Weekly Zero Cross** and **Once Per Bar Close**. Alerts are not created automatically and do not fire retroactively for historical markers. Recreate alerts after changing inputs because TradingView saves an alert's script/input snapshot.
9. Switch temporarily to `1D`, `2W`, or a Heikin Ashi chart. The indicator should show a clear error instead of silently calculating a different variant.
10. Return to `1W` and toggle the chart's dividend adjustment. The overlay's historical RS values and markers should remain unchanged because both requested price series explicitly use split adjustment only.
11. Under **Inputs → Display**, change marker and text colors separately. Turn off **Show RS Text** and confirm triangles remain; turn off **Show Markers** and confirm both disappear. The Style tab should not offer a duplicate marker color picker. Alert and eligibility conditions must remain unchanged.

### Data policy and limitations

- Both legs explicitly use **regular-session, split-adjusted prices**, regardless of chart dividend settings. This is price-relative strength, not total-return relative strength.
- Intended use is US stocks against an aligned US benchmark. Weekly chart confirmation does not guarantee that a benchmark in a different market has also closed. Cross-market calendars and session differences need separate validation.
- Benchmark gaps are forward-filled. `ta.sma` uses 52 valid ratios and ignores missing values, so missing data can extend the warm-up beyond 52 chart weeks. Missing or nonpositive values returned by the requests are excluded. Forward-filled benchmark gaps can still produce signals using a stale benchmark close; the validity guards do not establish data freshness.
- The overlay uses the chart's weekly context throughout. It does not request weekly values and then accidentally average repeated values on daily bars.
- If TradingView supplies a different starting history after a reload, both initial signals and later eligibility can change because accepted signals determine subsequent reset and cooldown state. Data-provider corrections can also change history.
- A marker is a relative-strength event, **not** a complete Weinstein Stage 2 classification or a standalone buy recommendation. Price structure, the rising 30-week MA, and volume are not evaluated here.

### Automated logic tests

The adjacent `.test.mjs` suite runs the production Pine source in **PineTS 0.13.1** using tiny, offline weekly fixtures. It substitutes the stock and benchmark feeds; signal-boundary cases also substitute exact RS values. Calculation and state logic otherwise come directly from the indicator, not a separately translated model.

```bash
npm install --prefix "$HOME/.cache/opencode-tmp/opencode/mansfield-pinets" --no-audit --no-fund --save-exact pinets@0.13.1
NODE_PATH="$HOME/.cache/opencode-tmp/opencode/mansfield-pinets/node_modules" \
  node --test mansfield_relative_strength/mansfield_relative_strength_overlay.test.mjs
```

These tests cover warm-up, the 52-ratio formula, crossing boundaries, reset thresholds, cooldown boundaries and overrides, display colors and visibility, missing data, and close-only state changes. Simulated unconfirmed bars test the confirmation gates, not TradingView's realtime rollback engine. **PineTS is not TradingView's compiler**: Pine Editor compilation, actual ticker requests, chart visuals, live/replay timing, and alert delivery still require the manual checks above.

## 📚 Legacy pane indicator

> ⚠️ The existing `mansfield_relative_strength.pine` is preserved unchanged. Its multi-timeframe implementation applies the SMA after requested prices are merged onto chart bars. Therefore, weekly inputs on a daily chart do **not** produce a true 52-week SMA. Use that script only when its selected timeframe matches the chart timeframe. Its older stage labels are RS-only heuristics, not complete Stage Analysis. The weekly overlay above avoids both features.

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
- Chart: **1W**. Keep the selected timeframe and chart timeframe identical.

**For Daily Analysis:**
- Timeframe: `D` (Daily)
- MA Length: `200`
- Stage Smoothing: `5-7` (daily data is noisier, use more smoothing)
- Chart: **1D**. Keep the selected timeframe and chart timeframe identical.

**⚠️ Limitation:** Do not select `W` on a daily chart in the legacy script. Its SMA would count daily chart bars, not 52 weekly observations.

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
- Added `lookahead=barmerge.lookahead_off` to avoid historical future leakage
- This does not prevent developing higher-timeframe values from changing before they close

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

**Timeframe Sampling Limitation:**
- Prices use the configured timeframe, but the SMA still runs on chart bars
- Keep chart and selected timeframes identical for correct SMA sampling
- The old multi-timeframe claims do not apply to the unchanged implementation

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
The legacy indicator uses `lookahead=barmerge.lookahead_off` on both `request.security()` calls to avoid future leakage on historical bars. This alone does not prevent higher-timeframe values from repainting while their bars are open.

### Multi-Timeframe Architecture
Both stock and benchmark prices are fetched at the same configured timeframe. However, the SMA runs afterward on chart bars, so the selected timeframe must match the chart timeframe for correct sampling.

```pinescript
benchmarkClose = request.security(sym, resolution, close, lookahead=barmerge.lookahead_off)
stockClose = request.security(syminfo.tickerid, resolution, close, lookahead=barmerge.lookahead_off)
```

For a true weekly calculation in the legacy pane, use a 1W chart with `Timeframe = W` and `MA Length = 52`. For weekly crossover markers on price, use the standalone overlay instead.

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

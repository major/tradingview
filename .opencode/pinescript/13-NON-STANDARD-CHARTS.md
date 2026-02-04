# Pine Script v6 Non-Standard Chart Data

Access data from Heikin-Ashi, Renko, Line Break, Kagi, and Point & Figure charts.

## Overview

| Chart Type | Function | Use Case |
|------------|----------|----------|
| Heikin-Ashi | `ticker.heikinashi()` | Trend smoothing |
| Renko | `ticker.renko()` | Price movement only |
| Line Break | `ticker.linebreak()` | Reversal detection |
| Kagi | `ticker.kagi()` | Direction changes |
| Point & Figure | `ticker.pointfigure()` | Classic P&F analysis |

**Warning**: Non-standard chart prices are synthetic. Do NOT use for strategy backtesting - results will be unrealistic!

### Lower Timeframe Approximation
Renko, Line Break, Kagi, and Point & Figure charts construct bars using price data from **lower timeframes**. Consequently, these bars only **approximate** the values that would correspond to calculations using actual tick data. This significantly affects backtesting accuracy.

### No Native Drawing Functions
There are **no native Pine Script functions** to draw Renko, Line Break, Kagi, or Point & Figure bars on a chart. Scripts can only request and plot the values (e.g., using `plot()`, `plotcandle()`, or `plotbar()`).

## Heikin-Ashi

### Get Heikin-Ashi Data
```pine
//@version=6
indicator("HA Overlay", overlay=true)

// Create HA ticker
haTicker = ticker.heikinashi(syminfo.tickerid)

// Request HA OHLC
[haO, haH, haL, haC] = request.security(haTicker, timeframe.period, 
    [open, high, low, close])

// Plot HA candles on regular chart
plotcandle(haO, haH, haL, haC, "HA", color=haC > haO ? color.green : color.red)
```

### Heikin-Ashi Characteristics
- **Calculation**: HA values are calculated using combinations of real OHLC values from the **current and previous bar**.
- **Smoothing**: Smoothed OHLC values, good for identifying trends.
- **Moving Average Behavior**: HA close values act more like a moving average than real market prices.
- **Trading Warning**: Unsuited for **automated trading** and backtesting because orders execute on real market prices, not synthetic HA prices.

## Renko

### Get Renko Data
```pine
//@version=6
indicator("Renko Data")

// ATR-based Renko
renkoTicker = ticker.renko(syminfo.tickerid, "ATR", 14)

// Traditional Renko (fixed box size)
// renkoTicker = ticker.renko(syminfo.tickerid, "Traditional", 1.0)

// Request Renko OHLC
renkoClose = request.security(renkoTicker, timeframe.period, close)
plot(renkoClose, "Renko Close")
```

### Renko Parameters
```pine
ticker.renko(symbol, style, param)
```

| Style | param meaning |
|-------|---------------|
| "ATR" | ATR period |
| "Traditional" | Box size in price units |

### Renko Characteristics
- **Visualization**: Bricks stacked in adjacent columns. A new brick is only drawn after the price moves a predetermined amount.
- Based purely on price movement
- No time axis (bars form on price change)
- No volume data
- Synthetic data from lower timeframes

## Line Break

```pine
//@version=6
indicator("Line Break")

lbTicker = ticker.linebreak(syminfo.tickerid, 3)  // 3-line break
lbClose = request.security(lbTicker, timeframe.period, close)
plot(lbClose, "Line Break Close")
```

### Line Break Characteristics
- Vertical boxes based on price changes
- `n` parameter = number of prior boxes to compare
- **Reversal Logic**: A reversal occurs only when the price breaks the high or low of the **`n` prior boxes**.

## Kagi

```pine
//@version=6
indicator("Kagi")

// Reversal based on ATR
kagiTicker = ticker.kagi(syminfo.tickerid, "ATR", 14)

// Reversal based on percentage
// kagiTicker = ticker.kagi(syminfo.tickerid, 3.0)  // 3% reversal

kagiClose = request.security(kagiTicker, timeframe.period, close)
plot(kagiClose, "Kagi Close")
```

### Kagi Characteristics
- Continuous line that changes direction
- Direction changes on reversal amount
- Thick line = uptrend, thin line = downtrend

## Point & Figure

```pine
//@version=6
indicator("P&F")

pnfTicker = ticker.pointfigure(syminfo.tickerid, "hl", "ATR", 14, 3)
pnfClose = request.security(pnfTicker, timeframe.period, close)
plot(pnfClose, "P&F Close")
```

### P&F Parameters
```pine
ticker.pointfigure(symbol, source, style, param, reversal)
```

| Parameter | Options |
|-----------|---------|
| source | "hl" (high/low) or "close" |
| style | "ATR" or "Traditional" |
| param | ATR period or box size |
| reversal | Number of boxes for reversal |

### P&F Characteristics
- **Synthetic OHLC**: Every column of X's or O's is represented as four synthetic OHLC values.
- Only plots price movements, ignoring time.
- X's represent rising prices, O's represent falling prices.

## Combining with Session Filtering

```pine
//@version=6
indicator("HA Regular Hours Only", overlay=true)

// Create base ticker without extended hours
baseTicker = ticker.new(syminfo.prefix, syminfo.ticker, session.regular)

// Then create HA ticker from it
haTicker = ticker.heikinashi(baseTicker)

[haO, haH, haL, haC] = request.security(haTicker, timeframe.period, 
    [open, high, low, close], gaps = barmerge.gaps_on)

plotcandle(haO, haH, haL, haC, "HA", color=haC > haO ? color.green : color.red, 
    style = plot.style_linebr)
```

### Session Filtering Parameters
- **`barmerge.gaps_on`**: Instructs `request.security()` not to fill missing data slots with previous values. This allows the function to return `na` during non-trading hours.
- **`plot.style_linebr`**: A plot style that breaks the line (or candles) when it encounters `na` values, preventing "ghost" connections across gaps.

## Chart Type Detection

```pine
chart.is_standard      // Regular candle/bar chart
chart.is_heikinashi    // Heikin-Ashi
chart.is_renko         // Renko
chart.is_linebreak     // Line Break
chart.is_kagi          // Kagi
chart.is_pnf           // Point & Figure
chart.is_range         // Range bars
```

```pine
if not chart.is_standard
    runtime.error("This indicator only works on standard charts!")
```

## Best Practices

1. **Never backtest strategies on non-standard charts** - Prices aren't real
2. **Use for analysis only** - Trend detection, pattern recognition
3. **Combine with standard data** - Use HA for signals, standard for entries
4. **Document chart requirements** - Tell users which chart type to use

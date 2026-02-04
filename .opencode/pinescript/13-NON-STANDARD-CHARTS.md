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
- Smoothed OHLC values
- Good for identifying trends
- Prices are averages (not real market prices!)
- NOT suitable for realistic backtesting

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
ticker.renko(symbol, style, param, request_gaps, gaps_source)
```

| Style | param meaning |
|-------|---------------|
| "ATR" | ATR period |
| "Traditional" | Box size in price units |

### Renko Characteristics
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
- Reversal requires breaking `n` prior boxes

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

## Combining with Session Filtering

```pine
//@version=6
indicator("HA Regular Hours Only", overlay=true)

// Create base ticker without extended hours
baseTicker = ticker.new(syminfo.prefix, syminfo.ticker, session.regular)

// Then create HA ticker from it
haTicker = ticker.heikinashi(baseTicker)

[haO, haH, haL, haC] = request.security(haTicker, timeframe.period, 
    [open, high, low, close])
```

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

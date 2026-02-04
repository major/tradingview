# Pine Script v6 Common Patterns

## Script Organization

### Recommended Section Ordering

Following a standard structure makes scripts easier to read and maintain. The recommended order is:

1.  **License**: License comments (e.g., Mozilla Public License 2.0).
2.  **Version**: Compiler annotation `//@version=6`.
3.  **Declaration**: `indicator()`, `strategy()`, or `library()`.
4.  **Imports**: `import` statements for libraries.
5.  **Constants**: `const` declarations (use `SNAKE_CASE`).
6.  **Inputs**: `input.*()` calls (use `camelCase` with `Input` suffix).
7.  **Functions**: User-defined function declarations.
8.  **Calculations**: Core logic and variable assignments.
9.  **Strategy Calls**: `strategy.*()` calls (for strategies).
10. **Visuals**: `plot*()`, `bgcolor()`, `barcolor()`, drawings.
11. **Alerts**: `alert()` and `alertcondition()` calls.

### Standard Structure Example

```pine
// This source code is subject to the terms of the Mozilla Public License 2.0 at https://mozilla.org/MPL/2.0/
// © username

//@version=6
indicator("Indicator Name", overlay=true, max_labels_count=50)

// === CONSTANTS ===
const color BULL_COLOR = color.green
const color BEAR_COLOR = color.red

// === INPUTS ===
grpSignal = "Signal Settings"
lengthInput = input.int(14, "Length", minval=1, group=grpSignal)
thresholdInput = input.float(1.5, "Threshold", minval=0.1, group=grpSignal)

grpVisual = "Visual Settings"
showLabelsInput = input.bool(true, "Show Labels", group=grpVisual)

// === FUNCTIONS ===
// @function Calculates a custom signal
getSignal(src, len) =>
    ta.sma(src, len)

// === CALCULATIONS ===
smaVal = getSignal(close, lengthInput)
condition = close > smaVal * thresholdInput

// === VISUALS ===
plot(smaVal, "SMA", color.blue)
plotshape(condition, "Signal", shape.triangleup, location.belowbar, BULL_COLOR)

// === ALERTS ===
// Alerts should always be at the end of the script
alertcondition(condition, "Signal Alert", "Condition triggered")
```

## Naming Conventions

Adhering to naming conventions improves code clarity:

- **camelCase**: Use for all identifiers (variables, functions): `maFast`, `maLengthInput`, `pivotHi()`.
- **SNAKE_CASE**: Use for constants: `BULL_COLOR`, `MAX_LOOKBACK`.
- **Qualifying Suffixes**: Use suffixes to provide clues about type or provenance: `maLengthInput`, `priceClose`, `resultsTable`, `maPlotID`.

## Input Patterns

### Grouped Inputs

```pine
grpMA = "Moving Averages"
maType = input.string("EMA", "MA Type", options=["SMA", "EMA", "WMA", "HMA"], group=grpMA)
maLength = input.int(20, "MA Length", minval=1, group=grpMA)
maSource = input.source(close, "MA Source", group=grpMA)

grpSignal = "Signals"
signalType = input.string("Cross", "Signal Type", options=["Cross", "Touch", "Break"], group=grpSignal)
signalSensitivity = input.float(1.0, "Sensitivity", minval=0.1, maxval=5.0, step=0.1, group=grpSignal)
```

### Flexible MA Selection

```pine
getMA(source, length, maType) =>
    switch maType
        "SMA" => ta.sma(source, length)
        "EMA" => ta.ema(source, length)
        "WMA" => ta.wma(source, length)
        "HMA" => ta.hma(source, length)
        "VWMA" => ta.vwma(source, length)
        => ta.sma(source, length)  // Default

maType = input.string("EMA", "Type", options=["SMA", "EMA", "WMA", "HMA", "VWMA"])
maLength = input.int(20, "Length")
ma = getMA(close, maLength, maType)
```

## Multi-Timeframe Data

### Higher Timeframe Values

```pine
htfTimeframe = input.timeframe("D", "Higher Timeframe")
htfClose = request.security(syminfo.tickerid, htfTimeframe, close)
htfSma = request.security(syminfo.tickerid, htfTimeframe, ta.sma(close, 20))

// Check trend on higher timeframe
htfBullish = htfClose > htfSma
```

### Safe MTF with Repainting Control

To avoid repainting when requesting higher timeframe data, use the `expression[1]` pattern or `lookahead = barmerge.lookahead_on` with `expression[1]`.

```pine
// Standard non-repainting MTF pattern
htfClose = request.security(syminfo.tickerid, "D", close[1])

// Alternative: Using barstate.isconfirmed to gate calculations
var float confirmedHtfClose = na
if barstate.isconfirmed
    confirmedHtfClose := request.security(syminfo.tickerid, "D", close)

// Using lookahead_on with expression[1] (no-gap version)
htfCloseNoGap = request.security(syminfo.tickerid, "D", close[1], lookahead = barmerge.lookahead_on)
```

## Signal Detection

### Crossover Signals

```pine
fastMA = ta.ema(close, 10)
slowMA = ta.ema(close, 20)

bullCross = ta.crossover(fastMA, slowMA)
bearCross = ta.crossunder(fastMA, slowMA)

plotshape(bullCross, "Buy", shape.labelup, location.belowbar, color.green, text="BUY")
plotshape(bearCross, "Sell", shape.labeldown, location.abovebar, color.red, text="SELL")
```

### Threshold Breakouts

```pine
rsi = ta.rsi(close, 14)
wasOversold = ta.valuewhen(rsi < 30, rsi, 1) < 30
bullishReversal = rsi > 30 and wasOversold

plotshape(bullishReversal, "RSI Reversal", shape.circle, location.belowbar, color.green)
```

### Price Action Patterns

```pine
// Inside bar
isInsideBar = high < high[1] and low > low[1]

// Outside bar (engulfing)
isOutsideBar = high > high[1] and low < low[1]

// Higher high and higher low
isHH = high > ta.highest(high[1], 5)
isHL = low > ta.lowest(low[1], 5)
uptrend = isHH and isHL
```

## Color Patterns

### Dynamic Colors Based on Values

```pine
rsi = ta.rsi(close, 14)

// Gradient from oversold to overbought
rsiColor = color.from_gradient(rsi, 30, 70, color.green, color.red)

// Conditional with transparency
bgColor = rsi > 70 ? color.new(color.red, 85) : 
          rsi < 30 ? color.new(color.green, 85) : na

bgcolor(bgColor)
```

### Trend-Based Coloring

```pine
trend = close > ta.sma(close, 200)
trendColor = trend ? color.green : color.red

barcolor(trendColor)
plot(ta.sma(close, 50), "SMA50", trendColor, linewidth=2)
```

## Table Patterns

### Position-Based Table

```pine
tablePos = input.string("Top Right", "Table Position", 
                        options=["Top Left", "Top Center", "Top Right", 
                                 "Middle Left", "Middle Center", "Middle Right",
                                 "Bottom Left", "Bottom Center", "Bottom Right"])

getTablePosition(pos) =>
    switch pos
        "Top Left" => position.top_left
        "Top Center" => position.top_center
        "Top Right" => position.top_right
        "Middle Left" => position.middle_left
        "Middle Center" => position.middle_center
        "Middle Right" => position.middle_right
        "Bottom Left" => position.bottom_left
        "Bottom Center" => position.bottom_center
        "Bottom Right" => position.bottom_right
        => position.top_right

var table t = table.new(getTablePosition(tablePos), 2, 5)
```

### Dashboard Table

```pine
var table dashboard = table.new(position.top_right, 2, 5, 
                                bgcolor=color.new(color.black, 80),
                                border_width=1,
                                border_color=color.gray)

if barstate.islast
    // Header
    table.cell(dashboard, 0, 0, "Metric", text_color=color.white, bgcolor=color.gray)
    table.cell(dashboard, 1, 0, "Value", text_color=color.white, bgcolor=color.gray)
    
    // Data rows
    rsi = ta.rsi(close, 14)
    rsiColor = rsi > 70 ? color.red : rsi < 30 ? color.green : color.white
    table.cell(dashboard, 0, 1, "RSI")
    table.cell(dashboard, 1, 1, str.tostring(rsi, "#.##"), text_color=rsiColor)
    
    atr = ta.atr(14)
    table.cell(dashboard, 0, 2, "ATR")
    table.cell(dashboard, 1, 2, str.tostring(atr, "#.####"))
    
    table.cell(dashboard, 0, 3, "Trend")
    table.cell(dashboard, 1, 3, close > ta.sma(close, 200) ? "BULL" : "BEAR",
               text_color=close > ta.sma(close, 200) ? color.green : color.red)
```

## Label Patterns

### Pivot Labels

```pine
pivotHigh = ta.pivothigh(high, 5, 5)
pivotLow = ta.pivotlow(low, 5, 5)

if not na(pivotHigh)
    label.new(bar_index - 5, pivotHigh, "PH", style=label.style_label_down, color=color.red)

if not na(pivotLow)
    label.new(bar_index - 5, pivotLow, "PL", style=label.style_label_up, color=color.green)
```

### Floating Info Label

```pine
var label infoLabel = label.new(na, na, "", style=label.style_label_left, 
                                 color=color.new(color.black, 50), textcolor=color.white)

if barstate.islast
    info = "Close: " + str.tostring(close) + "\n" +
           "RSI: " + str.tostring(ta.rsi(close, 14), "#.##") + "\n" +
           "ATR: " + str.tostring(ta.atr(14), "#.####")
    label.set_xy(infoLabel, bar_index + 5, close)
    label.set_text(infoLabel, info)
```

## Line Patterns

### Support/Resistance Lines

```pine
var float supportLevel = na
var float resistanceLevel = na
var line supportLine = na
var line resistanceLine = na

pivotLow = ta.pivotlow(low, 10, 10)
pivotHigh = ta.pivothigh(high, 10, 10)

if not na(pivotLow)
    supportLevel := pivotLow
    if not na(supportLine)
        line.delete(supportLine)
    supportLine := line.new(bar_index - 10, supportLevel, bar_index, supportLevel,
                           extend=extend.right, color=color.green, style=line.style_dashed)

if not na(pivotHigh)
    resistanceLevel := pivotHigh
    if not na(resistanceLine)
        line.delete(resistanceLine)
    resistanceLine := line.new(bar_index - 10, resistanceLevel, bar_index, resistanceLevel,
                              extend=extend.right, color=color.red, style=line.style_dashed)
```

### Trend Channel

```pine
length = 50
highLine = ta.highest(high, length)
lowLine = ta.lowest(low, length)
midLine = (highLine + lowLine) / 2

p1 = plot(highLine, "Resistance", color.red)
p2 = plot(lowLine, "Support", color.green)
plot(midLine, "Mid", color.gray, style=plot.style_stepline)
fill(p1, p2, color.new(color.blue, 90))
```

## Repainting Awareness

Repainting occurs when a script's behavior differs between historical bars and realtime bars.

### Causes of Repainting
1.  **HTF Data**: Using `request.security()` without proper offsets (e.g., using `close` instead of `close[1]`).
2.  **Realtime Updates**: Calculations that change during a bar's formation (e.g., using `high` or `low` in a way that depends on the current bar's state).
3.  **Future Leakage**: Using `lookahead = barmerge.lookahead_on` with current bar data.

### How to Avoid Repainting
- Use `barstate.isconfirmed` to gate calculations or alerts.
- Use `close[1]` or `open` instead of `close` for signals.
- Use the `expression[1]` pattern for MTF requests.

### barstate.isconfirmed Usage
`barstate.isconfirmed` is true only on the last update of a bar (when it closes). Using it ensures that your logic only executes once the data is final.

```pine
// Only execute logic when the bar is closed
if barstate.isconfirmed
    alert("Signal confirmed at " + str.tostring(close))
```

## Scope Documentation

Understanding scope is critical for variable accessibility:

- **Global Scope**: Variables declared outside any function or conditional block. Accessible from anywhere in the script.
- **Local Scope**: Variables declared inside a function, `if`, `for`, or `switch` block. Accessible only within that block.
- **Inner vs Outer**: Inner scopes can access variables from outer scopes, but outer scopes cannot access variables from inner scopes.

```pine
// Global scope
int globalVal = 10

if barstate.isconfirmed
    // Local scope
    int localVal = 20
    globalVal := globalVal + localVal // OK: Inner can access outer
    
// plot(localVal) // ERROR: Outer cannot access inner
```

## Line Wrapping Conventions

Proper line wrapping makes long expressions readable:

- **Indentation**: Wrapped lines should use an indentation that is **not** a multiple of four (e.g., 2 spaces), unless the expression is enclosed in parentheses.
- **Parentheses**: If an expression is wrapped inside `()`, any indentation (including multiples of four) is allowed.

```pine
// Wrapped line (not in parens) - use 2 spaces
longCondition = close > open and 
  high > high[1] and 
  low > low[1]

// Wrapped line (in parens) - can use 4 spaces
plot(ta.sma(close, 20), 
    title = "SMA", 
    color = color.blue)
```

## Scoring Systems

### Multi-Factor Score

```pine
// Calculate individual factors
rsi = ta.rsi(close, 14)
[macd, signal, _] = ta.macd(close, 12, 26, 9)
trend = close > ta.sma(close, 200)
volume_surge = volume > ta.sma(volume, 20) * 1.5

// Score each factor (0 or 1)
rsiScore = rsi > 50 ? 1 : 0
macdScore = macd > signal ? 1 : 0
trendScore = trend ? 1 : 0
volumeScore = volume_surge ? 1 : 0

// Total score
totalScore = rsiScore + macdScore + trendScore + volumeScore

// Color based on score
scoreColor = color.from_gradient(totalScore, 0, 4, color.red, color.green)
bgcolor(color.new(scoreColor, 85))
```

## Performance Optimization

### Conditional Calculation

```pine
// Only calculate when needed
showTable = input.bool(true, "Show Table")

if showTable and barstate.islast
    // Expensive calculations only when table is shown
    // ...table updates...
```

### Limiting Object Count

```pine
indicator("", max_labels_count=100, max_lines_count=50)

var label[] labels = array.new<label>()

if signalCondition
    // Manage label count manually
    if array.size(labels) >= 100
        oldest = array.shift(labels)
        label.delete(oldest)
    
    newLabel = label.new(bar_index, high, "Signal")
    array.push(labels, newLabel)
```

## Error Prevention

### Safe Division

```pine
safeDiv(numerator, denominator) =>
    denominator == 0 ? 0 : numerator / denominator

ratio = safeDiv(close, atr)
```

### Historical Bar Check

```pine
length = input.int(50, "Length")

// Don't calculate until enough bars
if bar_index >= length
    sma = ta.sma(close, length)
    plot(sma)
```

### na Handling

```pine
// Forward-fill na values
val = ta.pivothigh(high, 5, 5)
safeVal = ta.fixnan(val)  // Use last non-na value

// Replace with default
val2 = nz(someValue, 0)  // 0 if na

// Check before using
if not na(val)
    // Safe to use val
```

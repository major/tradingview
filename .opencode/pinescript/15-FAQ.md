# Pine Script v6 FAQ & Tips

Quick answers to common questions, distilled from official docs.

## General

### How do I see built-in indicator source code?
Pine Editor → Indicators dropdown → Built-in... → Select any indicator

### How do I print debug values?
```pine
// Method 1: Pine Logs (best)
log.info("Value: {0}", myValue)

// Method 2: Label on last bar
if barstate.islast
    label.new(bar_index, high, str.tostring(myValue))

// Method 3: Plot to Data Window
plot(myValue, display=display.data_window)
```

### How do I open the console?
`Ctrl+\`` (backtick) - Shows Pine Logs output

### How do I calculate pips?
Pip size varies by symbol (Forex vs. others). A common approach:
```pine
isJPY = str.contains(syminfo.ticker, "JPY")
pipSize = isJPY ? 0.01 : 0.0001
pips = (close - open) / pipSize
```

## Variables & Types

### Why can't I use na with bool?
v6 change: `bool` is now a strict type that can only be `true` or `false`. It cannot be `na`.
- `na()`, `nz()`, and `fixnan()` no longer accept `bool` arguments.
- Undefined conditions return `false` instead of `na`.
- Use `false` as the default value instead of `na`.

### Is explicit casting required for booleans?
Yes. In v6, `int` and `float` no longer implicitly cast to `bool`.
```pine
// Error in v6
plot(bar_index ? color.green : color.red)

// Correct in v6
plot(bool(bar_index) ? color.green : color.red)
```

### What is lazy evaluation?
Pine Script v6 uses lazy evaluation for `and` and `or` operators. The right-hand side is only evaluated if the left-hand side doesn't already determine the result.
```pine
// expensiveCheck() is skipped if condA is false
if condA and expensiveCheck()
    ...
```

### What's the difference between var and varip?
| Mode | Behavior |
|------|----------|
| `var` | Initialize once, persist across bars. |
| `varip` | Persist across ticks. **Note:** Only affects behavior on REALTIME bars. On historical bars, it behaves like `var`. Backtest results will not reflect intrabar tick persistence. |

### How do I create a constant array?
```pine
var LEVELS = array.from(10, 20, 30, 40, 50)  // Initialized once
```

### Can I use negative indices with arrays?
Yes. In v6, `array.get(arr, -1)` returns the last element, `-2` the second to last, etc.

## Drawing & Visuals

### Why do my lines/labels disappear?
Default limit is 50. Increase with `max_lines_count`, `max_labels_count`, etc. (up to 500).
**Note:** Once the limit is reached, Pine Script automatically deletes the oldest objects to create new ones.
```pine
indicator("My Indicator", max_lines_count=500, max_labels_count=500)
```

### How do I plot diagonal lines?
1. **Using `plot()`:** Use `na` values and `offset` to create segments, but this is limited.
2. **Using `line.new()`:** Best for diagonals. Connect two `chart.point` objects.

### How do I track Support/Resistance lines?
Store line IDs in an array and update their `x2` coordinate on every bar until a "break" condition occurs, then stop updating or delete them.

### How far can I draw into the past/future?
- Past: 9,999 bars
- Future: 500 bars
- For beyond: use `xloc.bar_time` with timestamps

### How do I update multiple drawing objects?
```pine
for ln in myLinesArray
    line.set_color(ln, color.red)
```

## Data & Timeframes

### How do I avoid repainting with request.security()?
```pine
// Use [1] offset with lookahead
htfClose = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)
```

### How do I get previous day's high/low/close?
```pine
[prevH, prevL, prevC] = request.security(syminfo.tickerid, "D", 
    [high[1], low[1], close[1]], lookahead=barmerge.lookahead_on)
```

### What is the format of timeframe.period?
In v6, `timeframe.period` always includes the multiplier. For example, "1D" instead of "D", "1W" instead of "W".

### How do I get real OHLC on Heikin-Ashi charts?
Use `ticker.new()` to request data from the underlying non-synthetic symbol:
```pine
realClose = request.security(ticker.new(syminfo.prefix, syminfo.ticker), timeframe.period, close)
```

## Time & Sessions

### How do I check if in trading session?
```pine
inSession = not na(time(timeframe.period, "0930-1600:23456"))
```

### How do I detect new day/session?
```pine
newDay = ta.change(time("D"))
newSession = ta.change(time(timeframe.period, "0930-1600"))
```

### How do I get bar's hour in specific timezone?
```pine
nyHour = hour(time, "America/New_York")
```

## Conditions & Signals

### How do I trigger action after N bars?
```pine
barsSinceSignal = ta.barssince(myCondition)
if barsSinceSignal == 5
    // 5 bars after signal
```

### How do I remember when condition last occurred?
```pine
var int lastSignalBar = na
if myCondition
    lastSignalBar := bar_index
```

### How do I calculate averages only when conditions are true?
Use a `var` variable to accumulate values and a counter, or use an array:
```pine
var float sum = 0.0
var int count = 0
if myCondition
    sum += close
    count += 1
avg = sum / count
```

### Why do some functions reject my "length" variable?
Some built-in functions (like `ta.sma()`) require a "simple int" (constant during execution), while others accept a "series int" (can change per bar). If a function rejects a series length, you may need to use a manual calculation or a loop.

## Visuals & Formatting

### How do I control price precision and formatting?
Use `precision` and `format` parameters in `indicator()` or `strategy()`:
```pine
indicator("My Script", precision=2, format=format.price)
```

### How do I abbreviate large values (K, M, B)?
Use `format.volume` in `plot()` or custom functions for string conversion:
```pine
plot(volume, format=format.volume)
```

### How do I plot conditionally?
Plots cannot be placed inside `if` blocks. Instead, use `na` for values and conditional colors:
```pine
plot(myCondition ? close : na, color = myCondition ? color.green : na)
```

## Strategies

### Why does my strategy perform differently live vs backtest?
Common causes:
1. Repainting indicators
2. Using Heikin-Ashi/Renko charts (synthetic prices)
3. `calc_on_every_tick=true`
4. Using `close` instead of `close[1]`

### How do I set position size as percentage?
```pine
strategy("My Strategy", default_qty_type=strategy.percent_of_equity, default_qty_value=10)
```

### How do I exit at specific time?
```pine
if hour == 15 and minute == 45
    strategy.close_all("EOD Exit")
```

## Performance

### My script is slow. How do I optimize?
1. Use built-in functions instead of loops
2. Limit drawing objects (delete old ones)
3. Cache repeated calculations
4. Use `var` for one-time calculations
5. Reduce `request.*()` calls

### How do I see visible chart range?
```pine
leftTime = chart.left_visible_bar_time
rightTime = chart.right_visible_bar_time
```

## Common Errors

### "Duplicate argument 'X'"
In v6, you cannot pass the same parameter twice in a function call.
```pine
// Error in v6
plot(close, color=color.red, color=color.blue)
```

### "Script has too many local scopes"
Reduce nesting. Extract logic into functions.

### "Loop takes too long"
Reduce iteration count or use built-in functions.

### "Max plot count exceeded"
Remove unused plots or use `display.none` for hidden calculations.

### "Cannot use 'X' in this context"
Check if you're trying to use plot/alertcondition inside if/for blocks (not allowed).

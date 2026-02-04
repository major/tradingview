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

## Variables & Types

### Why can't I use na with bool?
v6 change: booleans are only `true` or `false`. Use `false` as default instead of `na`.

### What's the difference between var and varip?
| Mode | Behavior |
|------|----------|
| `var` | Initialize once, persist across bars |
| `varip` | Persist across ticks (causes repainting!) |

### How do I create a constant array?
```pine
var LEVELS = array.from(10, 20, 30, 40, 50)  // Initialized once
```

## Drawing & Visuals

### Why do my lines/labels disappear?
Default limit is 50. Increase with:
```pine
indicator("My Indicator", max_lines_count=500, max_labels_count=500)
```

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

### How do I detect chart type?
```pine
if chart.is_heikinashi
    runtime.error("Not supported on HA charts")
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

### How do I add cooldown between signals?
```pine
barsSinceLast = ta.barssince(myCondition[1])
canSignal = barsSinceLast >= 10 or na(barsSinceLast)
signal = myCondition and canSignal
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

### "Script has too many local scopes"
Reduce nesting. Extract logic into functions.

### "Loop takes too long"
Reduce iteration count or use built-in functions.

### "Max plot count exceeded"
Remove unused plots or use `display.none` for hidden calculations.

### "Cannot use 'X' in this context"
Check if you're trying to use plot/alertcondition inside if/for blocks (not allowed).

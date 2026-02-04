# Pine Script v6 Repainting Reference

Repainting occurs when a script's historical behavior differs from its realtime behavior. Understanding repainting is **critical** for building reliable indicators and strategies.

## Repainting Categories

### 1. Widespread/Acceptable Repainting

These are normal and expected:

| Behavior | Why It Happens | Impact |
|----------|----------------|--------|
| Using `close` on realtime bar | Close changes until bar confirms | Historical shows final close; realtime updates |
| Using `high`/`low` on realtime bar | H/L expand during bar | Historical shows final H/L; realtime may be lower |
| HTF data with unconfirmed values | Current HTF bar still forming | Values update until HTF bar closes |

### 2. Potentially Misleading

Use with caution:

| Behavior | Risk | Mitigation |
|----------|------|------------|
| Plotting shapes in the past | Looks like signal existed earlier | Common in **Pivots** and **Ichimoku** |
| `calc_on_every_tick=true` | Strategy entries on every tick | **Invalidates backtests**; results won't match realtime |
| `varip` variables | Persist across ticks | Causes historical/realtime divergence |
| `timenow` | Changes on every tick | Only use for display, not signals |
| `barstate.*` conditions | Behavior differs historical vs realtime | Test thoroughly |

### 3. Unacceptable (Bugs)

**Never do these:**

| Behavior | Why It's Bad |
|----------|--------------|
| Future data leak via `lookahead_on` | Shows impossible foreknowledge |
| Strategy backtests on Heikin-Ashi/Renko | Prices aren't real market prices |
| Using `security()` HTF without `[1]` offset | Gets unconfirmed future data |

### 4. Unavoidable

| Behavior | Cause |
|----------|-------|
| Data feed revisions | Exchange corrections |
| Splits/dividends adjustments | Historical data recalculated |

## Fluid Data Values

Understanding **why** repainting occurs requires understanding the difference between historical and realtime data:

- **Historical Bars**: Only OHLC (Open, High, Low, Close) values are preserved. Intermediary price movements are lost.
- **Realtime Bars**: High, Low, and Close are **fluid**. They change many times as new ticks arrive before the bar finally closes.
- **The Divergence**: A script calculating on a realtime bar sees these fluid updates. Once that bar becomes historical, only the final OHLC remains. If the script's logic depended on those intermediary "fluid" values, it will calculate differently on history than it did in realtime.

## Non-Repainting Patterns

### Confirmed Values Only

Using `barstate.isconfirmed` is the **only** bar state that avoids repainting because it ensures the script only executes on the bar's last iteration when prices are fixed. Other states like `barstate.isnew` or `barstate.islast` behave differently on historical vs. realtime bars (e.g., `isnew` is true on the bar's *close* in history but on its *open* in realtime).

```pine
// Use previous bar's close (always confirmed)
signal = ta.crossover(close[1], sma[1])

// Or check bar confirmation
if barstate.isconfirmed
    // Only execute on confirmed bars
```

### Safe HTF Data Request
```pine
// WRONG: Gets unconfirmed HTF data (repaints!)
htfClose = request.security(syminfo.tickerid, "D", close)

// CORRECT: Use [1] offset with lookahead
htfClose = request.security(syminfo.tickerid, "D", close[1], lookahead=barmerge.lookahead_on)

// This retrieves the PREVIOUS day's confirmed close
```

### Why the HTF Pattern Works

1. `close[1]` requests the previous bar's value.
2. `lookahead_on` allows seeing that value on the current bar.
3. Previous bar is always confirmed → no repainting.

> [!IMPORTANT]
> The `[1]` offset and `lookahead_on` are **mutually dependent**. Neither can be removed without compromising the integrity of the request. Removing `[1]` causes a future leak; removing `lookahead_on` causes the value to only update at the end of the HTF bar.

## 🚨 FUTURE LEAK DANGER

Using `lookahead_on` **WITHOUT** the `[1]` offset is the most dangerous form of repainting. It allows a script to access data from the future on historical bars (e.g., knowing today's high before the day is over).

- **Historical Bars**: Magically show future prices, creating "perfect" but impossible backtests.
- **Realtime Bars**: Cannot see the future, so the script behaves completely differently.
- **Consequence**: Scripts using this misleading technique **will be moderated** and removed from the Public Library.

```pine
// ❌ DANGEROUS FUTURE LEAK (Repaints!)
futureHigh = request.security(syminfo.tickerid, "D", high, lookahead=barmerge.lookahead_on)

// ✅ SAFE NON-REPAINTING
safeHigh = request.security(syminfo.tickerid, "D", high[1], lookahead=barmerge.lookahead_on)
```

### Lower Timeframe Requests

When requesting data from a timeframe **lower** than the chart's, `request.security()` often returns unreliable results that differ between historical and realtime bars. For reliable lower-timeframe data, use `request.security_lower_tf()`.

```pine
// Better for lower timeframe data
lowerTfData = request.security_lower_tf(syminfo.tickerid, "1", close)
```

### Using Open Instead of Close
```pine
// Open is known at bar start (doesn't repaint)
signal = close > open  // Still repaints (close changes)
signal = close[1] > open[1]  // Doesn't repaint (both confirmed)

// For realtime decisions on open:
entryPrice = open  // Fixed at bar open
```

### Common Misleading Examples

- **Pivots**: Pivot detection requires a "lookback" and "lookforward" period (e.g., `ta.pivothigh(5, 5)`). The pivot is only identified 5 bars *after* it occurred. Plotting it on the actual pivot bar makes it look like it was known instantly.
- **Ichimoku Cloud**: The Chikou Span (Lagging Span) is plotted 26 bars in the past. While mathematically sound, it can be misleading if used to imply signals existed earlier than they were actually calculated.
```pine
var float confirmedSignal = na

if barstate.isconfirmed
    if ta.crossover(close, ta.sma(close, 20))
        confirmedSignal := close
```

## Script Evaluation Framework

When evaluating a script, ask these specific questions to identify repainting risks:

1. Does the script calculate/display the same way on historical and realtime bars?
2. Do alerts wait for the end of a realtime bar before triggering?
3. Do signal markers wait for the end of a realtime bar before appearing?
4. Does the script plot or draw values into the past?
5. Does the strategy use `calc_on_every_tick = true`?
6. Do `request.security()` calls leak future information on historical bars?

## Dataset Variations

Repainting can also be caused by changes in the underlying dataset, which are often outside the programmer's control:

- **Account-Specific Bar Limits**: Different plans see different amounts of history (5K bars for Basic, up to 40K for Ultimate). A script starting at bar 5,000 may calculate differently than one starting at bar 40,000 due to indicator "warm-up" (e.g., EMA).
- **Alignment Rules**: Starting points for historical data align differently by timeframe (e.g., 1-14m aligns to week start, 30m+ aligns to year start).
- **Data Revisions**: Exchanges occasionally revise historical bar prices after they have closed.
- **Corporate Actions**: Stock splits and dividends result in the entire historical dataset being recalculated/adjusted.

## Detecting Repainting Risk

### Check Your Script For:

1. **`request.security()` without `[1]` and `lookahead_on`**
2. **`varip` variables used in signal logic**
3. **`timenow` used for anything but display**
4. **Strategy on non-standard chart type**
5. **Plotting with negative offset** (`offset=-5`)

### Testing for Repainting
1. Add script to chart
2. Watch realtime bar behavior
3. After bar closes, note if plot/signal changed position
4. Refresh chart - does history match what you saw?

## Common Fixes

| Problem | Solution |
|---------|----------|
| Signal appears/disappears on realtime bar | Use `barstate.isconfirmed` |
| HTF values change | Use `close[1]` + `lookahead_on` |
| Want current bar but no repainting | Use `open` (known at bar start) |
| Strategy behaves differently live | Ensure using standard chart type |

## Best Practices

1. **Document repainting behavior** in script description
2. **Use `[1]` offset** for signals that trigger actions
3. **Test on realtime charts** before publishing
4. **Never use `lookahead_on` without `[1]` offset**
5. **Avoid strategies on Heikin-Ashi/Renko** for realistic backtests
6. **Warning**: `calc_on_every_tick = true` in strategies makes backtest results **non-representative** of realtime behavior.

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
| Plotting shapes in the past | Looks like signal existed earlier | Document clearly |
| `calc_on_every_tick=true` | Strategy entries on every tick | Use only when needed |
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

## Non-Repainting Patterns

### Confirmed Values Only
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
1. `close[1]` requests the previous bar's value
2. `lookahead_on` allows seeing that value on the current bar
3. Previous bar is always confirmed → no repainting

### Using Open Instead of Close
```pine
// Open is known at bar start (doesn't repaint)
signal = close > open  // Still repaints (close changes)
signal = close[1] > open[1]  // Doesn't repaint (both confirmed)

// For realtime decisions on open:
entryPrice = open  // Fixed at bar open
```

### Waiting for Confirmation
```pine
var float confirmedSignal = na

if barstate.isconfirmed
    if ta.crossover(close, ta.sma(close, 20))
        confirmedSignal := close
```

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

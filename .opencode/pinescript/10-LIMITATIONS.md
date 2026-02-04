# Pine Script v6 Limitations & Debugging

## Script Limitations

### Time Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Compilation | 2 minutes | 3 warnings = 1 hour ban |
| Total execution | 20-40 seconds | 20s for Basic, 40s for others |
| Loop iteration | 500ms per loop | Per bar; outer loop counts as one |

### Size & Variable Limits

| Element | Limit | Notes |
|---------|-------|-------|
| Compiled tokens | 100,000 | Actual size constraint (not just KB) |
| Variables per scope | 1,000 | Applies to each function individually |
| Compilation request | 5 MB | Total size of script + imported libraries |
| Local scopes | 500 | Nested if/for/while blocks |
| Array/map/matrix elements | 100,000 | Total elements across the collection |
| Map pairs | 50,000 | 100K elements / 2 (key + value) |

**Note**: The global scope is implicitly wrapped in a function, so the 1,000 variable limit applies to it as well.

## Chart Visual Limits

| Element | Default | Maximum | Notes |
|---------|---------|---------|-------|
| Plot count | 64 | 64 | Includes plot, plotshape, plotchar, etc. |
| Lines | 50 | 500 | via `max_lines_count` |
| Boxes | 50 | 500 | via `max_boxes_count` |
| Labels | 50 | 500 | via `max_labels_count` |
| Polylines | 50 | 100 | via `max_polylines_count` |
| Tables | 9 | 9 | One per position |
| Bars Forward | - | 500 | For `xloc.bar_index` positioning |

```pine
//@version=6
indicator("My Indicator", max_lines_count=500, max_labels_count=500)
```

## Request Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Unique `request.*()` calls | 40 / 64 | 64 for Ultimate plan |
| Intrabars per `request.security_lower_tf()` | Varies | Basic-Premium: 100K, Expert: 125K, Ultimate: 200K |
| Tuple elements | 127 | Combined limit for all `request.*` calls |

**Note**: 
- Identical `request.*()` calls reuse data and count as one.
- Pine v6 enables **dynamic requests** by default, allowing series string arguments in `request.*` calls.

## Max Bars Back

The history-referencing operator `[]` depends on the historical buffer size:
- **Most series**: 5,000 bars.
- **OHLC/Time series**: 10,000 bars.
- **Drawings**: 10,000 bars in the past (using `xloc.bar_index`).

Exceeding these limits causes a runtime error. Use `max_bars_back()` or the `max_bars_back` parameter in `indicator()`/`strategy()` to adjust buffer sizes.

## Strategy Limits

| Element | Limit |
|---------|-------|
| Open trades | 10,000 |
| Orders per bar | Limited by execution engine |

---

## Pine Profiler (Optimization Tool)

The **Pine Profiler** is the primary tool for identifying performance bottlenecks. It analyzes the execution time of significant code lines and blocks.

### Enabling the Profiler
1. Add your script to the chart.
2. Open the Pine Editor.
3. Click the **"More"** (three dots) menu in the top-right.
4. Toggle **"Profiler mode"** ON.

### Interpreting Results
- **Bars & Percentages**: Appear to the left of code lines, showing relative runtime impact.
- **Flame Icons**: Mark the top 3 highest-impact code regions ("bottlenecks").
- **Tooltips**: Hover over the percentage to see:
    - **Time**: Total time spent on the line/block across all executions.
    - **Executions**: Number of times the line/block was executed.
    - **Line Time**: (For blocks) Time spent on the initial line or all conditional expressions.

### Optimization Techniques from Profiling
- **Conditional Calculations**: Wrap expensive logic in `if` blocks so they only run when needed.
- **Use `var`**: Calculate values once on the first bar if they don't change.
- **Built-in Functions**: Prefer `ta.sma()` over manual loops; built-ins are highly optimized.
- **Reduce Drawings**: Delete old drawing objects or use `max_lines_count` to let Pine handle it.

---

## Debugging Techniques

### Pine Logs

```pine
//@version=6
indicator("Debug Example")

myValue = ta.sma(close, 14)

// Log levels
log.info("SMA value: {0}", myValue)
log.warning("Check this: {0}", myValue)
log.error("Problem: {0}", myValue)
```

**Pine Logs Behavior:**
- **Historical Bars**: Limit of 10,000 logs.
- **Realtime Bars**: Logs accumulate until the script restarts (no fixed limit).
- **Libraries**: Published libraries can contain `log.*` calls, but they only generate logs when used in a *personal* script. Published scripts never generate logs.
- **Features**: "Source code" jump, "Scroll to bar" navigation, and filtering by level/date/text.

### Visual Debugging

#### Plot Values
```pine
// Plot in Data Window only (no chart clutter)
plot(myValue, "Hidden Debug", display=display.data_window)
```

#### Labels for Strings
```pine
if barstate.islast
    label.new(bar_index, high, "State: " + myState)
```

---

## Common Errors & Solutions

### "Script has too many local scopes"
- **Cause**: Exceeded the 500 local scope limit.
- **Fix**: Reduce nested `if/for/while` blocks; extract logic into functions.

### "Script has too many local variables"
- **Cause**: Exceeded 1,000 variables in a single scope (explicit + implicit).
- **Fix**: Combine expressions (e.g., `var3 = expr1 + expr2` instead of `var1=expr1, var2=expr2, var3=var1+var2`).

### "The if statement is too long"
- **Cause**: Local block inside an `if` is too large for the compiler.
- **Fix**: Move the logic into a function.

### "Loop takes too long to execute"
- **Cause**: Exceeded 500ms on a single bar.
- **Fix**: Reduce iteration count; use built-ins; cache repeated calculations.

### "The requested historical offset (X) is beyond the historical buffer's limit (Y)"
- **Cause**: Accessing `series[n]` where `n` is larger than the detected buffer.
- **Fix**: Use `max_bars_back(series, n)` to force a larger buffer.

### "Max plot count exceeded"
- **Cause**: More than 64 plot-generating functions.
- **Fix**: Combine plots; use `display.none` for calculations that don't need visuals.

**References**:
- `pine-script-docs/writing/limitations.html` - Script limits
- `pine-script-docs/writing/debugging.html` - Debug techniques
- `pine-script-docs/writing/profiling-and-optimization.html` - Profiler & Optimization
- `pine-script-docs/error-messages.html` - Error explanations

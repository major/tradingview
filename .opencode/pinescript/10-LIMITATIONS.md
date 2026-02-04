# Pine Script v6 Limitations & Debugging

## Script Limitations

### Time Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Compilation | 2 minutes | 3 warnings = 1 hour ban |
| Total execution | 20-40 seconds | All bars combined |
| Loop iteration | 500ms per loop | Per bar |

### Chart Visual Limits

| Element | Default | Maximum |
|---------|---------|---------|
| Plot count | 64 | 64 total (includes plot, plotshape, plotchar, etc.) |
| Lines | 50 | 500 (via `max_lines_count`) |
| Boxes | 50 | 500 (via `max_boxes_count`) |
| Labels | 50 | 500 (via `max_labels_count`) |
| Polylines | 50 | 100 (via `max_polylines_count`) |
| Tables | 9 | 9 (one per position) |

```pine
//@version=6
indicator("My Indicator", max_lines_count=500, max_labels_count=500)
```

### Request Limits

| Limit | Value |
|-------|-------|
| Unique `request.*()` calls | 40 (64 for Ultimate) |
| Intrabars per `request.security_lower_tf()` | 100,000 |

**Note**: Identical `request.*()` calls reuse data and count as one.

### Size Limits

| Element | Limit |
|---------|-------|
| Compiled script size | 80 KB |
| Local scopes | 500 |
| Array/map/matrix elements | 100,000 |

### Strategy Limits

| Element | Limit |
|---------|-------|
| Open trades | 10,000 |
| Orders per bar | Limited |

## Debugging Techniques

### Pine Logs (Primary Debug Tool)

```pine
//@version=6
indicator("Debug Example")

myValue = ta.sma(close, 14)

// Log levels
log.info("SMA value: {0}", myValue)
log.warning("Check this: {0}", myValue)
log.error("Problem: {0}", myValue)

// Works anywhere - global scope, functions, loops
for i = 0 to 9
    log.info("Index {0}: {1}", i, close[i])
```

**Pine Logs Features:**
- View in Pine Logs panel (Ctrl+`)
- Click "Source code" to jump to log statement
- Click "Scroll to bar" to navigate chart
- Filter by level, date, search text
- Only works in personal scripts (not published)
- Limit: 10,000 historical logs

### Visual Debugging

#### Plot Values
```pine
// Plot numeric values
plot(myCalculation, "Debug Value")

// Plot in Data Window only (no chart clutter)
plot(myValue, "Hidden Debug", display=display.data_window)
```

#### Color Conditions
```pine
// Highlight bars meeting condition
bgcolor(myCondition ? color.new(color.yellow, 80) : na)

// Color bars
barcolor(close > open ? color.green : color.red)
```

#### Labels for Strings
```pine
if barstate.islast
    label.new(bar_index, high, 
              "Debug: " + str.tostring(myValue) + "\n" +
              "State: " + myState,
              style=label.style_label_down)
```

### Debug Pattern: Print Function
```pine
//@function Debug helper - displays string on last bar
//@param msg The message to display
print(string msg) =>
    var label lbl = label.new(na, na, "", xloc=xloc.bar_time)
    if barstate.islast
        label.set_xy(lbl, time, high)
        label.set_text(lbl, msg)

// Usage
print("Value: " + str.tostring(myValue))
```

### Tables for Multi-Value Debug
```pine
var table debugTable = table.new(position.top_right, 2, 10)

if barstate.islast
    table.cell(debugTable, 0, 0, "Variable", bgcolor=color.gray)
    table.cell(debugTable, 1, 0, "Value", bgcolor=color.gray)
    table.cell(debugTable, 0, 1, "SMA")
    table.cell(debugTable, 1, 1, str.tostring(mySma))
    table.cell(debugTable, 0, 2, "RSI")
    table.cell(debugTable, 1, 2, str.tostring(myRsi))
```

## Common Errors & Solutions

### "Script has too many local scopes"
- Reduce nested if/for/while blocks
- Extract logic into functions
- Simplify conditional chains

### "Loop takes too long to execute"
- Reduce iteration count
- Use built-in functions instead of loops
- Cache repeated calculations

### "Script requests too much data"
- Reduce `request.*()` calls
- Combine requests where possible
- Use tuple returns for multiple values

### "Max plot count exceeded"
- Remove unused plots
- Combine related data into single plot
- Use `display.none` for hidden calculations

## Performance Optimization

### Conditional Calculations
```pine
// Only calculate when needed
expensiveCalc = needIt ? doExpensiveCalc() : na
```

### Limit Drawing Objects
```pine
// Delete old objects
if array.size(myLines) > 50
    line.delete(array.shift(myLines))
```

### Use Built-ins
```pine
// SLOW: Manual loop
sum = 0.0
for i = 0 to 99
    sum += close[i]
avg = sum / 100

// FAST: Built-in
avg = ta.sma(close, 100)
```

**References**:
- `pine-script-docs/writing/limitations.html` - Script limits
- `pine-script-docs/writing/debugging.html` - Debug techniques

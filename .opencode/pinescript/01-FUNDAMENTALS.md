# Pine Script v6 Fundamentals

## Script Structure

Every Pine Script must have:
1. Version annotation
2. Declaration statement
3. Code (at least one output for indicators)

```pine
//@version=6
indicator("My Indicator", overlay=true)

plot(close, "Close Price")
```

## Declaration Statements

### indicator()
```pine
indicator(
    title,                    // Required: display name
    shorttitle,               // Optional: shorter name for chart
    overlay = false,          // true = on price chart, false = separate pane
    format = format.inherit,  // format.price, format.volume, format.percent
    precision = na,           // decimal places (0-16)
    scale = scale.right,      // scale.left, scale.right, scale.none
    max_bars_back = 0,        // historical bars needed
    max_lines_count = 50,     // max line objects (1-500)
    max_labels_count = 50,    // max label objects (1-500)
    max_boxes_count = 50,     // max box objects (1-500)
    max_polylines_count = 50, // max polyline objects (1-100)
    explicit_plot_zorder = false
)
```

### strategy()
```pine
strategy(
    title,
    shorttitle,
    overlay = false,
    pyramiding = 0,           // max entries in same direction
    default_qty_type = strategy.fixed,  // .fixed, .cash, .percent_of_equity
    default_qty_value = 1,
    initial_capital = 1000000,
    currency = currency.NONE,
    commission_type = strategy.commission.none,  // .percent, .cash_per_contract, .cash_per_order
    commission_value = 0,
    slippage = 0,
    process_orders_on_close = false,
    margin_long = 100,
    margin_short = 100,
    max_bars_back = 0
)
```

### library()
```pine
library(title, overlay = false)

export myFunction(int x) => x * 2
```

## Type System

### Type Qualifiers (Hierarchy: const < input < simple < series)

| Qualifier | When Determined | Can Change Per Bar | Example |
|-----------|-----------------|-------------------|---------|
| `const` | Compile time | No | `14`, `"hello"`, `color.red` |
| `input` | Script load (Settings) | No | `input.int(14)` |
| `simple` | First bar only | No | `syminfo.ticker`, `timeframe.period` |
| `series` | Every bar | Yes | `close`, `ta.sma(close, 14)` |

**Rule**: Functions accept weaker qualifiers but reject stronger ones.
- `ta.sma(close, input.int(14))` - OK (series, input)
- `ta.sma(close, bar_index)` - ERROR (bar_index is series, length needs const/input/simple)

### Fundamental Types

```pine
int myInt = 14
float myFloat = 3.14
bool myBool = true
color myColor = color.red
string myStr = "hello"
```

### Reference Types (Always series qualifier)

```pine
var line myLine = line.new(bar_index, low, bar_index, high)
var label myLabel = label.new(bar_index, high, "Text")
var box myBox = box.new(bar_index - 10, high, bar_index, low)
var table myTable = table.new(position.top_right, 2, 2)
array<float> myArray = array.new<float>()
map<string, float> myMap = map.new<string, float>()
matrix<float> myMatrix = matrix.new<float>(3, 3)
```

## Variable Declarations

### Default (Reinitialize each bar)
```pine
counter = 0  // Resets to 0 on every bar
counter := counter + 1  // Always equals 1
```

### var (Persist across bars)
```pine
var counter = 0  // Initialized only on first bar
counter := counter + 1  // Increments: 1, 2, 3, 4...
```

### varip (Persist across realtime updates)
```pine
varip tickCount = 0  // Survives realtime bar rollback
tickCount := tickCount + 1  // Counts every tick, not just confirmed bars
```

**Warning**: `varip` can cause repainting - values differ on historical vs realtime.

## na Values

`na` represents missing/undefined values.

```pine
// Check for na
if na(close[100])
    // Not enough bars
    
// Replace na with default
safeValue = nz(possiblyNaValue, 0)

// Coalesce to first non-na
result = na(a) ? na(b) ? c : b : a
// Or use: fixnan(series) to forward-fill na values
```

## Execution Model

### Bar-by-Bar Execution
- Script executes once per bar on historical data
- Script executes multiple times per bar on realtime (each tick)
- On realtime: script "rolls back" between ticks (non-var variables reset)

### Bar States
```pine
barstate.isfirst      // First bar of dataset
barstate.islast       // Last bar (current bar)
barstate.ishistory    // Historical bar (not realtime)
barstate.isrealtime   // Realtime bar (live market)
barstate.isnew        // First execution on this bar
barstate.isconfirmed  // Bar has closed (won't repaint)
```

### Time Series Access
```pine
close       // Current bar's close (same as close[0])
close[1]    // Previous bar's close
close[2]    // Two bars ago

// History operator works on any series
mySma[1]    // Previous bar's SMA value
```

## Common Patterns

### Safe Historical Access
```pine
// Ensure enough bars exist
length = input.int(14)
if bar_index >= length
    sma_val = ta.sma(close, length)
    plot(sma_val)
```

### Initialize Once
```pine
var float persistentValue = 0.0
if barstate.isfirst
    persistentValue := someCalculation()
```

### Update Only on Confirmed Bars
```pine
var float savedHigh = 0.0
if barstate.isconfirmed
    savedHigh := high
```

### Update Only on Last Bar (for tables)
```pine
var table t = table.new(position.top_right, 2, 2)
if barstate.islast
    table.cell(t, 0, 0, "Value: " + str.tostring(close))
```

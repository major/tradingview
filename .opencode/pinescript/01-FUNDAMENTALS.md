# Pine Script v6 Fundamentals

## Script Structure

Every Pine Script follows this general structure:
1. **Version annotation**: `//@version=6` (Optional but recommended; defaults to v1).
2. **Declaration statement**: `indicator()`, `strategy()`, or `library()`.
3. **Code**: Statements and expressions (indicators must have at least one output).

### Compiler Annotations
Comments starting with `//@` issue special instructions to the compiler:
- `//@version=6`: Specifies the Pine Script version.
- `//@description`: Sets a custom description for libraries.
- `//@function`, `//@param`, `//@returns`: Document user-defined functions/methods.
- `//@type`, `//@field`: Document user-defined types (UDTs) and their fields.
- `//@enum`: Documents enum types.
- `//@variable`: Documents a variable.
- `//@strategy_alert_message`: Provides a default message for strategy alerts.
- `//#region` / `//#endregion`: Creates collapsible code blocks in the Editor.

### Line Wrapping and Indentation
- **Line Wrapping**: Long statements can be wrapped across multiple lines.
- **Indentation Rules**: 
  - Wrapped lines *cannot* use an indentation that is a multiple of 4 spaces (or a tab), as these define local blocks.
  - **Exception**: Inside parentheses `()`, any indentation is allowed.
- **Local Blocks**: Code inside `if`, `for`, `while`, `switch`, or functions must be indented by 4 spaces or a tab.

### Scope
- **Global Scope**: Variables declared outside any local block. Accessible from anywhere in the script. Lines must start at the first character (no indentation).
- **Local Scope**: Variables declared inside a local block. Accessible only within that block and its nested blocks.

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

**Compatibility Rules**:
- **Weaker to Stronger**: Functions accept values with the required qualifier or any **weaker** qualifier.
- **Stronger to Weaker**: Functions **reject** values with a **stronger** qualifier than required.
- **Return Qualifier**: The result of an expression inherits the **strongest** qualifier used in its calculation.
- **No Downgrading**: You cannot change a qualifier to a weaker one (e.g., a `series` value cannot be converted to `simple`).

**Special Cases**:
- `input.source()` returns `series float` (the only input function that returns a `series`).

### Fundamental Types
```pine
int myInt = 14
float myFloat = 3.14
bool myBool = true
color myColor = color.red
string myStr = "hello"
```

### Reference Types (Always series qualifier)
Reference types are dynamic structures created at runtime. They **always** inherit the `series` qualifier.

```pine
var line myLine = line.new(bar_index, low, bar_index, high)
var label myLabel = label.new(bar_index, high, "Text")
var box myBox = box.new(bar_index - 10, high, bar_index, low)
var table myTable = table.new(position.top_right, 2, 2)
array<float> myArray = array.new<float>()
map<string, float> myMap = map.new<string, float>()
matrix<float> myMatrix = matrix.new<float>(3, 3)
```

### Type Casting
Explicitly convert values between types using casting functions:
```pine
float(na)    // Cast na to float
int(close)   // Cast float to int
bool(1)      // Cast int to bool
```

### Tuple Declarations
Functions and structures can return multiple values. Use tuple declarations to store them:
```pine
[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)
[ma, _] = myFunc() // Use underscore `_` to ignore unneeded values
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
- **ip** stands for "intrabar persist".
- **Rollback**: On realtime bars, Pine Script normally "rolls back" variable values between ticks to the state they had at the bar's open.
- **Behavior**: Variables declared with `varip` **escape** this rollback process. They preserve their value across every tick (update) within the same bar.
- **Use Case**: Counting ticks or tracking price movements within a single bar.
- **Warning**: `varip` can cause repainting because historical bars only execute once (at close), while realtime bars execute on every tick.

```pine
varip tickCount = 0  // Survives realtime bar rollback
tickCount := tickCount + 1  // Counts every tick, not just confirmed bars
```

## na Values

`na` represents missing or undefined values. It is a generic value with no particular type.

**Type Declaration Requirements**:
- When initializing a variable with `na`, you **must** specify the type or cast it, so the compiler knows the variable's type.
```pine
baseLine0 = na          // ERROR: Compiler doesn't know the type
float baseLine1 = na    // OK
baseLine2 = float(na)   // OK
```

**Handling na**:
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
- Script executes once per bar on historical data.
- Script executes multiple times per bar on realtime (each tick).
- On realtime: script "rolls back" between ticks (non-var variables reset).

### Time Series Concept
A **time series** is the fundamental data structure in Pine Script. It is a sequence of values that changes over time, with each value associated with a specific bar.

- **Storage**: Every variable and expression result is automatically stored as a time series.
- **History Operator `[]`**: Access past values of a series.
  - `close[1]` is the value of `close` on the previous bar.
  - `close[0]` is the current bar's value.
- **Dynamic Nature**: A series grows as the script executes bar-by-bar.

### Bar States
Bar states allow you to detect properties of the bar currently being executed.

| Variable | Description |
|----------|-------------|
| `barstate.isfirst` | `true` on the dataset's first bar (`bar_index == 0`). |
| `barstate.islast` | `true` on the rightmost bar on the chart (historical or realtime). |
| `barstate.ishistory` | `true` on all historical bars. Never `true` on realtime bars. |
| `barstate.isrealtime` | `true` if the current update is a realtime update. |
| `barstate.isnew` | `true` on all historical bars and on the first update of a realtime bar. |
| `barstate.isconfirmed` | `true` on all historical bars and on the **last (closing)** update of a realtime bar. |
| `barstate.islastconfirmedhistory` | `true` on the last historical bar (preceding the realtime bar). |

**Key Distinction**:
- `barstate.islast` is `true` for the entire duration of the realtime bar.
- `barstate.isconfirmed` is only `true` on the **final tick** of the realtime bar.
- A bar can be `islast` but not `isconfirmed` (while it's still ticking in realtime).

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

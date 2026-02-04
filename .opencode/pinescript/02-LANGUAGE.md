# Pine Script v6 Language Reference

## Core Concepts

### Execution Model
Pine Script executes in a **bar-by-bar** fashion:
1. **Historical Bars**: The script runs once per bar from left to right. On each bar, built-in variables (open, high, etc.) update, the script executes from top to bottom, and results are committed to the time series.
2. **Realtime Bar**: The script executes **repeatedly on every tick**. 
   - **Rollback**: Before each recalculation, the script state is "rolled back" to the last confirmed state (the close of the previous bar).
   - **Commit**: Only the final tick of the bar is saved to history.
   - **varip**: Variables declared with `varip` escape this rollback and persist across ticks.

### Type System & Qualifiers
Pine Script uses a dual-type system: **Type** (int, float, etc.) and **Qualifier** (const, input, etc.).

**Qualifier Hierarchy** (weakest to strongest):
`const` < `input` < `simple` < `series`

- **const**: Known at compile time (e.g., `10`).
- **input**: Known after user inputs are processed (e.g., `input.int(10)`).
- **simple**: Known on the first bar of the chart (e.g., `syminfo.mintick`).
- **series**: Can change on every bar (e.g., `close`).

**Rule**: A function expecting a qualifier will accept that qualifier or any **weaker** one, but never a **stronger** one. For example, a function requiring `simple int` will accept `const int` but not `series int`.

## Variables

### Declaration
```pine
// Type inference
length = 14
price = close

// Explicit type
float myFloat = 0.0
int myInt = 14
bool myBool = true
color myColor = color.red
string myStr = "hello"

// Must specify type when initializing with na
float x = na
// Or: x = float(na)
```

### Tuple Destructuring
```pine
[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)

// Ignore unused values with _
[macdLine, _, _] = ta.macd(close, 12, 26, 9)
```

### Reassignment
```pine
x = 10       // Declaration (first time)
x := x + 1   // Reassignment (subsequent)
x += 1       // Shorthand (also -=, *=, /=, %=)
```

### Persistence Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| (none) | Reinitialize every bar | Default, most calculations |
| `var` | Initialize once, persist across bars | Counters, state tracking, running totals |
| `varip` | Persist across realtime ticks AND bars | Tick counting (⚠️ **escapes rollback!**) |

**Important**: `varip` (Variable Intrabar Persist) is unique because it **escapes the rollback process** that occurs on every realtime tick. While normal variables reset to their state at the end of the previous bar before each tick calculation, `varip` variables retain their value from the previous tick. 

**Warning**: This causes **repainting**. Historical bars show only the final value when the bar closed, while the realtime bar's value changes with every tick. Use only for tasks like tick counting or tracking intrabar extremes.

```pine
counter = 0           // Always 0 (reinitializes each bar)
var counter2 = 0      // Increments: 1, 2, 3... (persists across bars)
varip counter3 = 0    // Counts every tick (WARNING: repaints during realtime bar)
```

### Scope

Variables have different accessibility depending on where they're declared:

| Scope | Accessible From | Lifetime |
|-------|-----------------|----------|
| **Global** | Anywhere in script | Entire script execution |
| **Function** | Only inside that function | Function call only |
| **Loop/Conditional** | Only inside that block | Block execution only |

```pine
globalVar = 10  // Accessible everywhere

myFunc() =>
    localVar = 5  // Only accessible inside myFunc
    localVar * 2

if condition
    blockVar = 3  // Only accessible inside this if block
    plot(blockVar)

// plot(blockVar)  // Error! blockVar not accessible here
```

**Important**: Variables declared inside functions, loops, or conditionals are **local** to that scope. They cannot be accessed outside their block. Use global variables (declared at script level) when you need to share data across functions or blocks.

## Operators

### Arithmetic
```pine
a + b    // Addition (also string concatenation)
a - b    // Subtraction
a * b    // Multiplication
a / b    // Division (returns float: 5 / 2 = 2.5, not 2)
a % b    // Modulo (remainder)
```

**Division Note**: Pine Script division always returns a float, even when dividing integers. If you need integer division, use `int(a / b)` to truncate.

**Modulo Note**: The modulo operator calculates the remainder using the formula: `a - b * math.floor(a/b)`. This behavior is consistent with how many mathematical systems handle negative numbers:
- `7 % 3 = 1` (7 - 3 * floor(2.33) = 7 - 3 * 2 = 1)
- `-7 % 3 = 2` (-7 - 3 * floor(-2.33) = -7 - 3 * -3 = 2)

### Comparison
```pine
a < b    // Less than
a <= b   // Less than or equal
a > b    // Greater than
a >= b   // Greater than or equal
a == b   // Equal (works on all types)
a != b   // Not equal (works on all types)
```

### Logical
```pine
not a        // Logical NOT
a and b      // Logical AND
a or b       // Logical OR
```

### Ternary
```pine
result = condition ? valueIfTrue : valueIfFalse

// Nested (avoid when possible)
result = cond1 ? val1 : cond2 ? val2 : val3
```

### Operator Precedence

Operators are evaluated in this order (highest to lowest precedence). Operators on the same level are evaluated left-to-right.

| Precedence | Operators | Description |
|-----------|-----------|-------------|
| 9 (Highest) | `[]` | History reference, array/map indexing |
| 8 | `+`, `-`, `not` | Unary plus, unary minus, logical NOT |
| 7 | `*`, `/`, `%` | Multiplication, division, modulo |
| 6 | `+`, `-` | Addition, subtraction |
| 5 | `>`, `<`, `>=`, `<=` | Comparison |
| 4 | `==`, `!=` | Equality |
| 3 | `and` | Logical AND |
| 2 | `or` | Logical OR |
| 1 (Lowest) | `?:` | Ternary operator |

**Example**: `a + b * c` evaluates as `a + (b * c)` because `*` has higher precedence than `+`.

### History Reference
```pine
close[0]    // Current bar (same as close)
close[1]    // Previous bar
close[10]   // 10 bars ago

// Works on any series
mySma[1]    // Previous bar's SMA value
```

## Conditional Structures

### if/else
```pine
if condition
    // 4 spaces or tab indent required
    doSomething()
else if otherCondition
    doSomethingElse()
else
    doDefault()
```

**Indentation**: Pine Script requires **4 spaces or 1 tab** for indentation inside conditional blocks. Inconsistent indentation will cause syntax errors.

### if as Expression
```pine
// Returns a value
color = if close > open
    color.green
else
    color.red
```

### switch Statement
```pine
// With expression
direction = switch
    close > open => "bullish"
    close < open => "bearish"
    => "neutral"  // Default case

// With input value
action = switch myInput
    "buy"  => 1
    "sell" => -1
    => 0
```

### Restrictions in Conditionals
The following functions **CANNOT** be called inside `if` or `switch` blocks because they must be executed on every bar to maintain their internal state or because they are global-scope only:
- **Plotting**: `plot()`, `plotshape()`, `plotchar()`, `plotarrow()`, `plotcandle()`, `plotbar()`
- **Visuals**: `barcolor()`, `bgcolor()`, `fill()`
- **Lines/Alerts**: `hline()`, `alertcondition()`
- **Declarations**: `indicator()`, `strategy()`, `library()`

**Solution**: Calculate the value/condition inside the block, but call the plotting function at the global scope using `na` for bars where nothing should be drawn:
```pine
// CORRECT
plotValue = condition ? close : na
plot(plotValue)

// For candles/bars
plotcandle(condition ? open : na, condition ? high : na, condition ? low : na, condition ? close : na)
```

### Indentation & Formatting
- **Blocks**: Local blocks (inside `if`, `for`, `while`, etc.) **must** be indented by **4 spaces or 1 tab**.
- **Line Wrapping**: To wrap a long line, the continuation line must start with any amount of indentation **except** a multiple of 4 (to avoid being mistaken for a new block).
  ```pine
  // Correct wrapping (2 spaces)
  x = open + 
    high + 
    low
  ```


## Loops

### for Loop
```pine
sum = 0.0
for i = 0 to 9
    sum += close[i]
// sum now contains sum of last 10 closes

// With step
for i = 0 to 20 by 2
    // i = 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20
```

### while Loop
```pine
i = 0
sum = 0.0
while i < 10
    sum += close[i]
    i += 1
```

### for...in Loop
```pine
// Iterate array
myArray = array.from(1, 2, 3, 4, 5)
for value in myArray
    // Process each value

// With index
for [index, value] in myArray
    // index = 0, 1, 2, 3, 4
    // value = 1, 2, 3, 4, 5
```

### Loop Control
```pine
for i = 0 to 9
    if skipCondition
        continue  // Skip to next iteration
    if exitCondition
        break     // Exit loop entirely
```

### Critical: var/varip with Loops

⚠️ **IMPORTANT**: If you initialize a variable with a loop's result using `var` or `varip`, the loop **exits after 1 iteration** on all bars after the first one!

```pine
// WRONG: Loop only runs once on the first bar
var sum = for i = 0 to 9
    close[i]  // This loop will NOT run on subsequent bars!
```

**Workarounds**:
1. **Declare before loop**, then reassign inside:
   ```pine
   var float mySum = na
   mySum := for i = 0 to 9
       close[i]
   ```
2. **Move to a function**:
   ```pine
   getSum() =>
       for i = 0 to 9
           close[i]
   var float mySum = getSum()
   ```

### When to Use Loops

**Prefer built-ins** when available (e.g., `ta.sma()`, `ta.highest()`). Use loops for:

1. **Iterating collections** (arrays, maps, matrices).
2. **Custom calculations** not available in built-ins.
3. **Variable lookback** based on current bar conditions:
   ```pine
   // Find how many bars ago the high was higher than current high
   lookback = 0
   for i = 1 to 500
       if high[i] > high
           lookback := i
           break
   ```

## User-Defined Functions

### Single-Line Function
```pine
double(x) => x * 2

// With types (recommended)
double(float x) => x * 2
```

### Multi-Line Function
```pine
//@function Calculates custom moving average
//@param source The source series
//@param length The lookback period
//@returns The smoothed value
customMA(float source, int length) =>
    sum = 0.0
    for i = 0 to length - 1
        sum += source[i]
    sum / length  // Last expression is return value
```

### Tuple Return
```pine
calcBands(float src, int len, float mult) =>
    basis = ta.sma(src, len)
    dev = mult * ta.stdev(src, len)
    [basis, basis + dev, basis - dev]

[middle, upper, lower] = calcBands(close, 20, 2.0)
```

### Optional Parameters
```pine
myFunc(float source, int length = 14, float multiplier = 1.0) =>
    ta.sma(source, length) * multiplier

// Call with defaults
result1 = myFunc(close)
// Call with some overrides
result2 = myFunc(close, 20)
// Call with all specified
result3 = myFunc(close, 20, 2.0)
```

### Methods
Methods are functions called with dot notation. The first parameter **must** have an explicit type, which determines what types the method can be used on.

```pine
// Define as method for 'float' type
method double(float this) => this * 2

// Use with dot notation
x = 5.0
y = x.double()  // y = 10.0
```

### Function Restrictions
Functions **cannot**:
- Be defined inside other functions.
- Modify global variables (use `:=` on globals is forbidden inside functions).
- Call themselves recursively.
- **Call certain built-ins**: Functions that require global scope or have specific execution requirements cannot be called from user functions. This includes:
  - `indicator()`, `strategy()`, `library()`
  - `input.*()` functions
  - `plot*()`, `barcolor()`, `bgcolor()`, `fill()`, `hline()`
  - `alertcondition()`

## User-Defined Types (Objects)

### Declaring a Type
```pine
// Define a type with `type` keyword
type Trade
    float entryPrice
    float stopLoss
    float takeProfit
    int barIndex
    string direction
```

### Creating Instances
```pine
// Create with TypeName.new()
myTrade = Trade.new(entryPrice=close, stopLoss=close * 0.98, 
                    takeProfit=close * 1.05, barIndex=bar_index, direction="long")

// Access fields with dot notation
plot(myTrade.entryPrice)
if myTrade.direction == "long"
    strategy.entry("Long", strategy.long)
```

### Persistence with var/varip
```pine
// var applies to ALL fields
var Trade savedTrade = na

// varip must be declared per-field in type definition
type TickCounter
    varip int count = 0  // This field persists across ticks
    int regularField     // This field follows normal rules
```

### Copying Objects
```pine
// Objects are assigned by REFERENCE
trade1 = Trade.new(100, 95, 110, bar_index, "long")
trade2 = trade1        // trade2 points to SAME object!
trade2.entryPrice := 105  // Changes trade1 too!

// Use .copy() for shallow copy
trade3 = trade1.copy()    // trade3 is independent
trade3.entryPrice := 110  // Only changes trade3

// Deep copy for objects containing arrays/maps/UDTs
method deepCopy(Trade this) =>
    Trade.new(this.entryPrice, this.stopLoss, this.takeProfit, 
              this.barIndex, this.direction)
```

### Collecting Objects
```pine
// Use type template for collections
var trades = array.new<Trade>()
array.push(trades, Trade.new(close, close * 0.98, close * 1.05, bar_index, "long"))

// Iterate
for t in trades
    if t.direction == "long"
        label.new(t.barIndex, t.entryPrice, "Entry")
```

## Enumerations (Enums)

### Declaring an Enum
```pine
// Define with `enum` keyword
enum Signal
    buy = "Buy Signal"    // Optional display title
    sell = "Sell Signal"
    neutral               // No title = uses field name

enum TrendState
    bullish
    bearish
    sideways
```

### Using Enums
```pine
// Access with EnumName.fieldName
currentSignal = Signal.buy

// Compare with == / !=
if currentSignal == Signal.buy
    strategy.entry("Long", strategy.long)

// Use in switch statements
action = switch currentSignal
    Signal.buy => 1
    Signal.sell => -1
    Signal.neutral => 0
```

### Enum Type Safety
```pine
// Different enum types are INCOMPATIBLE
enum ColorChoice
    red
    green

enum Direction
    up
    down

// myDir = ColorChoice.red  // Error if used where Direction expected

// Get display string
label.new(bar_index, high, str.tostring(Signal.buy))  // Shows "Buy Signal"
```

### Enum Inputs
```pine
// User-selectable enum input
signalChoice = input.enum(Signal.neutral, "Signal Type")

// Works in conditionals
if signalChoice == Signal.buy
    bgcolor(color.new(color.green, 90))
```

### Collecting Enums
```pine
var signals = array.new<Signal>()
array.push(signals, Signal.buy)
array.push(signals, Signal.sell)

for sig in signals
    if sig == Signal.buy
        // Process buy signals
```

## Collections
Pine Script supports three types of collections for managing groups of data. All collections are **reference types** and always have the `series` qualifier.

- **Arrays**: One-dimensional ordered lists (e.g., `array<float>`).
- **Maps**: Key-value pairs where keys are fundamental types (e.g., `map<string, float>`).
- **Matrices**: Two-dimensional grids of data (e.g., `matrix<int>`).

For detailed usage, see [03-DATA-STRUCTURES.md](03-DATA-STRUCTURES.md).

## Best Practices

1. **Use explicit types** for clarity
2. **Prefer built-ins** over manual loops
3. **Compose conditions** instead of nesting:
   ```pine
   // Better than nested if/else
   isBullish = close > open and volume > ta.sma(volume, 20)
   ```
4. **Document functions** with //@function annotations
5. **Avoid varip** unless specifically needed for tick counting
6. **Use UDTs** to group related data (trades, signals, levels)
7. **Use enums** for fixed sets of options (signal types, states)
8. **Respect scope** — declare variables at the appropriate level (global vs local)
9. **Avoid modifying globals** — return values from functions instead

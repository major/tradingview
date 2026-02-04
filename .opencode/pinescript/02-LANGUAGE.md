# Pine Script v6 Language Reference

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
| `varip` | Persist across realtime ticks AND bars | Tick counting (⚠️ **causes repainting!**) |

**Important**: `varip` causes **repainting** because the value changes during the realtime bar as new ticks arrive, then locks in when the bar closes. Historical bars show the final closed value, not the intermediate tick values. Use only when tick-level precision is essential.

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

**Modulo Note**: The modulo operator calculates remainder using the formula: `a - b * floor(a/b)`. This means:
- `7 % 3 = 1` (because 7 - 3 * floor(7/3) = 7 - 3 * 2 = 1)
- `-7 % 3 = 2` (because -7 - 3 * floor(-7/3) = -7 - 3 * (-3) = 2)
- Modulo with negative numbers may produce unexpected results; use `abs()` if you need traditional behavior

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

| Precedence | Operators | Type |
|-----------|-----------|------|
| 1 (Highest) | `[]` | History reference, array/map indexing |
| 2 | `.` | Method call, field access |
| 3 | `not` | Logical NOT |
| 4 | `*`, `/`, `%` | Multiplication, division, modulo |
| 5 | `+`, `-` | Addition, subtraction |
| 6 | `<`, `<=`, `>`, `>=` | Comparison |
| 7 | `==`, `!=` | Equality |
| 8 | `and` | Logical AND |
| 9 (Lowest) | `or` | Logical OR |

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
These functions CANNOT be called inside if/switch blocks:
- `plot()`, `plotshape()`, `plotchar()`, `plotarrow()`, `plotcandle()`, `plotbar()`
- `barcolor()`, `bgcolor()`, `fill()`
- `hline()`, `alertcondition()`
- `indicator()`, `strategy()`, `library()`

**Solution**: Calculate conditionally, plot unconditionally:
```pine
// WRONG
if condition
    plot(value)  // Error!

// CORRECT
plotValue = condition ? value : na
plot(plotValue)
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

⚠️ **IMPORTANT**: When a loop is initialized with `var` or `varip`, it **exits after 1 iteration** on subsequent bars!

```pine
// WRONG: Loop only runs once after first bar
var sum = 0.0
for i = 0 to 9
    sum += close[i]  // Only executes on first bar, then exits!

// CORRECT: Reinitialize loop variable each bar
sum = 0.0
for i = 0 to 9
    sum += close[i]  // Runs fully every bar

// CORRECT: Use var for accumulation, not loop
var sum = 0.0
sum += close[0]  // Add current bar's close each bar
```

**Why this happens**: The `var` keyword persists the loop's internal state. Once the loop completes, its state is "done", so it doesn't re-enter on subsequent bars.

**Workaround**: If you need to accumulate values across bars, use `var` on the accumulator variable, not the loop itself.

### When to Use Loops

**Prefer built-ins** when available:
```pine
// BAD: Manual loop
sum = 0.0
for i = 0 to length - 1
    sum += close[i]
avg = sum / length

// GOOD: Use built-in
avg = ta.sma(close, length)
```

**Use loops for**:

1. **Iterating collections** (arrays, maps, matrices):
   ```pine
   myArray = array.from(10, 20, 30, 40, 50)
   for value in myArray
       plot(value)
   ```

2. **Custom calculations not in built-ins**:
   ```pine
   // Calculate weighted moving average with custom weights
   weights = array.from(0.5, 0.3, 0.2)
   sum = 0.0
   for [i, w] in weights
       sum += close[i] * w
   wma = sum
   ```

3. **Variable lookback based on runtime conditions**:
   ```pine
   // Sum closes for a user-specified number of bars
   userLength = input(10, "Lookback Period")
   sum = 0.0
   for i = 0 to userLength - 1
       sum += close[i]
   avg = sum / userLength
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
```pine
// Define as method
method double(float this) => this * 2

// Use with dot notation
x = 5.0
y = x.double()  // y = 10.0
```

### Function Restrictions

Functions **cannot**:
- Be defined inside other functions
- Modify global variables
- Modify their parameters
- Call themselves recursively

```pine
// WRONG: Modifying global
var globalVar = 0
badFunc() =>
    globalVar := 1  // Error!

// CORRECT: Return new value
goodFunc(int val) =>
    val + 1
```

**Built-in Functions Not Callable from User Functions**: The following built-in functions cannot be called from inside user-defined functions:
- **Plotting**: `plot()`, `plotshape()`, `plotchar()`, `plotarrow()`, `plotcandle()`, `plotbar()`, `barcolor()`, `bgcolor()`, `fill()`, `hline()`
- **Alerts**: `alertcondition()`
- **Script Declaration**: `indicator()`, `strategy()`, `library()`
- **Request Functions**: `request.security()` (with certain parameters)

**Workaround**: Calculate values in functions, then plot/alert at the global scope:
```pine
// WRONG
myFunc() =>
    plot(close)  // Error!

// CORRECT
myFunc() =>
    close * 2    // Return value

result = myFunc()
plot(result)     // Plot at global scope
```

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

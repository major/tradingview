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
| `var` | Initialize once, persist | Counters, state tracking |
| `varip` | Persist across realtime ticks | Tick counting (causes repainting!) |

```pine
counter = 0           // Always 0
var counter2 = 0      // Increments: 1, 2, 3...
varip counter3 = 0    // Counts every tick (WARNING: repaints)
```

## Operators

### Arithmetic
```pine
a + b    // Addition (also string concatenation)
a - b    // Subtraction
a * b    // Multiplication
a / b    // Division
a % b    // Modulo (remainder)
```

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
- `plot()`, `plotshape()`, `plotchar()`, `plotarrow()`
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
- Iterating collections (arrays, maps, matrices)
- Custom calculations not in built-ins
- Variable lookback based on runtime conditions

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

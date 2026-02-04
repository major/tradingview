# Pine Script v6 Libraries Reference

Libraries let you create reusable functions that can be imported into other scripts.

## Creating a Library

### Basic Structure
```pine
//@version=6
library("MyLibrary")

// Export functions with `export` keyword
export myFunction(float source, int length) =>
    ta.sma(source, length)

// Functions without export are private
privateHelper() =>
    // Only usable within this library
    true
```

### Library Declaration
```pine
library(title, overlay, dynamic_requests)
```

| Parameter | Description |
|-----------|-------------|
| `title` | Library name (must match filename) |
| `overlay` | true = overlays chart (optional) |
| `dynamic_requests` | true = allows dynamic `request.*()` calls (optional, default: true) |

## Exporting Functions

### Basic Export
```pine
//@version=6
library("TrendLib")

//@function Calculates trend direction
//@param src Source series
//@param len Lookback period
//@returns 1 for up, -1 for down, 0 for neutral
export trend(float src, int len) =>
    sma = ta.sma(src, len)
    src > sma ? 1 : src < sma ? -1 : 0
```

### Tuple Returns
```pine
export calcBands(float src, int len, float mult) =>
    basis = ta.sma(src, len)
    dev = mult * ta.stdev(src, len)
    [basis, basis + dev, basis - dev]
```

### Type Requirements
- Parameters must have explicit types.
- Return type is inferred from function body.
- Can use `simple` or `series` type qualifiers to control parameter acceptance.

### Qualified Type Control
Pine Script automatically determines the qualified types of arguments based on how the function uses them. You can explicitly control this using `simple` or `series` keywords.

```pine
// Restricting to 'simple' forces the function to return a 'simple' result
// (provided no 'series' values are used in the calculation)
export makeTickerid(simple string prefix, simple string ticker) =>
    prefix + ":" + ticker
```

- **`simple`**: Parameter accepts `simple`, `const`, or `input` qualifiers.
- **`series`**: Parameter accepts any qualifier (default behavior for most parameters).
- **Note**: Reference types (UDTs, arrays, etc.) always inherit the `series` qualifier.

### Return Type Constraints
Library functions **always** return `simple` or `series` results. They never return `const` or `input` types.
- This means you cannot use a library function's result in parameters requiring `const` or `input` (e.g., `show_last` in `plot()`).
- To return a `simple` result, ensure all parameters used in the calculation are `simple` and no `series` values are involved.

## Exporting Methods
Libraries can export user-defined methods using the `export` keyword. These methods can then be used with dot notation on objects of the corresponding type.

```pine
export method riskReward(Trade t) =>
    math.abs(t.target - t.entry) / math.abs(t.entry - t.stop)
```

## Exporting Types (UDTs)
UDTs can be exported to allow users to create instances. Fields can have default values.

```pine
//@version=6
library("TradeLib")

// Export type so users can create instances
export type Trade
    float entry = 0.0
    float stop = 0.0
    float target = 0.0
    string direction = "long"

// Export functions that use the type
export createTrade(float entry, float stop, float target, string dir) =>
    Trade.new(entry, stop, target, dir)
```


## Exporting Enums
Enums provide type-safe named constants, making code more readable and preventing errors from invalid values.

```pine
//@version=6
library("SignalLib")

// Export enum for use in other scripts
export enum Signal
    buy = "Buy Signal"
    sell = "Sell Signal"
    neutral = "No Signal"
```


## Library Constraints

### Exported Function Constraints:
- **Global Variables**: Exported functions cannot use variables from the library's global scope **unless** they have the `const` qualifier.
- **Inputs**: Cannot include calls to any `input.*()` functions.
- **Request Calls**: Can include `request.*()` calls (if `dynamic_requests != false`), but the `expression` argument **cannot** depend on any exported function parameters.
- **Return Types**: Always return `simple` or `series` results. They never return `const` or `input` types.

### Cannot Use in Libraries:
| Feature | Alternative |
|---------|-------------|
| Non-const global variables | Pass as parameters |
| `input.*()` functions | Accept as parameters |
| Mutable global state | Return values instead |

### CAN Use in Libraries:
- `request.*()` (if `dynamic_requests=true`)
- All `ta.*`, `math.*`, `str.*` functions
- UDT definitions and methods
- Enum definitions

## Using Libraries

### Import Syntax
```pine
import username/LibraryName/version [as alias]
```

- **Namespace**: If no `alias` is defined, the `LibraryName` becomes the namespace.
- **Auto-complete**: The Pine Editor provides auto-complete support for all exported functions, methods, types, and enums from imported libraries.

```pine
//@version=6
indicator("My Indicator")

import TradingView/ta/1 as tvTA
import myUsername/TrendLib/2 // Namespace is 'TrendLib'

// Use imported functions
trendDir = TrendLib.trend(close, 20)
```


### Accessing Exported Types
```pine
import myUsername/TradeLib/1 as tlib

// Create instance of exported type
myTrade = tlib.Trade.new(100.0, 95.0, 110.0, "long")

// Use exported function
rr = tlib.riskReward(myTrade)
```

### Accessing Exported Enums
```pine
import myUsername/SignalLib/1 as sig

currentSignal = sig.getSignal(fastMA, slowMA)
if currentSignal == sig.Signal.buy
    strategy.entry("Long", strategy.long)
```

## Publishing Libraries

### Requirements:
1. **Must publish** (public or private) before use in other scripts.
2. Private libraries work in protected/invite-only scripts.
3. Public libraries can be used by anyone.

### House Rules for Reuse:
- Public libraries are considered "public domain" code.
- You can reuse code from public libraries, but you must follow TradingView's House Rules regarding attribution and original work.

### Versioning Strategy:
- **Explicit Versioning**: Pine Script requires explicit version numbers in `import` statements. There is no "latest" tag to prevent breaking changes in dependent scripts.
- Each publish creates a new version number.
- Update the version number in your `import` statement to use the latest features or fixes.
- Changing function signatures or exported types usually requires a new major version to avoid breaking existing scripts.

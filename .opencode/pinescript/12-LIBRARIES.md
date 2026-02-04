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
library(title, overlay)
```

| Parameter | Description |
|-----------|-------------|
| `title` | Library name (must match filename) |
| `overlay` | true = overlays chart (optional) |

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
- Parameters must have explicit types
- Return type is inferred from function body
- Can use `simple` or `series` type qualifiers
- Cannot return `const` or `input` types

## Exporting Types (UDTs)

```pine
//@version=6
library("TradeLib")

// Export type so users can create instances
export type Trade
    float entry
    float stop
    float target
    string direction

// Export functions that use the type
export createTrade(float entry, float stop, float target, string dir) =>
    Trade.new(entry, stop, target, dir)

export riskReward(Trade t) =>
    math.abs(t.target - t.entry) / math.abs(t.entry - t.stop)
```

## Exporting Enums

```pine
//@version=6
library("SignalLib")

// Export enum for use in other scripts
export enum Signal
    buy
    sell
    neutral

export getSignal(float fast, float slow) =>
    fast > slow ? Signal.buy : fast < slow ? Signal.sell : Signal.neutral
```

## Library Constraints

### Cannot Use in Libraries:
| Feature | Alternative |
|---------|-------------|
| Global variables (except const) | Pass as parameters |
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
import username/LibraryName/version as alias
```

```pine
//@version=6
indicator("My Indicator")

import TradingView/ta/1 as tvTA
import myUsername/TrendLib/2 as trend

// Use imported functions
trendDir = trend.trend(close, 20)
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
1. Must publish (public or private) before use
2. Private libraries work in protected/invite-only scripts
3. Public libraries can be used by anyone

### Version Management:
- Each publish creates a new version number
- Users import specific versions
- Update version number when changing function signatures

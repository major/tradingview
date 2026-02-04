# Pine Script v6 Built-in Functions

## Technical Analysis (ta.*)

### Moving Averages

```pine
ta.sma(source, length)              // Simple Moving Average
ta.ema(source, length)              // Exponential Moving Average
ta.wma(source, length)              // Weighted Moving Average
ta.vwma(source, length)             // Volume-Weighted MA
ta.rma(source, length)              // Running MA (Wilder's smoothing)
ta.hma(source, length)              // Hull Moving Average
ta.alma(source, length, offset, sigma)  // Arnaud Legoux MA
ta.swma(source)                     // Symmetrically Weighted MA (4-bar)
ta.linreg(source, length, offset)   // Linear Regression
```

### Oscillators

```pine
ta.rsi(source, length)              // Relative Strength Index (0-100)
ta.mfi(hlc3, volume, length)        // Money Flow Index
ta.cci(source, length)              // Commodity Channel Index
ta.cmo(source, length)              // Chande Momentum Oscillator
ta.mom(source, length)              // Momentum
ta.roc(source, length)              // Rate of Change (%)
ta.tsi(source, short_len, long_len) // True Strength Index
```

### MACD

```pine
[macdLine, signalLine, histogram] = ta.macd(source, fastLen, slowLen, signalLen)
// Returns tuple: [macd, signal, hist]
```

### Stochastic

```pine
ta.stoch(close, high, low, length)  // Raw stochastic %K
// Full stochastic:
k = ta.stoch(close, high, low, kPeriod)
d = ta.sma(k, dPeriod)
```

### Bollinger Bands

```pine
[middle, upper, lower] = ta.bb(source, length, mult)
// mult = standard deviation multiplier (default 2.0)
```

### ATR and Volatility

```pine
ta.atr(length)                      // Average True Range
ta.tr                               // True Range (current bar)
ta.tr(handleNa)                     // TR with na handling
ta.stdev(source, length)            // Standard Deviation
ta.variance(source, length)         // Variance
```

### Trend Indicators

```pine
ta.supertrend(factor, atrPeriod)    // Returns [supertrend, direction]
ta.sar(start, inc, max)             // Parabolic SAR
[diPlus, diMinus, adx] = ta.dmi(diLen, adxSmooth)  // DMI/ADX
ta.vwap(source)                     // VWAP (intraday)
```

### Highs and Lows

```pine
ta.highest(source, length)          // Highest value in period
ta.lowest(source, length)           // Lowest value in period
ta.highestbars(source, length)      // Bars since highest
ta.lowestbars(source, length)       // Bars since lowest
ta.pivothigh(source, leftbars, rightbars)   // Pivot high detection
ta.pivotlow(source, leftbars, rightbars)    // Pivot low detection
```

### Crossovers and Comparisons

```pine
ta.crossover(source1, source2)      // source1 crosses above source2
ta.crossunder(source1, source2)     // source1 crosses below source2
ta.cross(source1, source2)          // Any cross (above or below)
ta.rising(source, length)           // Has risen for N bars
ta.falling(source, length)          // Has fallen for N bars
```

### Bar Counting

```pine
ta.barssince(condition)             // Bars since condition was true
ta.valuewhen(condition, source, occurrence)  // Value when condition was true
ta.cum(source)                      // Cumulative sum
```

### Volume Indicators

```pine
ta.obv(source, volume)              // On-Balance Volume
ta.pvt(source, volume)              // Price Volume Trend
```

## Math Functions (math.*)

### Basic Math

```pine
math.abs(x)                         // Absolute value
math.sign(x)                        // Sign (-1, 0, 1)
math.sqrt(x)                        // Square root
math.pow(base, exponent)            // Power
math.exp(x)                         // e^x
math.log(x)                         // Natural logarithm
math.log10(x)                       // Base-10 logarithm
```

### Rounding

```pine
math.round(x)                       // Round to nearest integer
math.round(x, precision)            // Round to N decimal places
math.floor(x)                       // Round down
math.ceil(x)                        // Round up
math.round_to_mintick(x)            // Round to symbol's mintick
```

### Comparison

```pine
math.max(a, b)                      // Maximum of two values
math.min(a, b)                      // Minimum of two values
math.avg(a, b, ...)                 // Average of values
math.sum(source, length)            // Sum over period
```

### Trigonometry

```pine
math.sin(x)                         // Sine (radians)
math.cos(x)                         // Cosine
math.tan(x)                         // Tangent
math.asin(x)                        // Arc sine
math.acos(x)                        // Arc cosine
math.atan(x)                        // Arc tangent
math.todegrees(radians)             // Radians to degrees
math.toradians(degrees)             // Degrees to radians
```

### Random

```pine
math.random()                       // Random float 0.0-1.0
```

## String Functions (str.*)

### Conversion

```pine
str.tostring(value)                 // Any value to string
str.tostring(value, format)         // With format (format.mintick, etc.)
str.tonumber(string)                // String to number (float)
```

> [!TIP]
> **Custom Patterns**: The `format` parameter in `str.tostring()` supports custom patterns like `#.###` (3 decimal places), `0.00000` (fixed 5 places with trailing zeros), `0000,000.##` (commas and leading zeros), and `#.####%` (percentage).

### Formatting

```pine
str.format("{0} is {1}%", symbol, percent)  // Python-style formatting
str.format_time(timestamp, format, timezone)
// Format: "yyyy-MM-dd HH:mm:ss"
```

> [!TIP]
> **str.format() tokens**:
> - `#`: Digit, omitted if not needed.
> - `0`: Digit, replaced by 0 if not needed.
> - `.`: Decimal point.
> - `,`: Grouping separator.
> - `%`: Percentage (multiplies by 100).

### String Operations

```pine
str.length(s)                       // Character count
str.contains(s, substring)          // Check if contains
str.startswith(s, prefix)           // Check start
str.endswith(s, suffix)             // Check end
str.pos(s, substring)               // Find position (-1 if not found)
```

### Manipulation

```pine
str.replace(s, old, new, count)     // Replace occurrences
str.replace_all(s, old, new)        // Replace all occurrences
str.split(s, separator)             // Split to array<string>
str.upper(s)                        // Uppercase
str.lower(s)                        // Lowercase
str.trim(s)                         // Remove whitespace
str.substring(s, beginIndex, endIndex)  // Extract substring
```

## Data Request (request.*)

### request.security()

```pine
request.security(
    symbol,                         // Symbol/ticker
    timeframe,                      // Timeframe ("", "D", "W", "M", "60", etc.)
    expression,                     // What to fetch (close, ta.rsi(), etc.)
    gaps = barmerge.gaps_off,       // barmerge.gaps_on returns na on bars without new data
    lookahead = barmerge.lookahead_off,  // lookahead_on uses future data (DANGEROUS!)
    ignore_invalid_symbol = false,
    currency = syminfo.currency,
    calc_bars_count = 0
)

// Examples:
dailyClose = request.security(syminfo.tickerid, "D", close)
spyRsi = request.security("SPY", "60", ta.rsi(close, 14))
```

### request.security_lower_tf()

> [!NOTE]
> **Intrabars**: This function retrieves "intrabars" (lower timeframe bars within a chart bar). It **always** returns an `array` of the expression's type.

```pine
// Get array of lower timeframe data
request.security_lower_tf(symbol, timeframe, expression)

// Example: Get all 1-minute closes in current bar
minuteCloses = request.security_lower_tf(syminfo.tickerid, "1", close)
```

### Other Data Requests

```pine
request.currency_rate(from, to, ignore_invalid_currency) // Currency conversion rates
request.economic(country_code, field, gaps, ignore_invalid_symbol) // Economic and industry data
request.footprint(ticks_per_row, va_percent, imbalance_percent) // Volume footprint data (new in 2026)
request.seed(source, symbol, expression, ignore_invalid_symbol, calc_bars_count) // Data from GitHub repos
request.financial(symbol, financial_id, period, gaps, ignore_invalid_symbol, currency)
request.dividends(symbol, field, gaps, lookahead, ignore_invalid_symbol)
request.splits(symbol, field, gaps, lookahead, ignore_invalid_symbol)
request.earnings(symbol, field, gaps, lookahead, ignore_invalid_symbol)
request.quandl(quandl_code, gaps, index, ignore_invalid_symbol)
```

## Input Functions (input.*)

```pine
input(defval, title, tooltip, inline, group, confirm)           // Auto-detect type
input.int(defval, title, minval, maxval, step, ...)
input.float(defval, title, minval, maxval, step, ...)
input.bool(defval, title, ...)
input.string(defval, title, options, ...)                       // options = dropdown array
input.color(defval, title, ...)
input.source(defval, title, ...)                                // Source dropdown (close, open, etc.)
input.symbol(defval, title, ...)                                // Symbol picker
input.timeframe(defval, title, ...)                             // Timeframe dropdown
input.session(defval, title, ...)                               // Session string
input.time(defval, title, ...)                                  // Timestamp picker
input.price(defval, title, ...)                                 // Interactive price level
input.text_area(defval, title, ...)                             // Multi-line text
```

### Input Grouping

```pine
grpMA = "Moving Averages"
maLength = input.int(20, "MA Length", group=grpMA)
maType = input.string("SMA", "MA Type", options=["SMA", "EMA", "WMA"], group=grpMA)
```

## Symbol Info (syminfo.*)

> [!IMPORTANT]
> **Context-Dependent Behavior**: When used inside a `request.*()` expression argument, `syminfo.tickerid` returns the **requested** context's ticker ID, not the chart's. Use `syminfo.main_tickerid` to always get the chart's ticker ID.

```pine
syminfo.ticker          // "AAPL" (symbol without exchange)
syminfo.tickerid        // "NASDAQ:AAPL" (full symbol with exchange)
syminfo.main_tickerid   // Always chart's ticker ID even in requested contexts
syminfo.prefix          // Exchange or broker identifier (e.g., "NASDAQ", "CME_MINI_DL")
syminfo.basecurrency    // Base currency (for forex/crypto)
syminfo.currency        // Quote currency
syminfo.description     // Full name
syminfo.mintick         // Minimum price increment
syminfo.mincontract     // Smallest tradable amount set by exchange
syminfo.pointvalue      // Point value for futures
syminfo.root            // Root symbol (for futures)
syminfo.session         // Session hours
syminfo.timezone        // Symbol timezone
syminfo.type            // "stock", "forex", "crypto", "futures", "index"
```

## Timeframe Info (timeframe.*)

> [!IMPORTANT]
> **Context-Dependent Behavior**: When used inside a `request.*()` expression argument, `timeframe.period` returns the **requested** context's timeframe, not the chart's. Use `timeframe.main_period` to always get the script's main timeframe.

```pine
timeframe.period        // "D", "W", "60", etc.
timeframe.main_period   // Always script's main timeframe even in requested contexts
timeframe.multiplier    // Numeric multiplier (1, 5, 60)
timeframe.isseconds     // Is seconds timeframe
timeframe.isminutes     // Is minutes timeframe
timeframe.isintraday    // Is intraday (< 1D)
timeframe.isdaily       // Is daily
timeframe.isweekly      // Is weekly
timeframe.ismonthly     // Is monthly
```

## Time Functions (time.*)

```pine
time                    // Bar open time (Unix timestamp ms)
time_close              // Bar close time
time_tradingday         // Trading day timestamp
timenow                 // Current real-world time

// Time components (require timezone)
hour(time, timezone)
minute(time, timezone)
second(time, timezone)
dayofweek(time, timezone)   // 1=Sunday, 7=Saturday
dayofmonth(time, timezone)
month(time, timezone)
year(time, timezone)

// Create timestamp
timestamp(year, month, day, hour, minute, second)
timestamp(timezone, year, month, day, hour, minute, second)
```

## Color Functions (color.*)

```pine
color.new(baseColor, transp)        // Modify transparency (0-100)
color.rgb(red, green, blue, transp) // Create from RGB (0-255, transp 0-100)
color.from_gradient(value, bottom_value, top_value, bottom_color, top_color)

// Extract components
color.r(c)                          // Red component
color.g(c)                          // Green component  
color.b(c)                          // Blue component
color.t(c)                          // Transparency
```

## Format Constants

```pine
format.inherit          // Inherit from scale
format.mintick          // Symbol's mintick precision
format.percent          // Percentage format
format.price            // Price format
format.volume           // Volume format
```

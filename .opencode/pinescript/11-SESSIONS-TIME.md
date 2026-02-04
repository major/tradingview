# Pine Script v6 Sessions & Time Reference

## Timeframes

### Timeframe Strings
Timeframe strings (also called *intervals* or *resolutions*) define the unit of time represented by one bar. They are used in `request.security()`, `time()`, `time_close()`, and `input.timeframe()`.

#### Format
```
[Multiplier][Unit]
```
- **Multiplier**: An optional integer. If omitted, `1` is assumed.
- **Unit**: A single letter representing the time unit.

| Unit | Description | Valid Multipliers | Example |
|------|-------------|-------------------|---------|
| (none)| Minutes | 1 to 1440 | `"1"`, `"60"`, `"240"` |
| `S` | Seconds | 1, 5, 10, 15, 30, 45 | `"1S"`, `"30S"` |
| `D` | Days | 1 to 365 | `"1D"`, `"3D"` |
| `W` | Weeks | 1 to 52 | `"1W"`, `"2W"` |
| `M` | Months | 1 to 12 | `"1M"`, `"3M"` |
| `T` | Ticks | 1, 10, 100, 1000 | `"1T"`, `"100T"` |

**Note**: There is no `"H"` unit for hours. Use minutes instead (e.g., `"60"` for 1 hour, `"120"` for 2 hours).

### Using Timeframes
```pine
//@version=6
indicator("Timeframe Example")

// Get current timeframe
currentTF = timeframe.period // Returns "1D", "60", etc.

// Request data from a higher timeframe
dailyClose = request.security(syminfo.tickerid, "1D", close)

// Check if current timeframe is intraday
isIntraday = timeframe.isintraday
```

---

## Session Strings

### Format
```
HHMM-HHMM:DAYS
```
- `HHMM`: 24-hour time (0000-2359).
- `DAYS`: 1=Sunday, 2=Monday, 3=Tuesday, 4=Wednesday, 5=Thursday, 6=Friday, 7=Saturday.
- **Multiple Periods**: Discrete time periods can be comma-separated.

### Examples
```pine
"0930-1600:23456"     // Mon-Fri 9:30 AM - 4:00 PM
"0800-0900,1300-1700" // Two discrete periods, every day (default 1234567)
"1700-1700:23456"     // Overnight session (5 PM to 5 PM next day), Mon-Fri
"0000-0000:1234567"   // 24/7
"24x7"                // Shorthand for 24/7
```

### Named Sessions
Exchanges define specific named sessions for symbols.
- `"regular"`: Regular trading hours.
- `"extended"`: Extended hours (includes pre-market and post-market).
- `"premarket"`: Pre-market only.
- `"postmarket"`: Post-market only.

**Critical Note**: `request.*()` functions (like `request.security()`) **only** support named sessions via `ticker.new()`. They do **not** support custom time-based session strings.

---

## Time Handling

### UNIX Timestamps
Pine Script uses UNIX timestamps in **milliseconds** since the Epoch (1970-01-01 00:00:00 UTC).
- Timestamps are **time zone-agnostic**; they represent an absolute point in time.
- `time`: Opening time of the current bar.
- `time_close`: Closing time of the current bar.
- `timenow`: Current real-world time. **Warning**: Using `timenow` causes repainting as its value changes with every update.

### Timezone Contexts
1. **Exchange Timezone**: Accessed via `syminfo.timezone`. Calendar variables (`hour`, `dayofweek`, etc.) use this by default.
2. **Chart Timezone**: A visual preference set by the user. Scripts **cannot** access this value.
3. **Function Parameter**: Many time functions accept a `timezone` string (e.g., `"America/New_York"`, `"UTC+5"`).

### Time Functions

#### timestamp()
Creates a UNIX timestamp from calendar components.
```pine
// timestamp([timezone], year, month, day, hour, minute, second)
ts = timestamp("America/New_York", 2024, 01, 01, 09, 30, 00)
```

#### time() and time_close()
Used to check sessions or retrieve times from other bars.
```pine
// time(timeframe, session, [timezone])
inSession = not na(time(timeframe.period, "0930-1600:23456"))

// bars_back: Use negative values to look into the FUTURE (up to -500)
futureTime = time(timeframe.period, bars_back = -10) 
```

#### Time Components
Functions to extract parts of a timestamp. They accept an optional `timezone`.
```pine
year(time)           // Year (e.g., 2024)
month(time)          // Month (1-12)
dayofmonth(time)     // Day (1-31)
dayofweek(time)      // Day of week (1=Sun, 7=Sat)
hour(time)           // Hour (0-23)
minute(time)         // Minute (0-59)
second(time)         // Second (0-59)
```

---

## Advanced Patterns

### Dynamic Sessions
You can calculate session strings dynamically based on conditions.
```pine
//@version=6
indicator("Dynamic Session")
// Use different hours for Monday vs other days
sessionStr = (dayofweek == dayofweek.monday) ? "1000-1600" : "0900-1600"
inSession = not na(time(timeframe.period, sessionStr))
bgcolor(inSession ? color.new(color.green, 90) : na)
```

### Session High/Low
```pine
//@version=6
indicator("Session High/Low", overlay=true)

sessionStr = "0930-1600:23456"
inSession = not na(time(timeframe.period, sessionStr))
newSession = ta.change(time(timeframe.period, sessionStr))

var float sessionHigh = na
var float sessionLow = na

if newSession
    sessionHigh := high
    sessionLow := low
else if inSession
    sessionHigh := math.max(sessionHigh, high)
    sessionLow := math.min(sessionLow, low)

plot(sessionHigh, "Session High", color.green, style=plot.style_stepline)
plot(sessionLow, "Session Low", color.red, style=plot.style_stepline)
```

**References**:
- `pine-script-docs/concepts/sessions.html` - Sessions
- `pine-script-docs/concepts/time.html` - Time handling
- `pine-script-docs/concepts/timeframes.html` - Timeframes

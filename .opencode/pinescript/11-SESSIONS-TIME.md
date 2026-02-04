# Pine Script v6 Sessions & Time Reference

## Session Strings

### Format
```
HHMM-HHMM:DAYS
```

- `HHMM`: 24-hour time (0000-2359)
- `DAYS`: 1=Sunday, 2=Monday, ... 7=Saturday

### Examples
```pine
"0930-1600:23456"     // Mon-Fri 9:30 AM - 4:00 PM
"1700-1700:23456"     // Overnight session (5 PM to 5 PM next day)
"0000-0000:1234567"   // 24/7
"24x7"                // Shorthand for 24/7
```

### Using Sessions
```pine
//@version=6
indicator("Session Example", overlay=true)

// Define session
usSession = "0930-1600:23456"

// Check if bar is in session
inSession = not na(time(timeframe.period, usSession))

bgcolor(inSession ? color.new(color.blue, 90) : na)
```

## Session Functions

### time() with Session
```pine
// Returns bar time if in session, na otherwise
sessionTime = time(timeframe.period, "0930-1600:23456")
inSession = not na(sessionTime)
```

### time_close() with Session
```pine
// Returns bar close time if in session
sessionCloseTime = time_close(timeframe.period, "0930-1600:23456")
```

### User Input for Session
```pine
sessionInput = input.session("0930-1600", "Trading Session")
inSession = not na(time(timeframe.period, sessionInput))
```

## Named Sessions

### Exchange-Defined Sessions
```pine
"regular"     // Regular trading hours
"extended"    // Extended hours (pre + post)
"premarket"   // Pre-market only
"postmarket"  // Post-market only
```

### Using Named Sessions
```pine
// Get current symbol's session type
currentSession = syminfo.session  // Returns session.regular, etc.

// Create ticker for different session
extendedTicker = ticker.new(syminfo.prefix, syminfo.ticker, session.extended)
extendedClose = request.security(extendedTicker, timeframe.period, close)
```

## Session State Detection

### Built-in States
```pine
session.ismarket      // In regular market hours
session.ispremarket   // In pre-market
session.ispostmarket  // In post-market
```

```pine
//@version=6
indicator("Session States")

plot(session.ismarket ? 1 : 0, "Market Hours")
bgcolor(session.ispremarket ? color.new(color.yellow, 90) : na)
bgcolor(session.ispostmarket ? color.new(color.orange, 90) : na)
```

### Detecting Session Changes
```pine
// New trading day started
newDay = ta.change(time("D"))

// New session started
newSession = ta.change(time(timeframe.period, "0930-1600:23456"))

if newSession
    label.new(bar_index, high, "Session Start")
```

## Time Functions

### Current Time
```pine
time          // Bar open time (Unix ms)
time_close    // Bar close time (Unix ms)
timenow       // Current real-world time (Unix ms) - WARNING: causes repainting!
```

### Time Components
```pine
year(time)           // Year (e.g., 2024)
month(time)          // Month (1-12)
dayofmonth(time)     // Day (1-31)
dayofweek(time)      // Day of week (1=Sun, 7=Sat)
hour(time)           // Hour (0-23)
minute(time)         // Minute (0-59)
second(time)         // Second (0-59)
```

### Timezone Handling
```pine
// Specify timezone for time functions
hour(time, "America/New_York")
hour(time, syminfo.timezone)

// Get timezone info
syminfo.timezone  // Symbol's timezone string
```

## Common Patterns

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

### Previous Day's OHLC
```pine
//@version=6
indicator("Previous Day OHLC", overlay=true)

[prevO, prevH, prevL, prevC] = request.security(syminfo.tickerid, "D", 
    [open[1], high[1], low[1], close[1]], lookahead=barmerge.lookahead_on)

plot(prevH, "Prev High", color.green)
plot(prevL, "Prev Low", color.red)
plot(prevC, "Prev Close", color.blue)
```

### Time-Based Exit
```pine
// Exit position at specific time
exitTime = timestamp("America/New_York", year, month, dayofmonth, 15, 45, 0)
if time >= exitTime and strategy.position_size != 0
    strategy.close_all("EOD Exit")
```

**References**:
- `pine-script-docs/concepts/sessions.html` - Sessions
- `pine-script-docs/concepts/time.html` - Time handling

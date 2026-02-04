# Pine Script v6 Alerts

## alertcondition()

Define alert conditions that users can configure in TradingView's alert dialog.

> [!IMPORTANT]
> `alertcondition()` only works in **indicators**. In strategies, it will compile without error but will **silently do nothing**. Use `alert()` for strategies.

```pine
alertcondition(
    condition,                          // Boolean series (required)
    title = "",                         // Alert name in UI
    message = ""                        // Default message text (const string)
)
```

### Key Points

1. **Cannot be inside conditionals** - Must be at global scope.
2. **Message must be constant** - The `message` parameter requires a `const string` (known at compile-time). Use placeholders for dynamic data.
3. **Multiple allowed** - Define several alerts per script.
4. **User configures** - User selects which to enable in the alert dialog.
5. **Evaluated every bar** - Condition checked on each bar close.


## Message Placeholders

Dynamic values in alert messages using placeholders:

```pine
// Available placeholders
alertcondition(condition, "Alert", "
    Symbol: {{ticker}}
    Exchange: {{exchange}}
    Price: {{close}}
    Time: {{time}}
    Volume: {{volume}}
    Interval: {{interval}}
")
```

| Placeholder | Value |
|-------------|-------|
| `{{ticker}}` | Symbol name (AAPL) |
| `{{exchange}}` | Exchange (NASDAQ) |
| `{{open}}`, `{{high}}`, `{{low}}`, `{{close}}` | OHLC values |
| `{{volume}}` | Current volume |
| `{{time}}` | Bar timestamp |
| `{{timenow}}` | Alert trigger time |
| `{{interval}}` | Chart timeframe |

## Multiple Alert Conditions

```pine
//@version=6
indicator("Multi-Alert", overlay=true)

fastMA = ta.ema(close, 10)
slowMA = ta.ema(close, 20)
rsi = ta.rsi(close, 14)

// Define multiple conditions
bullCross = ta.crossover(fastMA, slowMA)
bearCross = ta.crossunder(fastMA, slowMA)
rsiOverbought = ta.crossover(rsi, 70)
rsiOversold = ta.crossunder(rsi, 30)

// Register each alert
alertcondition(bullCross, "Bullish Crossover", "{{ticker}}: Fast MA crossed above Slow MA at {{close}}")
alertcondition(bearCross, "Bearish Crossover", "{{ticker}}: Fast MA crossed below Slow MA at {{close}}")
alertcondition(rsiOverbought, "RSI Overbought", "{{ticker}}: RSI entered overbought territory")
alertcondition(rsiOversold, "RSI Oversold", "{{ticker}}: RSI entered oversold territory")
```

## alert() Function

For strategy alerts and more dynamic messaging. Unlike `alertcondition()`, the message can be built at runtime using script variables.

```pine
alert(
    message,                            // Alert message text (series string)
    freq = alert.freq_once_per_bar      // Frequency setting
)

// Frequencies
alert.freq_once_per_bar                 // Once per bar (default)
alert.freq_once_per_bar_close           // Only on bar close
alert.freq_all                          // Every tick (use carefully!)
```

### alert() in Strategies

By default, strategies recalculate only at the **bar close**. This means `alert.freq_all` and `alert.freq_once_per_bar` will still only fire once per bar (at the close).

To enable **intra-bar alerts** in a strategy, you must set `calc_on_every_tick = true` in the `strategy()` declaration:

```pine
strategy("My Strategy", calc_on_every_tick = true)
```

### alert() vs alertcondition()

| Feature | `alertcondition()` | `alert()` |
|---------|-------------------|-----------|
| Scope | Global only | Anywhere (conditionals OK) |
| User selection | User picks in dialog | Auto-fires when called |
| Message Type | `const string` (Placeholders only) | `series string` (Dynamic building) |
| Use case | Indicators | Strategies, dynamic alerts |

## Strategy Alerts

Strategy alerts are unique because they can trigger on two different types of events:
1. **`alert()` function calls** (manual triggers in code).
2. **Order fill events** (automatic triggers when orders execute).

When creating a strategy alert in the UI, users can choose to trigger on "Order fills and alert() function calls", "Order fills only", or "alert() function calls only".

### Order Fill Events

Strategies automatically generate alert events when the broker emulator fills an order. You can customize these messages using the `alert_message` parameter in `strategy.*()` functions.

```pine
//@version=6
strategy("Order Fill Alert Demo", overlay=true)

// Customize the default message for ALL order fills using this annotation
// @strategy_alert_message {{strategy.order.alert_message}}

if buyCondition
    strategy.entry("Long", strategy.long, 
                   alert_message="BUY {{strategy.order.qty}} {{ticker}} at {{strategy.order.price}}")

if sellCondition
    strategy.close("Long", 
                   alert_message="SELL {{ticker}} at {{strategy.order.price}}")
```

### Strategy-Specific Placeholders

Order fill alerts support special placeholders that are not available in `alertcondition()`:

| Placeholder | Description |
|-------------|-------------|
| `{{strategy.order.alert_message}}` | The string passed to the `alert_message` parameter |
| `{{strategy.order.action}}` | "buy" or "sell" |
| `{{strategy.order.contracts}}` | Number of contracts filled |
| `{{strategy.order.price}}` | Execution price |
| `{{strategy.order.id}}` | Order ID string |
| `{{strategy.order.comment}}` | Order comment string |
| `{{strategy.position_size}}` | New position size after fill |

### Exit-Specific Messages

`strategy.exit()` allows for different messages based on which part of the bracket was hit:

```pine
strategy.exit("Exit", "Long",
    profit = 100,
    loss = 50,
    alert_profit = "Take profit hit at {{strategy.order.price}}",
    alert_loss = "Stop loss hit at {{strategy.order.price}}"
)
```

## Alert Behavior & Restrictions

### Realtime Bar Restriction
**Alerts only trigger on realtime bars.** They never trigger on historical bars during the initial script execution. The operational scope of alert code is restricted to `barstate.isrealtime`.

### Alert Snapshots
When you create an alert in the TradingView UI, the system saves a **snapshot** of:
1. The current script code.
2. The current input settings.
3. The chart's symbol and timeframe.

**Crucial:** If you update your script code or change its inputs, existing alerts **will not update**. You must delete the old alert and create a new one to apply changes.

## Webhook Integration

### JSON Webhook Format

```pine
alertcondition(signal, "Trade Signal", '{
    "action": "buy",
    "ticker": "{{ticker}}",
    "price": {{close}},
    "time": "{{timenow}}",
    "interval": "{{interval}}"
}')
```

### Dynamic JSON with alert()

```pine
if buySignal
    alertMsg = '{' +
        '"action": "buy",' +
        '"symbol": "' + syminfo.ticker + '",' +
        '"price": ' + str.tostring(close) + ',' +
        '"qty": ' + str.tostring(positionSize) + ',' +
        '"stop": ' + str.tostring(stopPrice) +
    '}'
    alert(alertMsg, alert.freq_once_per_bar)
```

## Common Alert Patterns

### Selective alert() Calls
Since "Any alert() function call" triggers on *every* `alert()` in your script, use inputs to let users choose which events trigger the alert.

```pine
//@version=6
indicator("Selective Alerts")
enableLongs  = input.bool(true, "Enable Long Alerts")
enableShorts = input.bool(true, "Enable Short Alerts")

if longCondition and enableLongs
    alert("Long Signal", alert.freq_once_per_bar)

if shortCondition and enableShorts
    alert("Short Signal", alert.freq_once_per_bar)
```

### Compound Conditions

```pine
// Alert when multiple conditions align
condition = rsi < 30 and close > ta.sma(close, 200) and volume > ta.sma(volume, 20)
alertcondition(condition, "Buy Setup", "RSI oversold + above 200 SMA + high volume")
```

### State Change Alerts

```pine
// Alert on first bar of new state
wasAbove = close[1] > level
isAbove = close > level
justCrossedAbove = isAbove and not wasAbove

alertcondition(justCrossedAbove, "Breakout", "Price broke above key level")
```

### Cooldown Pattern

```pine
// Avoid repeated alerts
var int lastAlertBar = 0
cooldownBars = 10

canAlert = bar_index - lastAlertBar >= cooldownBars

if signal and canAlert
    lastAlertBar := bar_index
    alert("Signal triggered", alert.freq_once_per_bar)
```

### Time-Based Alerts

```pine
// Alert only during market hours
inSession = not na(time(timeframe.period, "0930-1600:23456"))
signal = buyCondition and inSession

alertcondition(signal, "Session Buy", "Buy signal during regular hours")
```

## Best Practices

1. **Use descriptive titles** - Makes alerts easy to identify in the dialog
2. **Include context in messages** - Symbol, price, and timestamp are helpful
3. **Test with bar replay** - Verify alerts trigger as expected
4. **Consider frequency** - `alert.freq_all` can generate excessive alerts
5. **Format JSON carefully** - Validate webhook payloads before deployment

## Alert Setup in TradingView

1. Right-click chart → "Add Alert"
2. Select indicator from "Condition" dropdown
3. Choose the `alertcondition` you want
4. Configure notification method (popup, email, webhook, etc.)
5. Set expiration (optional)
6. For webhooks: Add URL and the message will be sent as POST body

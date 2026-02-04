# Pine Script v6 Alerts

## alertcondition()

Define alert conditions that users can configure in TradingView's alert dialog.

```pine
alertcondition(
    condition,                          // Boolean series (required)
    title = "",                         // Alert name in UI
    message = ""                        // Default message text
)

// Basic example
alertcondition(ta.crossover(close, ta.sma(close, 20)), 
               title="Price Cross Above SMA", 
               message="Price crossed above 20-period SMA")
```

### Key Points

1. **Cannot be inside conditionals** - Must be at global scope
2. **Multiple allowed** - Define several alerts per script
3. **User configures** - User selects which to enable in alert dialog
4. **Evaluated every bar** - Condition checked on each bar close

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

For strategy alerts and more dynamic messaging:

```pine
alert(
    message,                            // Alert message text
    freq = alert.freq_once_per_bar      // Frequency setting
)

// Frequencies
alert.freq_once_per_bar                 // Once per bar (default)
alert.freq_once_per_bar_close           // Only on bar close
alert.freq_all                          // Every tick (use carefully!)
```

### alert() vs alertcondition()

| Feature | `alertcondition()` | `alert()` |
|---------|-------------------|-----------|
| Scope | Global only | Anywhere (conditionals OK) |
| User selection | User picks in dialog | Auto-fires when called |
| Dynamic message | Placeholders only | Full string building |
| Use case | Indicators | Strategies, dynamic alerts |

## Strategy Alerts

Strategies use `alert_message` parameter in order functions:

```pine
//@version=6
strategy("Alert Strategy", overlay=true)

if buyCondition
    strategy.entry("Long", strategy.long, 
                   alert_message="BUY {{ticker}} at {{close}}")

if sellCondition
    strategy.close("Long", 
                   alert_message="SELL {{ticker}} at {{close}}")
```

### Exit-Specific Messages

```pine
strategy.exit("Exit", "Long",
    profit = 100,
    loss = 50,
    comment_profit = "TP Hit",
    comment_loss = "SL Hit",
    alert_profit = "Take profit triggered at {{close}}",
    alert_loss = "Stop loss triggered at {{close}}"
)
```

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

# Pine Script v6 Strategies

## Strategy Declaration

```pine
//@version=6
strategy(
    title,                              // Required: display name
    shorttitle = "",                    // Shorter name
    overlay = false,                    // true = on price chart
    
    // Position sizing
    default_qty_type = strategy.fixed,  // .fixed, .cash, .percent_of_equity
    default_qty_value = 1,              // Size per order
    pyramiding = 0,                     // Max entries in same direction (0 = no pyramiding)
    
    // Backtest settings
    initial_capital = 1000000,          // Starting capital
    currency = currency.NONE,           // Account currency
    
    // Costs
    commission_type = strategy.commission.none,  // .percent, .cash_per_contract, .cash_per_order
    commission_value = 0,
    slippage = 0,                       // Ticks of slippage
    
    // Execution
    process_orders_on_close = false,    // Execute on bar close (vs next open). Causes repainting!
    calc_on_every_tick = false,         // Recalculate on every tick. Causes repainting!
    calc_on_order_fills = false,        // Recalculate on fills. Provides avg_price on entry bar.
    use_bar_magnifier = false,          // Use LTF data for precise fills (Premium+)
    
    // Margin
    margin_long = 100,                  // % margin required for longs
    margin_short = 100,                 // % margin required for shorts
    
    // Limits
    max_bars_back = 0,
    max_lines_count = 50,
    max_labels_count = 50,
    max_boxes_count = 50
)
```

## Entry Orders

### strategy.entry()

Main function for opening positions. **Auto-reverses** if called with opposite direction by adding the opposite position's size to the new order (effectively closing old + opening new).

```pine
strategy.entry(
    id,                                 // Order identifier (string)
    direction,                          // strategy.long or strategy.short
    qty = na,                           // Size (uses default if na)
    limit = na,                         // Limit price (market order if na)
    stop = na,                          // Stop price (market order if na)
    oca_name = "",                      // One-Cancels-All group
    oca_type = strategy.oca.none,       // .none, .cancel, .reduce
    comment = "",                       // Order comment
    alert_message = "",                 // Alert text
    disable_alert = false
)

// Examples:
// Market order
strategy.entry("Long", strategy.long)

// Limit order
strategy.entry("Long", strategy.long, limit=close * 0.99)

// Stop order (buy on breakout)
strategy.entry("Long", strategy.long, stop=high + syminfo.mintick)

// Stop-limit order
strategy.entry("Long", strategy.long, stop=high, limit=high + 0.10)
```

### Direction Constants

```pine
strategy.long                           // Long position (+1)
strategy.short                          // Short position (-1)
```

## Exit Orders

### strategy.exit()

Exit with profit target, stop loss, or trailing stop.

```pine
strategy.exit(
    id,                                 // Exit order identifier
    from_entry = "",                    // Entry ID to exit (all if empty)
    qty = na,                           // Quantity to exit
    qty_percent = na,                   // Percent of position to exit
    
    // Profit targets
    profit = na,                        // Points profit target
    limit = na,                         // Price limit target
    
    // Stop loss
    loss = na,                          // Points stop loss
    stop = na,                          // Price stop loss
    
    // Trailing stop
    trail_price = na,                   // Trail activation price
    trail_points = na,                  // Points to trail behind
    trail_offset = na,                  // Distance in TICKS trailing behind high/low
    
    oca_name = "",
    comment = "",
    comment_profit = "",                // Comment when profit hit
    comment_loss = "",                  // Comment when stop hit
    comment_trailing = "",              // Comment when trail hit
    alert_message = "",
    alert_profit = "",
    alert_loss = "",
    alert_trailing = "",
    disable_alert = false
)

// Examples:
// Simple stop loss and take profit
strategy.exit("Exit", "Long", profit=100, loss=50)

// Trailing stop (activate after 50 points, trail 20 points behind)
strategy.exit("Trail", "Long", trail_points=50, trail_offset=20)

// Price-based stop
strategy.exit("Stop", "Long", stop=strategy.position_avg_price * 0.95)
```

### strategy.close()

Market order to close position.

```pine
strategy.close(
    id,                                 // Entry ID to close
    comment = "",
    alert_message = "",
    immediately = false,                // Close immediately (vs bar close)
    disable_alert = false
)

// Close specific entry
strategy.close("Long")

// Close all entries
strategy.close_all(comment="Exit All")
```

### strategy.cancel()

Cancel pending orders.

```pine
strategy.cancel(id)                     // Cancel specific order
strategy.cancel_all()                   // Cancel all pending orders
```

## Generic Orders

### strategy.order()

Place order without auto-reversal logic. Ignores pyramiding limits and other strategy properties; treats each order independently.

```pine
strategy.order(
    id,
    direction,
    qty = na,
    limit = na,
    stop = na,
    oca_name = "",
    oca_type = strategy.oca.none,
    comment = "",
    alert_message = "",
    disable_alert = false
)

// Use for pyramiding or complex order management
if buySignal
    strategy.order("Add", strategy.long, qty=1)
```

## OCA (One-Cancels-All) Groups

OCA groups link multiple orders together. When one order in the group is filled, it affects the others.

- **`strategy.oca.cancel`**: Filling one order cancels all others in the group.
- **`strategy.oca.reduce`**: Filling one order reduces the quantity of others in the group by the same amount.

```pine
// Example: Two potential entry points, only want one
strategy.entry("Limit Entry", strategy.long, limit=90, oca_name="Entry", oca_type=strategy.oca.cancel)
strategy.entry("Stop Entry", strategy.long, stop=110, oca_name="Entry", oca_type=strategy.oca.cancel)
```

## Strategy Properties & Risk Management

### Pyramiding
- **Default**: `pyramiding = 0` (only one entry allowed in each direction).
- **Behavior**: If `pyramiding > 0`, the strategy can open multiple positions in the same direction until the limit is reached.
- **Note**: Price-based orders (limit/stop) can sometimes exceed pyramiding limits if multiple orders trigger on the same bar.

### Margin & Liquidation
- **`margin_long` / `margin_short`**: The percentage of the position value required as margin (default 100%).
- **Liquidation**: If equity falls below the required margin, the strategy simulates a liquidation (margin call) and closes the position.

### Risk Management Functions
- **`strategy.risk.allow_entry_in()`**: Restricts entries to only long, only short, or both.
```pine
strategy.risk.allow_entry_in(strategy.direction.long) // Only allow long entries
```

## Position Information

### Current Position

```pine
strategy.position_size               // Current size (+long, -short, 0=flat)
strategy.position_avg_price          // Average entry price
strategy.position_entry_name         // ID of most recent entry

// Check position state
isLong = strategy.position_size > 0
isShort = strategy.position_size < 0
isFlat = strategy.position_size == 0
```

### Open Trades

```pine
strategy.opentrades                  // Number of open trades

// Access specific open trade (0-indexed)
strategy.opentrades.entry_bar_index(0)   // Bar index of entry
strategy.opentrades.entry_id(0)          // Entry ID
strategy.opentrades.entry_price(0)       // Entry price
strategy.opentrades.entry_time(0)        // Entry timestamp
strategy.opentrades.profit(0)            // Unrealized P&L
strategy.opentrades.max_runup(0)         // Max favorable excursion
strategy.opentrades.max_drawdown(0)      // Max adverse excursion
strategy.opentrades.size(0)              // Trade size
```

### Closed Trades

```pine
strategy.closedtrades                // Number of closed trades

// Access specific closed trade
strategy.closedtrades.entry_bar_index(0)
strategy.closedtrades.entry_price(0)
strategy.closedtrades.exit_bar_index(0)
strategy.closedtrades.exit_price(0)
strategy.closedtrades.exit_time(0)
strategy.closedtrades.profit(0)
strategy.closedtrades.max_runup(0)
strategy.closedtrades.max_drawdown(0)
```

## Multiple Exit Strategies & Partial Exits

You can call `strategy.exit()` multiple times to create complex exit logic or partial exits.

### Partial Exits
Use `qty_percent` to exit a portion of the position.

```pine
// Exit 50% at first target, remaining 50% at second target
strategy.exit("TP1", "Long", qty_percent=50, limit=close * 1.05)
strategy.exit("TP2", "Long", qty_percent=100, limit=close * 1.10)
```

### Multiple Exit Types
Combine profit targets, stop losses, and trailing stops in a single call or multiple calls.

```pine
// One call for all
strategy.exit("Exit", "Long", profit=100, loss=50, trail_points=30, trail_offset=5)

// Separate calls for different logic
strategy.exit("Fixed Stop", "Long", loss=100)
strategy.exit("Trailing", "Long", trail_points=50, trail_offset=10)
```

## Performance Metrics

```pine
strategy.equity                      // Current equity
strategy.initial_capital             // Starting capital
strategy.netprofit                   // Total profit/loss
strategy.grossprofit                 // Total winning trades
strategy.grossloss                   // Total losing trades
strategy.openprofit                  // Unrealized P&L
strategy.wintrades                   // Number of winning trades
strategy.losstrades                  // Number of losing trades
strategy.eventrades                  // Number of breakeven trades
strategy.max_drawdown                // Maximum drawdown
strategy.max_runup                   // Maximum runup
```

## Broker Emulator & Execution Model

### Execution Timing
- **Script Execution**: By default, strategy scripts execute at the **close** of each bar.
- **Order Filling**: Orders placed during a bar's execution are typically filled at the **open of the next bar**.
- **Exception**: If `process_orders_on_close = true`, orders can fill at the close of the current bar (the same bar that generated the signal), but this can lead to repainting.

### Broker Emulator Assumptions
The broker emulator simulates intrabar price movement to determine if and when orders (like stops and limits) are filled:
- **Intrabar Path**:
  - If `open` is closer to `high` than `low`: `open` -> `high` -> `low` -> `close`.
  - If `open` is closer to `low` than `high`: `open` -> `low` -> `high` -> `close`.
- **No Gaps**: The emulator assumes no price gaps occur *within* a single bar.
- **External Gaps**: Price-based orders (limit/stop) do not fill during gaps between bars. If the price "jumps" over an order level, it fills at the next available `open` price.

### Bar Magnifier
- `use_bar_magnifier = true` (Premium+ required).
- Uses lower-timeframe (LTF) data to simulate intrabar movement more precisely, providing more realistic backtesting results for stop/limit orders.

## Repainting in Strategies

Repainting occurs when a strategy's historical behavior differs from its realtime behavior.

### Common Causes
- **`calc_on_every_tick = true`**: Recalculates on every price update, allowing orders to trigger multiple times per bar.
- **`process_orders_on_close = true`**: Fills orders at the close of the signal bar. While it provides faster fills, it can cause divergence between backtest and live results.
- **Using `close` on realtime bar**: Signals may appear and disappear as the price fluctuates before the bar confirms.
- **Future Data Leak**: Using `request.security()` without `[1]` offset and `lookahead=barmerge.lookahead_on`.

### How to Avoid Repainting
- **Use Confirmed Bars**: Base signals on `close[1]` or check `barstate.isconfirmed`.
- **Safe HTF Data**: Always use the `[1]` offset with `lookahead_on` when requesting data from higher timeframes.
- **Standard Charts**: Avoid running strategies on Heikin-Ashi, Renko, or other non-standard chart types for backtesting.

## Order Types Summary

| Order Type | Parameters | Description |
|------------|------------|-------------|
| Market | (none) | Execute at next available price |
| Limit | `limit=price` | Execute at specified price or better |
| Stop | `stop=price` | Trigger when price reaches level |
| Stop-Limit | `stop=price, limit=price` | Stop trigger with limit execution |

## Common Strategy Patterns

### Basic Moving Average Crossover

```pine
//@version=6
strategy("MA Cross", overlay=true)

fastLen = input.int(10, "Fast MA")
slowLen = input.int(20, "Slow MA")

fastMA = ta.sma(close, fastLen)
slowMA = ta.sma(close, slowLen)

if ta.crossover(fastMA, slowMA)
    strategy.entry("Long", strategy.long)
    
if ta.crossunder(fastMA, slowMA)
    strategy.entry("Short", strategy.short)
    
plot(fastMA, "Fast", color.blue)
plot(slowMA, "Slow", color.red)
```

### Stop Loss and Take Profit

```pine
//@version=6
strategy("With Stops", overlay=true)

stopLossPct = input.float(2.0, "Stop Loss %") / 100
takeProfitPct = input.float(4.0, "Take Profit %") / 100

if buyCondition
    strategy.entry("Long", strategy.long)
    stopPrice = close * (1 - stopLossPct)
    targetPrice = close * (1 + takeProfitPct)
    strategy.exit("Exit", "Long", stop=stopPrice, limit=targetPrice)
```

### Trailing Stop

```pine
//@version=6
strategy("Trailing Stop", overlay=true)

trailActivation = input.float(1.0, "Activation %") / 100
trailOffset = input.float(0.5, "Trail %") / 100

if buyCondition
    strategy.entry("Long", strategy.long)
    
if strategy.position_size > 0
    activationPrice = strategy.position_avg_price * (1 + trailActivation)
    trailPoints = strategy.position_avg_price * trailOffset / syminfo.mintick
    strategy.exit("Trail", "Long", trail_price=activationPrice, trail_offset=trailPoints)
```

### Pyramiding (Adding to Winners)

```pine
//@version=6
strategy("Pyramid", overlay=true, pyramiding=3)

if buyCondition and strategy.opentrades < 3
    strategy.entry("Long", strategy.long, qty=1)
    
// Exit all when condition met
if exitCondition
    strategy.close_all()
```

### Position Sizing by Risk

```pine
//@version=6
strategy("Risk-Based Sizing", overlay=true, default_qty_type=strategy.cash)

riskPercent = input.float(1.0, "Risk %") / 100
stopLossPct = input.float(2.0, "Stop Loss %") / 100

if buyCondition
    riskAmount = strategy.equity * riskPercent
    stopDistance = close * stopLossPct
    positionSize = riskAmount / stopDistance
    
    strategy.entry("Long", strategy.long, qty=positionSize)
    strategy.exit("Stop", "Long", stop=close * (1 - stopLossPct))
```

### Time-Based Exit

```pine
//@version=6
strategy("Time Exit", overlay=true)

maxBarsInTrade = input.int(10, "Max Bars in Trade")

if buyCondition
    strategy.entry("Long", strategy.long)

// Exit after N bars
if strategy.opentrades > 0
    barsInTrade = bar_index - strategy.opentrades.entry_bar_index(0)
    if barsInTrade >= maxBarsInTrade
        strategy.close("Long", comment="Time Exit")
```

## Commission Types

```pine
strategy.commission.none             // No commission
strategy.commission.percent          // Percentage of trade value
strategy.commission.cash_per_contract  // Fixed amount per contract
strategy.commission.cash_per_order   // Fixed amount per order
```

## Quantity Types

```pine
strategy.fixed                       // Fixed number of contracts
strategy.cash                        // Fixed cash amount
strategy.percent_of_equity           // Percentage of equity
```

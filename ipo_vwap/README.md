# IPO Day Anchored VWAP

Automatically anchors a Volume Weighted Average Price (VWAP) to a ticker's IPO date or first trading day.

## Overview

The IPO Day Anchored VWAP indicator calculates VWAP from the exact moment a stock began trading. This provides a long-term reference line showing the average price paid by all investors since the company's public debut. The indicator automatically detects the IPO date on daily and higher timeframes, and allows manual override for intraday charts or when automatic detection is unreliable.

## How It Works

### Automatic IPO Detection

On **Daily and higher timeframes**, the indicator uses `bar_index == 0` (the first bar in TradingView's loaded history) as the anchor point. This is reliable for US equities because TradingView loads complete daily history from a stock's listing date.

### Manual Anchor Date

On **intraday charts** (1-minute, 5-minute, hourly, etc.), TradingView caps historical data by subscription tier, so the oldest loaded bar is not the true IPO date. For these cases:

1. Enable **"Use Manual Anchor Date"** in settings
2. Set **"Anchor Date/Time"** to the actual IPO date
3. The VWAP will anchor to that date instead

## Settings

| Setting | Default | Description |
| --- | --- | --- |
| **Source** | HLC3 | Price source for VWAP calculation |
| **Use Manual Anchor Date** | Off | Enable manual IPO date override |
| **Anchor Date/Time** | 2020-01-01 | Manual anchor date (when override is enabled) |
| **Show IPO Label** | On | Display "IPO" or "Anchor" label at anchor point |

VWAP line color and thickness (default: cyan, 2px) are configured in the
indicator's **Style** tab, not Settings, since they're plain plot styling
rather than calculation inputs.

## Usage

1. **Daily+ charts**: Add the indicator; it auto-detects the IPO date and anchors VWAP
2. **Intraday charts**: Enable "Use Manual Anchor Date" and set the correct IPO date
3. **Alerts**: Configure "Price Crosses VWAP" alert to get notified on crossovers

## Limitations

- **Automatic detection only works on Daily and higher timeframes** for US equities. On intraday charts, TradingView's data limits mean the first bar is not the true IPO date—use manual anchor instead.
- **Manual anchor requires knowing the exact IPO date**. Verify the date before setting it.
- **VWAP calculation depends on volume data**. If volume is unavailable or unreliable, VWAP values may be inaccurate.

## License

Apache License 2.0

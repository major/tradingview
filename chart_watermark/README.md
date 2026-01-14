# Chart Watermark

A Pine Script indicator that displays ticker, timeframe, and description as a subtle watermark at the top center of the chart.

## Features

- **Clean Display**: Shows ticker symbol and timeframe on the first line, company/instrument description on the second
- **Ratio/Spread Chart Support**: Properly handles ratio charts like `AMD/SPY` by fetching and combining descriptions for both symbols
- **Smart Ticker Formatting**: Strips exchange prefixes from spread charts (e.g., `DKS/AMEX:SPY` displays as `DKS/SPY`)
- **Human-Readable Timeframes**: Converts timeframe codes to readable format (e.g., `1D`, `4H`, `1W`, `1M`, `1Y`)
- **Configurable Colors**: Separate color and transparency controls for ticker line and description line

## Display Format

**Regular charts:**
```
AAPL, 1D
Apple Inc.
```

**Ratio/spread charts:**
```
AMD/SPY, 1W
Advanced Micro Devices, Inc. / SPDR S&P 500 ETF Trust
```

## Settings

| Setting | Description |
|---------|-------------|
| Ticker & Timeframe | Color and transparency for the top line (ticker + timeframe) |
| Description | Color and transparency for the bottom line (instrument description) |

## Timeframe Formatting

| Chart Timeframe | Display |
|-----------------|---------|
| 1 minute | `1m` |
| 5 minutes | `5m` |
| 65 minutes | `65m` |
| 1 hour | `1H` |
| 4 hours | `4H` |
| 1 day | `1D` |
| 2 days | `2D` |
| 1 week | `1W` |
| 1 month | `1M` |
| 3 months | `1Q` |
| 12 months | `1Y` |

## Spread/Ratio Chart Support

The indicator detects spread charts (`syminfo.type == "spread"`) and handles the following operators:
- `/` (division/ratio)
- `*` (multiplication)
- `-` (subtraction)
- `+` (addition)

For each symbol in the spread, it fetches the description via `request.security()` and combines them with the appropriate operator.

## Installation

1. Open TradingView and navigate to your chart
2. Open the Pine Editor (bottom of screen)
3. Copy the contents of `chart_watermark.pine`
4. Paste into Pine Editor
5. Click "Add to Chart"

## License

Apache License 2.0

# Chart Watermark

A Pine Script indicator that displays ticker, timeframe, and description/sector info as a subtle watermark at the top center of the chart.

## Features

- **Display Mode Toggle**: Choose between Description, Sector/Industry, or Both
- **Sector/Industry Support**: Shows stock sector and industry classification (e.g., "Technology | Semiconductors")
- **Smart Fallback**: Automatically falls back to description for non-stock symbols (ETFs, crypto, forex, futures)
- **Ratio/Spread Chart Support**: Properly handles ratio charts like `AMD/SPY` by fetching and combining info for both symbols
- **Smart Ticker Formatting**: Strips exchange prefixes from spread charts (e.g., `DKS/AMEX:SPY` displays as `DKS/SPY`)
- **Human-Readable Timeframes**: Converts timeframe codes to readable format (e.g., `1D`, `4H`, `1W`, `1M`, `1Y`)
- **Configurable Colors**: Separate color and transparency controls for ticker line and description/sector lines

## Display Modes

### Description Mode (Default)
```
AAPL, 1D
Apple Inc.
```

### Sector/Industry Mode
```
AAPL, 1D
Technology | Consumer Electronics
```

### Both Mode
```
AAPL, 1D
Apple Inc.
Technology | Consumer Electronics
```

### Ratio/Spread Charts
```
AMD/SPY, 1W
Advanced Micro Devices, Inc. / SPDR S&P 500 ETF Trust
Technology / Financial Services
```

## Settings

| Setting | Description |
|---------|-------------|
| Display Mode | Choose: Description, Sector/Industry, or Both |
| Ticker & Timeframe | Color and transparency for the top line |
| Description / Sector | Color and transparency for the info lines |

## Sector/Industry Availability

Sector and industry data is only available for **stocks**. For other instrument types, the indicator behaves as follows:

| Instrument Type | Sector/Industry Mode Behavior |
|-----------------|-------------------------------|
| Stocks | Shows sector and industry |
| ETFs | Falls back to description |
| Crypto | Falls back to description |
| Forex | Falls back to description |
| Futures | Falls back to description |
| Indices | Falls back to description |

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

For each symbol in the spread, it fetches the description and sector via `request.security()` and combines them with the appropriate operator.

## Installation

1. Open TradingView and navigate to your chart
2. Open the Pine Editor (bottom of screen)
3. Copy the contents of `chart_watermark.pine`
4. Paste into Pine Editor
5. Click "Add to Chart"

## License

Apache License 2.0

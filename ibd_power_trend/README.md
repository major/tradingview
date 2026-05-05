# IBD Power Trend Indicator

Identify when a stock or ETF enters an IBD-style Power Trend, with screener-friendly outputs and alert conditions.

## Overview

This indicator tracks the common IBD Power Trend start and stop rules in a separate pane. Green markers sit on the zero line while the Power Trend is active. Yellow markers, enabled by default, highlight charts that are close enough to a Power Trend to watch closely.

## Signal Logic

A full Power Trend starts when all of these conditions are true:

| Rule | Default |
| ---- | ------- |
| Each daily low is above the 21 EMA | 10 trading days |
| 21 EMA is above the 50 SMA | 5 trading days |
| 50 SMA is rising | Compared with 5 trading days ago |
| Close is up for the day | Close > prior close |

The yellow Almost Power Trend warning appears when the chart is not in a Power Trend yet, but the structural setup is close. It allows the low-above-EMA rule or EMA-above-SMA rule to be one trading day short and does not require an up close, since that up close is often the final confirmation you are watching for.

## End Logic

The Power Trend ends when either condition appears:

- 21 EMA crosses below the 50 SMA
- Close is below the 50 SMA and at least 10% below the highest high from the last 63 trading days

## Visual Style

- Green zero-line circles: Power Trend active
- Yellow zero-line circles: almost Power Trend watchlist signal
- Circle colors and zero line visibility are configurable
- Almost Power Trend markers are on by default and can be disabled from Visual Settings

## Alerts

- **New IBD Power Trend**: Fires on the first bar where a Power Trend becomes active
- **IBD Almost Power Trend**: Fires on the first bar where the chart becomes close enough to watch

## Pine Screener

The script exposes numeric data-window plots for TradingView Pine Screener filtering:

- Power Trend Active
- Almost Power Trend
- New Power Trend
- New Almost Power Trend
- Low Above EMA
- EMA Above SMA
- SMA Rising
- Close Up

Filter for `Power Trend Active = 1` to find symbols currently in a Power Trend, or `Almost Power Trend = 1` to find symbols that are close enough to watch.

## Settings

### Signal Settings

- **EMA Length**: Fast moving average length, default 21
- **SMA Length**: Slow moving average length, default 50
- **Low Above EMA Days**: Number of days lows must stay above the EMA, default 10
- **EMA Above SMA Days**: Number of days the EMA must stay above the SMA, default 5
- **SMA Rising Lookback**: Compares the 50 SMA with this many trading days ago, default 5
- **Recent High Lookback**: Lookback for the drawdown stop, default 63
- **Recent High Drawdown (%)**: Drawdown threshold for ending the trend, default 10%

### Visual Settings

- **Show Power Trend Circles**: Toggle green active-trend circles
- **Show Almost Power Trend Circles**: Toggle yellow watchlist circles, on by default
- **Power Trend Color** and **Almost Power Trend Color**: Circle colors
- **Show Zero Line**: Toggle the pane baseline

## License

Apache License 2.0

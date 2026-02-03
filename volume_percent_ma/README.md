# Volume Percent of MA

Shows volume as a **percentage of the moving average** instead of raw volume bars. This makes it easy to spot unusually high volume days at a glance!

## How It Works

* **500%** = Volume is 5x the moving average
* **200%** = Volume is 2x the moving average
* **Below MA** = Bar is hidden (no noise from low-volume days)

## Features

* 📊 **Percentage Display**: See exactly how much volume exceeds the average
* 🎯 **Noise Filter**: Set a minimum threshold (e.g., 150%) to only show significant volume
* 🔴 **IBD/O'Neil Coloring**: Red on down days (vs previous close), black/grey on up days
* 🌗 **Theme Support**: Light mode (red/black) or Dark mode (red/grey) for visibility
* 📈 **MA Options**: Choose between SMA or EMA for the moving average

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| MA Length | 20 | Period for the moving average calculation |
| MA Type | SMA | Simple or Exponential moving average |
| Minimum % to Display | 100 | Hide bars below this threshold (100 = show all above MA) |
| Color based on previous close | ON | IBD-style coloring vs yesterday's close |
| Chart Theme | Dark | Match your TradingView chart background |

## Examples

* **Monday**: 5M volume, 1M MA → **500% bar** displayed
* **Tuesday**: 3M volume, 1.5M MA → **200% bar** displayed
* **Wednesday**: 1M volume, 2M MA → **Hidden** (below average)

## Use Cases

* Identify accumulation/distribution days with unusual volume
* Filter out noise by setting minimum threshold to 150% or 200%
* Quickly compare volume magnitude across different time periods
* Works great alongside price action analysis for breakout confirmation

Enjoy! 🤓

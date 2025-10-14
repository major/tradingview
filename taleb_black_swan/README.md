# Taleb Fragility & Compression Detector

A Pine Script indicator inspired by Nassim Nicholas Taleb's concepts of fragility, antifragility, and market dynamics. This indicator identifies periods of market compression and fragility that may precede significant price movements.

## Overview

This indicator detects when markets are in a "fragile" state - compressed, quiet periods where volatility is suppressed and price action is constrained. Like a spring being compressed, these periods often precede explosive moves in either direction. The indicator doesn't predict direction, but rather identifies when the market is "loaded" and ready to move.

## Taleb's Core Concepts

### Fragility vs. Antifragility

**Fragility** is the property of being harmed by disorder, volatility, and stress. In markets, a fragile state occurs when:
- Volatility is abnormally low
- Price ranges are compressed
- Momentum indicators show indecision
- The market appears "too quiet"

This suppressed volatility is unsustainable. Markets are dynamic systems that naturally exhibit volatility - when it's artificially suppressed or naturally compressed, it tends to explode back violently.

### Black Swan Events

Taleb's famous "Black Swan" concept refers to highly improbable events that have massive impact. While this indicator doesn't predict Black Swans specifically, it identifies conditions where markets are fragile and susceptible to large, sudden moves - the type of environment where unexpected events can have outsized effects.

### Volatility Regimes

Markets cycle between high and low volatility regimes. When realized volatility drops to historical lows (bottom 20-30% of its range), the market is statistically due for a regime change. This indicator quantifies where current volatility sits in its historical distribution.

## What This Indicator Measures

The indicator combines multiple compression and fragility metrics into a single score (0-100+):

### 1. Realized Volatility (20%)

- **Realized Vol**: Calculates actual volatility using log returns, annualized to a percentage
- **RV Percentile**: Where current volatility ranks vs. the past year (252 trading days)
- **Volatility of Volatility**: Measures how much volatility itself is changing

**Interpretation**: When RV Percentile is below 20%, volatility is in the bottom 20% of its annual range - historically fragile territory.

### 2. Compression Metrics (30%)

Multiple measures of price range compression:

- **ATR Compression**: When Average True Range drops 30% below its 50-day average
- **Bollinger Band Squeeze**: When BB width is less than half its 100-day average
- **TTM Squeeze**: The classic squeeze indicator - when Bollinger Bands contract inside Keltner Channels
- **Range Compression**: Daily, 5-day, and 20-day ranges compressed vs. their averages

**Interpretation**: Each compression metric adds points to the fragility score. The TTM Squeeze is weighted most heavily (20 points) as it's the most reliable compression signal.

### 3. Pattern Recognition (30%)

Technical patterns that signal coiling or indecision:

- **NR7/NR4**: Narrowest Range in 7 or 4 days - classic low-volatility patterns
- **Inside Days**: When the entire day's range fits inside the previous day's range
- **Multiple Inside Days**: Even stronger compression signal
- **Doji Reversals**: Indecision candles after a trend
- **Triangle Formation**: Converging highs and lows

**Interpretation**: These patterns are technical signs of compression and often precede breakouts.

### 4. Momentum Death (20%)

When momentum indicators show the market is "stuck":

- **RSI Compression**: RSI stuck between 45-55 (dead center) and not moving
- **MACD Flatline**: MACD and signal line converged with no separation
- **ADX No Trend**: ADX below 20 with balanced directional indicators

**Interpretation**: When momentum dies, it often precedes a momentum resurrection in the form of a strong directional move.

## The Fragility Score

The indicator combines all metrics into a master **Fragility Score**:

- **0-20**: Low fragility - Normal market conditions
- **20-40**: Moderate fragility - Some compression present
- **40-60**: High fragility - Multiple compression signals
- **60-80**: Very high fragility - Strong compression across metrics
- **80+**: Extreme fragility - Maximum compression, breakout imminent

A **bonus multiplier** (+20 points) is added when compression, patterns, and low volatility all align simultaneously.

## Visual Elements

### Color-Coded Score

The fragility score is plotted as columns with dynamic colors:
- **Gray**: Low fragility (0-20)
- **Light Green**: Low-moderate (20-40)
- **Yellow**: Moderate (40-60)
- **Orange**: High (60-80)
- **Red**: Extreme (80+)

### Reference Lines

Horizontal lines mark key thresholds at 20, 40, 60, and 80 for quick visual reference.

### Shape Indicators

- **Purple Diamond**: TTM Squeeze active (most important compression signal)
- **Blue Triangle**: NR7 pattern (narrowest range in 7 days)
- **Orange Square**: Multiple inside days detected

### Info Table

A real-time table in the top-right corner displays:
- Current fragility score
- Realized volatility percentile
- ATR percentage
- Bollinger Band width
- TTM Squeeze status
- Range patterns (NR7/NR4)
- Chart patterns detected
- Overall signal strength

## Alerts

Four alert conditions are included:

1. **Extreme Fragility**: Score exceeds 80
2. **High Fragility Triggered**: Score crosses above 60
3. **TTM Squeeze Fired**: TTM Squeeze activates
4. **NR7 Pattern**: Narrowest range in 7 days detected

## How to Use This Indicator

### What It Does

✅ Identifies periods of market compression and fragility
✅ Quantifies when volatility is abnormally low
✅ Detects technical patterns associated with breakouts
✅ Provides objective measure of "how coiled" the market is

### What It Doesn't Do

❌ Predict direction of breakout (up or down)
❌ Generate buy/sell signals
❌ Identify trend direction
❌ Work as a standalone trading system

### Trading Applications

**Position Sizing**: When fragility is high (60+), consider:
- Reducing position sizes (fragile markets can move violently)
- Using wider stops (breakouts often trigger stops before trending)
- Waiting for confirmation before entering

**Options Trading**: High fragility scores suggest:
- Long volatility strategies (straddles/strangles)
- Avoid short volatility positions
- Implied volatility may be underpricing upcoming moves

**Breakout Trading**: When score exceeds 80:
- Be prepared for significant move in either direction
- Set alerts to monitor breakout direction
- Don't try to predict direction - wait for market to show its hand

**Risk Management**: Use as a regime filter:
- Low scores (0-40): Normal position sizing
- High scores (60+): Reduce size or stay defensive
- Extreme scores (80+): Highest risk of volatility expansion

### Combining With Other Analysis

This indicator works best when combined with:
- **Directional indicators**: Use RSI, MACD, or trend indicators to determine likely breakout direction
- **Support/Resistance**: Identify key levels where breakouts may occur
- **Volume**: Confirm breakouts with volume expansion
- **Market Context**: Consider broader market conditions and catalysts

## Settings

### Volatility Group
- **Realized Vol Period** (default: 20): Lookback for volatility calculation
- **ATR Period** (default: 10): Lookback for Average True Range

### Compression Group
- **Compression Detection Period** (default: 30): Lookback for range compression
- **Bollinger Band Length** (default: 20): Period for BB calculation
- **Keltner Channel Length** (default: 20): Period for KC calculation
- **Keltner Multiplier** (default: 1.5): KC width multiplier

## Technical Notes

- Uses Pine Script v6
- Requires 500 bars of historical data (max_bars_back)
- Calculates on each bar close
- Works on any timeframe (daily recommended for best results)
- All percentile calculations use 252-bar (1 year) lookback

## Interpretation Tips

### High Score But No Move?

Remember: this indicator identifies fragility, not timing. Markets can remain compressed longer than expected. A high score means increased probability of a move, not certainty or immediate timing.

### Score Suddenly Drops

If the score drops sharply from 70+ to 30, it often means the compression has been released - a breakout has occurred. Check the price chart for the directional move.

### Persistently Low Scores

When scores remain below 40 for extended periods, the market is in a normal volatility regime. This isn't bullish or bearish - just indicates standard market conditions without unusual compression.

### Multiple Indicators Fire

When you see purple diamonds (TTM Squeeze) + blue triangles (NR7) + score above 80, this is the highest probability setup for an imminent significant move.

## Philosophy: Why This Matters

Traditional technical analysis often focuses on predicting direction. This indicator takes a different approach inspired by Taleb's work:

1. **Acknowledge Uncertainty**: We can't reliably predict direction, but we can identify fragile states
2. **Focus on Risk**: High fragility = high risk of volatility expansion
3. **Prepare, Don't Predict**: Position defensively during fragility rather than trying to guess the direction
4. **Respect Non-Linearity**: Markets don't move linearly - they jump, gap, and explode

This indicator helps you identify when the market is in a state where small inputs can cause large outputs - the definition of fragility.

## Further Reading

To deepen your understanding of the concepts behind this indicator:

- **Antifragile** by Nassim Nicholas Taleb - Core concepts of fragility and how systems respond to stress
- **The Black Swan** by Nassim Nicholas Taleb - Understanding rare events and market randomness
- **Dynamic Trading** by Robert Miner - Technical analysis of compression patterns
- **Bollinger on Bollinger Bands** by John Bollinger - Deep dive into the squeeze concept

## License

Apache License 2.0

## Version

1.0 - Initial release

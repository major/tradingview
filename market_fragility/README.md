# Market Fragility & Compression Detector

A Pine Script indicator that identifies periods of market compression and fragility that may precede significant price movements.

## Overview

This indicator detects when markets are in a "fragile" state - compressed, quiet periods where volatility is suppressed and price action is constrained. Like a spring being compressed, these periods often precede explosive moves in either direction. The indicator doesn't predict direction, but rather identifies when the market is "loaded" and ready to move.

## Core Concepts

### Market Fragility

**Fragility** is the property of being harmed by disorder, volatility, and stress. In markets, a fragile state occurs when:
- Volatility is abnormally low
- Price ranges are compressed
- Momentum indicators show indecision
- The market appears "too quiet"

This suppressed volatility is unsustainable. Markets are dynamic systems that naturally exhibit volatility - when it's artificially suppressed or naturally compressed, it tends to explode back violently.

### Volatility Regimes

Markets cycle between high and low volatility regimes. When realized volatility drops to historical lows (bottom 20-30% of its range), the market is statistically due for a regime change. This indicator quantifies where current volatility sits in its historical distribution.

## What This Indicator Measures

The indicator combines multiple compression and fragility metrics into a single score (0-100):

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

The indicator combines all metrics into a master **Fragility Score** with the following point allocations:

### Score Components (Normalized to 0-100)

1. **Compression Score** (max 70 points):
   - Bollinger Band Squeeze: 15 points
   - TTM Squeeze: 20 points
   - ATR Compression: 10 points
   - Range Compression: 10 points
   - Multi-timeframe Compression: 15 points

2. **Pattern Score** (max 50 points):
   - NR7 Pattern: 15 points (or NR4: 10 points)
   - Multiple Inside Days: 15 points (or single Inside Day: 8 points)
   - Doji Reversal: 10 points
   - Triangle Formation: 12 points

3. **Volatility Score** (max 35 points):
   - RV Percentile < 20%: 20 points (or < 40%: 10 points)
   - Volatility-of-Volatility < 20%: 15 points

4. **Momentum Score** (max 35 points):
   - RSI Compressed and Flat: 15 points
   - MACD Flat: 10 points
   - No Trend (ADX): 10 points

5. **Bonus Multiplier** (+20 points):
   - Added when compression score > 20 AND pattern score > 10 AND volatility score > 10
   - This represents extreme alignment across multiple fragility dimensions

### Interpretation Levels

- **0-20**: Low fragility - Normal market conditions
- **20-40**: Moderate fragility - Some compression present
- **40-60**: High fragility - Multiple compression signals
- **60-80**: Very high fragility - Strong compression across metrics
- **80-100**: Extreme fragility - Maximum compression, breakout imminent

## Visual Elements

### Color-Coded Score

The fragility score is plotted as columns with dynamic colors:
- **Gray**: Low fragility (0-20)
- **Light Green**: Low-moderate (20-40)
- **Yellow**: Moderate (40-60)
- **Orange**: High (60-80)
- **Red**: Extreme (80-100)

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
- Extreme scores (80-100): Highest risk of volatility expansion

### Combining With Other Analysis

This indicator works best when combined with:
- **Directional indicators**: Use RSI, MACD, or trend indicators to determine likely breakout direction
- **Support/Resistance**: Identify key levels where breakouts may occur
- **Volume**: Confirm breakouts with volume expansion
- **Market Context**: Consider broader market conditions and catalysts

## Settings

### Timeframe Group
- **Use Custom Timeframe** (default: false): Enable to analyze fragility on a different timeframe
- **Timeframe** (default: Weekly): Select custom timeframe when enabled

### Display Group
- **Info Table Text Size** (default: Small): Adjust the size of the metrics table (Auto, Tiny, Small, Normal, Large, Huge)

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

Traditional technical analysis often focuses on predicting direction. This indicator takes a different approach:

1. **Acknowledge Uncertainty**: We can't reliably predict direction, but we can identify fragile states
2. **Focus on Risk**: High fragility = high risk of volatility expansion
3. **Prepare, Don't Predict**: Position defensively during fragility rather than trying to guess the direction
4. **Respect Non-Linearity**: Markets don't move linearly - they jump, gap, and explode

This indicator helps you identify when the market is in a state where small inputs can cause large outputs - the definition of fragility.

## Further Reading

To deepen your understanding of the concepts behind this indicator:

### Volatility Metrics
- [Realized Volatility Explained (Investopedia)](https://www.investopedia.com/terms/r/realizedvolatility.asp) - What realized volatility measures
- [Volatility Percentiles (tastytrade)](https://www.tastytrade.com/definitions/implied-volatility-percentile) - Using volatility percentiles for trading
- [Log Returns vs Simple Returns](https://quantivity.wordpress.com/2011/02/21/why-log-returns/) - Why log returns are preferred
- [Volatility of Volatility (VIX and More)](http://vixandmore.blogspot.com/search/label/volatility%20of%20volatility) - Second-order volatility effects

### Compression Patterns
- [Bollinger Band Squeeze (BollingerBands.com)](https://www.bollingerbands.com/bollinger-band-squeeze) - John Bollinger's official explanation
- [TTM Squeeze Indicator Explained (TradingView)](https://www.tradingview.com/script/nqQ1DT5a-Squeeze-Momentum-Indicator-LazyBear/) - Popular TTM Squeeze implementation
- [Understanding the Squeeze (Simpler Trading)](https://www.simplertrading.com/blog/what-is-the-squeeze) - Practical guide to squeeze trading
- [Keltner Channels vs Bollinger Bands](https://www.investopedia.com/articles/trading/08/keltner-channel-bollinger-band.asp) - Understanding the TTM Squeeze components

### Classic Patterns
- [NR7 Pattern (The Strat Trading)](https://www.investopedia.com/terms/n/narrowestrange.asp) - Narrowest Range patterns explained
- [Inside Day Pattern (Investopedia)](https://www.investopedia.com/terms/i/inside_day.asp) - Inside bar trading strategy
- [Triangle Patterns (StockCharts)](https://school.stockcharts.com/doku.php?id=chart_analysis:chart_patterns:triangle_patterns) - Symmetrical, ascending, and descending triangles
- [Doji Candlesticks (BabyPips)](https://www.babypips.com/learn/forex/doji) - Understanding indecision candles

### Technical Indicators
- [ATR Indicator Guide (Investopedia)](https://www.investopedia.com/terms/a/atr.asp) - Average True Range explained
- [RSI Indicator (TradingView)](https://www.tradingview.com/support/solutions/43000502338-relative-strength-index-rsi/) - Relative Strength Index
- [MACD Indicator (Investopedia)](https://www.investopedia.com/terms/m/macd.asp) - Moving Average Convergence Divergence
- [ADX Indicator (BabyPips)](https://www.babypips.com/learn/forex/average-directional-index) - Average Directional Index and trend strength

### Academic Papers
- [SSRN - Volatility Clustering](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2435323) - Why volatility regimes persist
- [Volatility Forecasting (NYU Stern)](https://pages.stern.nyu.edu/~adamodar/pdfiles/papers/volatility.pdf) - Understanding volatility dynamics
- [Market Compression and Breakouts (Journal of Finance)](https://onlinelibrary.wiley.com/journal/15406261) - Academic research on range compression

## License

Apache License 2.0

## Version

1.1 - Updated naming and normalized score to 0-100 scale

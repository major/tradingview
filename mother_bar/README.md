# Mother Bar Pattern Indicator 🎯

A TradingView Pine Script indicator that detects and visualizes "Mother Bar" patterns - a powerful price compression pattern where multiple bars trade within a single bar's range before breaking out.

## What is a Mother Bar Pattern? 🤔

A **Mother Bar** is a bar that contains one or more "child" bars completely within its high-low range. The pattern completes when price breaks above the mother's high or below the mother's low.

### Pattern Components:

1. **Mother Bar** 💎 - The initial bar that establishes the range
2. **Child Bars** 👶 - Bars completely inside the mother's range (high < mother_high AND low > mother_low)
3. **Breakout Bar** 🚀 - The bar that breaks above/below the mother's range, completing the pattern

### Trading Significance:

- More children = More compression = Potentially stronger breakout
- Represents consolidation and energy buildup
- Breakout direction often indicates next significant move
- Can occur on any timeframe

## Features ✨

### Visual Elements:

- **Horizontal Lines** - Show mother bar's high/low range during child accumulation
- **Diamond Markers** 💎 - Mark each mother bar (optional)
- **Triangle Markers** 🔺🔻 - Mark breakout bars (optional)
- **Count Labels** 🏷️ - Display number of child bars on pattern completion
- **Color Coding** - Green for bullish breakouts, red for bearish breakouts

### Configurable Options:

#### Display Settings 📊
- Toggle range lines on/off
- Toggle mother bar markers
- Toggle breakout markers
- Toggle child count labels
- Set minimum children required to display pattern (filter noise)

#### Color Settings 🎨
- Bullish breakout color (default: green)
- Bearish breakout color (default: red)
- Mother bar marker color (default: blue)
- Range line color (default: gray)

#### Line Style 🎭
- Solid, Dashed, or Dotted lines

## How to Use 📖

### Installation:

1. Copy the entire contents of `mother_bar.pine`
2. Open TradingView and navigate to any chart
3. Click "Pine Editor" at the bottom
4. Paste the code
5. Click "Add to Chart"

### Interpretation:

**Pattern Formation:**
- A diamond appears marking the mother bar
- Gray lines extend from the mother bar's high and low
- As child bars form, the lines extend to the current bar

**Pattern Completion:**
- When breakout occurs, a label shows the child count on the mother bar
- A triangle marker appears on the breakout bar
- Green = bullish breakout (broke above mother high)
- Red = bearish breakout (broke below mother low)
- The breakout bar becomes the new mother bar

### Trading Tips 💡

1. **Look for high child counts** - More compression often leads to bigger moves
2. **Combine with volume** - High volume breakouts are more reliable
3. **Use appropriate timeframe** - Daily charts for swing trades, intraday for day trades
4. **Wait for confirmation** - Consider waiting for bar close or retest
5. **Set minimum children filter** - Increase to 2-3 to filter out noise on lower timeframes

## Examples 📸

### Bullish Mother Bar Pattern:
```
Mother Bar: High = 150, Low = 145
Child 1: High = 149, Low = 146 ✅
Child 2: High = 148, Low = 146.5 ✅
Child 3: High = 149.5, Low = 145.5 ✅
Breakout: High = 151 🚀 → Pattern complete! Label shows "3 bars"
```

### Pattern Recognition:
- More children = tighter consolidation
- Longer patterns (more days) = more significant breakout potential
- Watch for breakouts with volume confirmation

## Technical Details 🔧

### Pine Script Version:
- Written in Pine Script v6
- Uses efficient state tracking with `var` variables
- Dynamically manages lines and labels
- Max 500 lines and 500 labels

### Performance:
- Minimal resource usage
- Efficient line management (deletes old lines)
- Clean state transitions

### Limitations:
- Lines are deleted when pattern completes (not historical)
- Limited to max_lines_count/max_labels_count in Pine Script
- Real-time bars may flicker until close (standard Pine behavior)

## Version History 📝

### v1.0 (Initial Release)
- Mother bar pattern detection
- Dynamic range lines
- Configurable visual markers
- Child count tracking
- Bullish/bearish breakout coloring
- Minimum children filter

## License 📄

Mozilla Public License 2.0

## Credits 👏

Created for TradingView community. Contributions and improvements welcome!

---

**Happy Trading! 🚀📈**

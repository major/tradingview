# ATR% Multiple from Moving Average 📏

Measure how extended a stock's price is from its moving average in terms of ATR multiples. Helps identify overextended conditions for scaling out profits or avoiding late entries.

## Overview

This indicator quantifies price extension from a moving average using ATR (Average True Range) as the measuring unit. Rather than arbitrary percentage levels, it expresses extension in volatility-adjusted terms - making thresholds meaningful across different stocks and market conditions.

## The Formula

```
ATR% = ATR / Close Price
% Gain from MA = (Close - MA) / MA
ATR Multiple = (% Gain from MA) / ATR%
```

**Simplified**: How many "ATR units" is the price away from its moving average?

## Interpretation

| ATR Multiple | Meaning |
|--------------|---------|
| 0-5x | Normal range - healthy trend |
| 5-7x | Getting extended - be cautious with new entries |
| 7-10x | Consider taking partial profits |
| >10x | Highly extended - increased pullback risk |

**Note**: These thresholds vary by instrument type. ETFs typically use lower thresholds than individual stocks due to their lower volatility characteristics.

## Visual Display

When the ATR multiple exceeds your configured threshold:
- **Green labels above bars**: Price extended above MA (bullish extension)
- **Red labels below bars**: Price extended below MA (bearish extension)

Labels display the rounded ATR multiple value for quick reference.

## Settings

### Core Settings
- **ATR Length** (default: 14): Period for Average True Range calculation
- **MA Length** (default: 50): Period for Moving Average calculation

### Thresholds (Above / Below MA)

Different thresholds for different instrument types:

| Instrument | Above MA | Below MA |
|------------|----------|----------|
| Stocks | 10x | 4x |
| ETFs (Funds) | 7x | 4x |
| Other | 10x | 4x |

The indicator automatically detects the instrument type and applies appropriate thresholds.

### Label Settings
- **Label Size**: Choose from auto, tiny, small, normal, large, huge
- **Colors**: Customize colors for above/below MA extension labels

## Alerts

Four alert conditions are included:

1. **Extended Above MA**: Fires when price is extended above MA beyond threshold
2. **Became Extended Above**: Fires only when price first becomes extended (transition)
3. **Extended Below MA**: Fires when price is extended below MA beyond threshold
4. **Became Extended Below**: Fires only when price first becomes extended (transition)

## Data Window

The following values are available in TradingView's Data Window:
- ATR Multiple (the main indicator value)
- ATR% (ATR as percentage of price)
- % from MA (percentage distance from moving average)
- MA (the moving average value)
- ATR (raw ATR value)

## Use Cases

### Profit Taking
When ATR multiple reaches 7-10x above MA, consider:
- Taking partial profits
- Tightening stops
- Reducing position size

### Entry Timing
Avoid initiating new long positions when:
- ATR multiple is already >7x (chasing extended moves)
- Wait for pullback toward MA or lower ATR multiple

### Mean Reversion
High negative ATR multiples (extended below MA) may signal:
- Oversold conditions
- Potential bounce candidates
- But confirm with other analysis - extended can get more extended!

## Credits

Inspired by jfsrev's TradingView indicator concept for measuring extension in ATR terms.

## Technical Notes

- Uses Pine Script v6
- Overlay indicator (displays on price chart)
- Maximum 500 labels supported
- Division by zero handled gracefully

## License

Apache License 2.0

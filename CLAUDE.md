# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of open-source Pine Script indicators for TradingView focused on volume analysis, relative strength, and market behavior patterns. All indicators are written in Pine Script v6.

## Project Structure

The repository contains standalone Pine Script indicators organized in folders:
- Each indicator has its own directory with the `.pinescript` or `.pine` file
- Some indicators include README.md documentation and example screenshots
- `hvc_finder.pinescript` - High Volume Close (HVC) Finder at the root level

### Current Indicators

- **hvc_finder.pinescript** - High Volume Close Finder: Identifies bars with volume significantly above MA and marks closes
- **hvc_watcher/** - HVC Watcher: Watches for High Volume Close patterns and unusual volume with optional time filtering (NYC timezone)
- **relative_strength_leadership/** - Relative Strength Leadership: Compares relative strength vs benchmark with fast/slow MA crossovers
- **market_fragility/** - Market Fragility & Compression Detector: Detects market fragility, compression, and low volatility periods
- **volume_historical/** - Volume Historical: Highlights highest, lowest, and above average volume with SMA overlay
- **volume_filter_percentage/** - Filtered Volume Percentage: Analyzes volume filtered by specific time periods (NYC timezone)
  - Includes overlay version (`volume_filter_percentage_overlay.pine`) for chart markers
- **volume_ratio/** - Volume Ratio: Compares volume ratio between ticker and benchmark symbol (default SPY)

## Pine Script Development Guidelines

### Version Compatibility
- All indicators now use Pine Script v6 (`//@version=6`)
- When creating new indicators, use v6 as it's the current standard for this project
- Legacy v5 indicators have been migrated to v6

### Common Pine Script Functions and Patterns

Key functions frequently used:
- `ta.sma()` - Simple moving average calculations
- `plotshape()` - Visual markers on charts (location.belowbar, location.abovebar)
- `input.float()`, `input.int()` - User-configurable parameters
- `math.max()`, `math.abs()` - Mathematical operations
- `label.new()`, `line.new()` - Creating visual elements

### Pine Script Limitations to Remember

- `plotshape()` does not have a `y` parameter - use `location.belowbar` or `location.abovebar`
- For precise positioning below/above bars at specific percentages, use `label.new()` instead
- Arrays are limited in size - use `max_labels_count` and `max_lines_count` in indicator declaration
- Avoid using line continuation.

## Testing Indicators

To test a Pine Script indicator:
1. Copy the indicator to clipboard: `cat path/to/indicator.pine | wl-copy`
2. Open TradingView chart
3. Open Pine Editor
4. Paste the script (Ctrl+V)
5. Click "Add to Chart"

**Development workflow**: When developing or iterating on indicators, always copy to clipboard with `wl-copy` after each change for quick testing in TradingView.

## License

All indicators are under Apache License 2.0 (see LICENSE file).

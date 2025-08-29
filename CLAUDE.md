# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of open-source Pine Script indicators for TradingView focused on volume analysis and market behavior patterns. All indicators are written in Pine Script v5 or v6.

## Project Structure

The repository contains standalone Pine Script indicators organized in folders:
- Each indicator has its own directory with the `.pinescript` or `.pine` file
- Some indicators include README.md documentation and example screenshots
- `hvc_finder.pinescript` - High Volume Close (HVC) Finder at the root level

## Pine Script Development Guidelines

### Version Compatibility
- Most indicators use Pine Script v5 (`//@version=5`)
- HVC Finder uses Pine Script v6 (`//@version=6`)
- When creating new indicators, use v5 unless v6 features are specifically needed

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
1. Copy the complete script content
2. Open TradingView chart
3. Open Pine Editor
4. Paste the script
5. Click "Add to Chart"

## License

All indicators are under Apache License 2.0 (see LICENSE file).

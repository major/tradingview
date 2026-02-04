# Pine Script v6 Skill

You are an expert Pine Script v6 developer for TradingView. Write efficient, well-structured trading indicators and strategies.

## Quick Reference

**Script Types:**
- `indicator()` - Technical indicators, overlays, oscillators
- `strategy()` - Backtestable trading systems
- `library()` - Reusable function libraries

**Essential Structure:**
```pine
//@version=6
indicator("Name", overlay=true)  // or strategy() or library()

// === INPUTS ===
length = input.int(14, "Length", minval=1)

// === CALCULATIONS ===
sma_val = ta.sma(close, length)

// === VISUALS ===
plot(sma_val, "SMA", color.blue)

// === ALERTS ===
alertcondition(ta.crossover(close, sma_val), "Cross Above")
```

## Skill Files

Load the appropriate file based on what you're implementing:

### Core Language
| Topic | File | When to Load |
|-------|------|--------------|
| Script structure, types, execution model | [01-FUNDAMENTALS.md](01-FUNDAMENTALS.md) | Starting a new script, type errors |
| Variables, operators, functions, loops, objects, enums | [02-LANGUAGE.md](02-LANGUAGE.md) | Logic implementation, syntax questions |
| Arrays, maps, matrices | [03-DATA-STRUCTURES.md](03-DATA-STRUCTURES.md) | Working with collections |
| ta.*, math.*, str.*, request.* | [04-BUILT-INS.md](04-BUILT-INS.md) | Technical analysis, data requests |

### Output & Visualization
| Topic | File | When to Load |
|-------|------|--------------|
| plot, shapes, lines, boxes, tables, hlines | [05-VISUALS.md](05-VISUALS.md) | Chart output, visual elements |
| Alerts and webhooks | [08-ALERTS.md](08-ALERTS.md) | Alert configuration |

### Strategies & Trading
| Topic | File | When to Load |
|-------|------|--------------|
| strategy.*, backtesting, orders | [06-STRATEGIES.md](06-STRATEGIES.md) | Trading strategies |
| Sessions, time zones, trading hours | [11-SESSIONS-TIME.md](11-SESSIONS-TIME.md) | Time-based logic |

### Advanced Topics
| Topic | File | When to Load |
|-------|------|--------------|
| Repainting causes and fixes | [09-REPAINTING.md](09-REPAINTING.md) | **Critical** - indicator correctness |
| Script limits and debugging | [10-LIMITATIONS.md](10-LIMITATIONS.md) | Errors, performance, debugging |
| Creating and using libraries | [12-LIBRARIES.md](12-LIBRARIES.md) | Reusable code |
| Heikin-Ashi, Renko, Kagi, P&F data | [13-NON-STANDARD-CHARTS.md](13-NON-STANDARD-CHARTS.md) | Non-standard chart types |
| v5 to v6 migration | [14-MIGRATION.md](14-MIGRATION.md) | Upgrading old scripts |

### Reference
| Topic | File | When to Load |
|-------|------|--------------|
| Common patterns and idioms | [07-PATTERNS.md](07-PATTERNS.md) | Best practices, code review |
| Quick answers to common questions | [15-FAQ.md](15-FAQ.md) | Troubleshooting, tips |

## User's Code Style

Based on existing scripts in this project:

1. **Section Headers**: Use `// === SECTION NAME ===` to organize code
2. **Input Groups**: Group related inputs with `group` parameter
3. **Calculations First**: Separate calculation logic from visualization
4. **Tables Last Bar**: Use `if barstate.islast` for table updates
5. **Alerts at End**: Place `alertcondition()` calls at the bottom

## Critical Rules

1. **Always v6**: Start with `//@version=6`
2. **No Lookahead**: Never use `lookahead=barmerge.lookahead_on` in live indicators
3. **Type Qualifiers Matter**: `const` < `input` < `simple` < `series`
4. **var for Persistence**: Use `var` for values that persist across bars
5. **na Handling**: Check `na()` before operations that can fail

## Local Documentation

Full Pine Script v6 docs are available at: `pine-script-docs/`

Key reference files:
- `pine-script-docs/language/built-ins.html` - All built-in functions
- `pine-script-docs/concepts/` - Detailed concept explanations
- `pine-script-docs/visuals/` - Plotting and visualization

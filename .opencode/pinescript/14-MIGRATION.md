# Pine Script v5 to v6 Migration Guide

## Auto-Convert

The Pine Editor can automatically convert v5 scripts:
1. Open your v5 script
2. Click the dropdown arrow next to version
3. Select "Convert code to v6"

## Breaking Changes

### 1. Boolean Type Changes

**No implicit int/float to bool conversion:**
```pine
// v5: This worked
if close - open
    doSomething()

// v6: Must be explicit
if bool(close - open)  // Truthy check
    doSomething()

// Better: Be explicit about condition
if close - open != 0
    doSomething()
```

**Bool cannot be na:**
```pine
// v5: Bool could be true/false/na
bool x = na  // Allowed

// v6: Bool is only true/false
bool x = false  // Use false instead of na

// na(), nz(), fixnan() don't accept bool anymore
```

### 2. Lazy Evaluation for and/or

```pine
// v6: Right side only evaluated if needed
result = condA and expensiveCheck()  // expensiveCheck() skipped if condA is false
result = condA or expensiveCheck()   // expensiveCheck() skipped if condA is true
```

### 3. Dynamic Requests Enabled by Default

In v6, `dynamic_requests=true` is automatic! The compiler optimizes `request.*()` calls, allowing them to be used within loops and conditional structures.

**BREAKING CHANGE:** Scripts that relied on non-dynamic behavior (e.g., specific execution order or context persistence) may behave differently. You can force the old behavior by setting `dynamic_requests = false` in the `indicator()` or `strategy()` declaration.

```pine
// v6: Can use series values in request.*() and call them in loops
for i = 0 to 9
    val = request.security(syminfo.tickerid, timeframes[i], close)  // Now allowed!
```

### 4. Division Returns Fractional Results

```pine
// v5: const int / const int = int (truncated)
x = 5 / 2  // Result: 2

// v6: const int / const int = float
x = 5 / 2  // Result: 2.5

// For integer division, use int()
x = int(5 / 2)  // Result: 2
```

### 5. Strategy Changes

**`when` parameter removed:**
```pine
// v5
strategy.entry("Long", strategy.long, when=condition)

// v6: Use if statement
if condition
    strategy.entry("Long", strategy.long)
```

**Default margin is 100%:**
```pine
// v5: default_qty_type was cash
// v6: default_qty_type defaults to strategy.percent_of_equity
strategy("My Strategy", default_qty_value=100)  // 100% of equity
```

**Strategies trim oldest orders:**
Strategies now trim the oldest orders in their results instead of raising an error when they exceed the 9000 trade limit.

**Exit relative params no longer ignored:**
In v6, `strategy.exit()` no longer ignores relative parameters (like `profit`, `loss`, `trail_points`) when absolute parameters (like `limit`, `stop`) are also provided in the same call. Both can now work together.

```pine
// v6: Both absolute and relative params work together
strategy.exit("Exit", limit=100, loss=50)  // Both used!
```

### 6. History Reference Changes

The history-referencing operator `[]` can no longer reference the history of **literal values** or **fields of user-defined types (UDTs)** directly. General expressions (like `close[1+1]`) still work fine.

```pine
// v5: Could reference literals directly
x = 0[1]  // Allowed

// v6: Cannot reference literals. Must use a variable.
zero = 0
x = zero[1]  // Allowed

// v5: Could reference UDT fields directly
myUDT.field[1]  // Allowed

// v6: Must save to variable first
val = myUDT.field
x = val[1]  // Use history on variable
```

### 7. Duplicate Arguments Forbidden

```pine
// v5: Last value used
plot(close, color=color.red, color=color.blue)  // Blue used

// v6: Compile error
plot(close, color=color.red, color=color.blue)  // Error!
```

### 8. Plot Offset Must Be Input

```pine
// v5: Series offset allowed
plot(close, offset=dynamicValue)  // Worked if series

// v6: Offset must be input
offsetInput = input.int(0, "Offset")
plot(close, offset=offsetInput)  // Must be input type
```

### 9. na Not Allowed for Built-in Constants

`na` values are no longer allowed in place of built-in constants of unique types (e.g., `chart.point`).

```pine
// v5: Allowed
chart.point p = na

// v6: Compile error. Must use a valid constant or object.
```

### 10. Timeframe Period Format

```pine
// v5: "D" for daily
// v6: "1D" for daily (multiplier required)

timeframe.period  // Now returns "1D", "4H", etc.
```

### 11. transp Parameter Removed

```pine
// v5
plot(close, color=color.red, transp=50)

// v6: Use color.new()
plot(close, color=color.new(color.red, 50))
```

### 12. Array Negative Indexing

```pine
// v6: Some array functions accept negative indices
arr = array.from(1, 2, 3, 4, 5)
array.get(arr, -1)  // Returns 5 (last element)
```

### 13. For Loop End Evaluated Dynamically

```pine
// v6: End boundary re-evaluated each iteration
arr = array.from(1, 2, 3)
for i = 0 to array.size(arr) - 1
    array.push(arr, i)  // WARNING: Can cause infinite loop!
    
// Solution: Cache the size
size = array.size(arr)
for i = 0 to size - 1
    array.push(arr, i)  // Safe
```

### 14. Default Color Updates

Some default colors and color constants have updated values in v6. If your script relies on exact color values, you may notice slight visual differences.

### 15. Mutable Variables Not Const

Some mutable variables that were erroneously marked as "const" in v5 are now correctly identified as non-const in v6. This may affect code that relied on them being constant (e.g., in certain array initializations or function parameters requiring constants).

## Quick Migration Checklist

- [ ] Replace `transp` with `color.new()`
- [ ] Replace `when=` in strategy calls with `if` statements
- [ ] Fix boolean logic (no implicit cast, no na)
- [ ] Check integer division results
- [ ] Update timeframe strings ("D" → "1D")
- [ ] Remove duplicate arguments
- [ ] Fix history references on literals/UDT fields
- [ ] Verify for loop boundaries are cached
- [ ] Check `strategy.exit()` calls for combined absolute/relative params
- [ ] Ensure `na` is not used for unique built-in constant types
- [ ] Review `request.*()` calls for dynamic behavior changes
- [ ] Verify strategy trade limits (trimming behavior)

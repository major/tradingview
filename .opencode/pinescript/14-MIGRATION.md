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

```pine
// v6: Can use series values in request.*()
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

**Exit relative params not ignored:**
```pine
// v6: Both absolute and relative params work together
strategy.exit("Exit", profit=100, loss=50)  // Absolute ticks
strategy.exit("Exit", profit=100, trail_offset=10)  // Both used!
```

### 6. History Reference Changes

```pine
// v5: Could reference literals
close[1 + 1]  // Allowed

// v6: History operator needs runtime expression
offset = 1 + 1
close[offset]  // Must use variable

// v5: Could reference UDT fields directly
myUDT.field[1]  // Allowed

// v6: Must save to variable first
val = myUDT.field
val[1]  // Use history on variable
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

### 9. Timeframe Period Format

```pine
// v5: "D" for daily
// v6: "1D" for daily (multiplier required)

timeframe.period  // Now returns "1D", "4H", etc.
```

### 10. transp Parameter Removed

```pine
// v5
plot(close, color=color.red, transp=50)

// v6: Use color.new()
plot(close, color=color.new(color.red, 50))
```

### 11. Array Negative Indexing

```pine
// v6: Some array functions accept negative indices
arr = array.from(1, 2, 3, 4, 5)
array.get(arr, -1)  // Returns 5 (last element)
```

### 12. For Loop End Evaluated Dynamically

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

## Quick Migration Checklist

- [ ] Replace `transp` with `color.new()`
- [ ] Replace `when=` in strategy calls with `if` statements
- [ ] Fix boolean logic (no implicit cast, no na)
- [ ] Check integer division results
- [ ] Update timeframe strings ("D" → "1D")
- [ ] Remove duplicate arguments
- [ ] Fix history references on literals/UDT fields
- [ ] Verify for loop boundaries are cached

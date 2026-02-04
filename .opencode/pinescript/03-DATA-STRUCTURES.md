# Pine Script v6 Data Structures

## Series vs. Arrays

| Feature | Series | Array |
|---------|--------|-------|
| **Storage** | Automatic time-indexed storage | Manual collection |
| **Indexing** | `[n]` refers to value `n` bars ago | `get(n)` refers to index `n` |
| **Size** | Grows with chart history | Fixed or dynamic (max 100k) |
| **Purpose** | Historical price/indicator data | Custom data sets, sorting, math |

## Arrays

One-dimensional collections. Max 100,000 elements. Zero-indexed.

### Declaration

```pine
// Typed declaration (empty)
array<float> myArray = array.new<float>()

// With initial size and value
array<float> prices = array.new<float>(10, 0.0)

// From values
array<int> numbers = array.from(1, 2, 3, 4, 5)

// Persistent across bars (usually needed)
var array<float> history = array.new<float>()
```

### Core Operations

```pine
// Get/Set
val = array.get(myArray, 0)        // First element
val = array.get(myArray, -1)       // Last element (negative indexing)
array.set(myArray, 0, newValue)    // Set first element

// Method Syntax (Alternative)
val = myArray.get(0)               // Same as array.get(myArray, 0)

// History Referencing
prevArray = myArray[1]             // State of the array on the previous bar

// Add elements
array.push(myArray, value)         // Add to end
array.unshift(myArray, value)      // Add to beginning
array.insert(myArray, index, value) // Supports negative index

// Remove elements
lastVal = array.pop(myArray)       // Remove from end
firstVal = array.shift(myArray)    // Remove from beginning
array.remove(myArray, index)       // Supports negative index
array.clear(myArray)               // Remove all

// Size
size = array.size(myArray)
```

### Iteration

```pine
// By index
for i = 0 to array.size(myArray) - 1
    val = array.get(myArray, i)

// Direct iteration
for val in myArray
    // Process val

// With index
for [i, val] in myArray
    // i = index, val = value
```

### Statistics

```pine
avg = array.avg(myArray)
sum = array.sum(myArray)
min = array.min(myArray)
max = array.max(myArray)
stdev = array.stdev(myArray)
median = array.median(myArray)
variance = array.variance(myArray)
```

### Sorting and Searching

```pine
array.sort(myArray)                           // Ascending
array.sort(myArray, order.descending)
idx = array.binary_search(sortedArray, value) // Requires sorted
idx = array.indexof(myArray, value)           // First occurrence
```

### Array Manipulation

```pine
copied = array.copy(myArray)
sliced = array.slice(myArray, startIdx, endIdx)
array.concat(array1, array2)                  // In-place: Appends array2 to array1
array.fill(myArray, value, from, to)          // Optional index_from, index_to
array.reverse(myArray)
```

### Common Pattern: Rolling Window

```pine
var array<float> recentCloses = array.new<float>()

if array.size(recentCloses) >= 20
    array.shift(recentCloses)  // Remove oldest
array.push(recentCloses, close)  // Add newest

avg20 = array.avg(recentCloses)
```

## Maps

Key-value collections. Max 50,000 pairs. Maintains insertion order internally.

**Limits**: Maps have a 100,000 element limit. Since each key-value pair counts as 2 elements, the maximum capacity is 50,000 pairs.
**Key types**: Any fundamental type or enum type.
**Value types**: Any type including arrays, matrices, lines, labels.
**Restrictions**: Maps cannot store collection IDs (arrays, maps, matrices) directly. Use a User-Defined Type (UDT) workaround (a UDT with collection-type fields).

### Declaration

```pine
// Typed declaration (empty)
map<string, float> prices = map.new<string, float>()

// Persistent across bars
var map<string, float> cache = map.new<string, float>()
```

### Core Operations

```pine
// Add/Update
map.put(myMap, "key", value)       // Add or replace

// Get
val = map.get(myMap, "key")        // Returns na if not found

// Check existence
if map.contains(myMap, "key")
    // Key exists

// Remove
map.remove(myMap, "key")
map.clear(myMap)                   // Remove all

// Size
size = map.size(myMap)
```

### Iteration

```pine
// Get keys and values as arrays (returned in insertion order)
keys = map.keys(myMap)
values = map.values(myMap)

// Iterate
for key in map.keys(myMap)
    val = map.get(myMap, key)
```

### Common Pattern: Caching Calculations

```pine
var map<string, float> levelCache = map.new<string, float>()

getLevel(string name, float defaultVal) =>
    if not map.contains(levelCache, name)
        map.put(levelCache, name, defaultVal)
    map.get(levelCache, name)
```

### Common Pattern: Symbol Data Storage

```pine
var map<string, float> symbolPrices = map.new<string, float>()

// Store multiple symbol prices
map.put(symbolPrices, "AAPL", 150.0)
map.put(symbolPrices, "GOOGL", 2800.0)
map.put(symbolPrices, "MSFT", 300.0)

// Retrieve
aaplPrice = map.get(symbolPrices, "AAPL")
```

## Matrices

Two-dimensional collections (M x N). Max 100,000 total elements. Zero-indexed.

**Dynamic Dimensions**: Matrices can have dynamic rows/columns that vary across bars.

### Declaration

```pine
// Typed declaration (empty 3x3)
matrix<float> m = matrix.new<float>(3, 3, 0.0)

// Persistent across bars
var matrix<float> data = matrix.new<float>(5, 5)
```

### Core Operations

```pine
// Get/Set
val = matrix.get(m, row, col)
matrix.set(m, row, col, newValue)

// Dimensions
rows = matrix.rows(m)
cols = matrix.columns(m)
elements = matrix.elements_count(m)

// Fill all cells
matrix.fill(m, 0.0)
```

### Row and Column Operations

```pine
// Get row/column as array
rowArray = matrix.row(m, 0)        // First row
colArray = matrix.col(m, 0)        // First column

// Add rows/columns (Multiple signatures)
matrix.add_row(m)                  // Add empty row at end
matrix.add_row(m, rowIdx, array)   // Insert array as row at specific index
matrix.add_col(m)                  // Add empty column at end
matrix.add_col(m, colIdx, array)   // Insert array as column at specific index

// Remove rows/columns
matrix.remove_row(m, rowIdx)
matrix.remove_col(m, colIdx)
```

### Matrix Math

```pine
// Arithmetic
result = matrix.mult(m1, m2)       // Matrix multiplication
result = matrix.diff(m1, m2)       // Element-wise difference
result = matrix.sum(m1, m2)        // Element-wise sum

// Linear algebra
inv = matrix.inv(m)                // Inverse
det = matrix.det(m)                // Determinant
trans = matrix.transpose(m)        // Transpose
eigenvals = matrix.eigenvalues(m)  // Eigenvalues
eigenvecs = matrix.eigenvectors(m) // Eigenvectors
```

### Common Pattern: Correlation Matrix

```pine
var matrix<float> corrMatrix = matrix.new<float>(3, 3, 0.0)

// Store correlations between 3 assets
matrix.set(corrMatrix, 0, 1, 0.85)  // Asset 0 & 1 correlation
matrix.set(corrMatrix, 0, 2, 0.65)  // Asset 0 & 2 correlation
matrix.set(corrMatrix, 1, 2, 0.72)  // Asset 1 & 2 correlation
```

### Common Pattern: Price Table Storage

```pine
var matrix<float> ohlcHistory = matrix.new<float>(0, 4)  // Start empty, 4 columns

if barstate.isconfirmed
    // Add new row with OHLC data
    newRow = array.from(open, high, low, close)
    matrix.add_row(ohlcHistory, matrix.rows(ohlcHistory), newRow)
    
    // Keep only last 100 bars
    if matrix.rows(ohlcHistory) > 100
        matrix.remove_row(ohlcHistory, 0)
```

## Tuples

Immutable, fixed-size collections of values. Primarily used for returning multiple values from functions.

### Syntax

```pine
// Function returning a tuple
getValues() =>
    [close, volume]

// Assignment
[price, vol] = getValues()

// Ignoring values with _
[p, _] = getValues()
```

## Type Reference

| Collection | Max Size | Index Type | Use Case |
|------------|----------|------------|----------|
| Array | 100,000 | int | Lists, sequences, rolling windows |
| Map | 50,000 pairs | value types | Lookup tables, caching, key-value storage |
| Matrix | 100,000 total | int row/col | 2D data, correlation, linear algebra |

## Best Practices

1. **Use `var`** for collections that persist across bars.
2. **`varip` Restrictions**: `varip` can only contain fundamental types, chart point IDs, or UDT objects (with specific restrictions).
3. **Method Syntax**: Use `collection.method()` for cleaner code (e.g., `myArray.get(0)` instead of `array.get(myArray, 0)`).
4. **Manage size** - remove old elements to prevent hitting limits.
5. **Prefer built-ins** over manual array calculations (e.g., `ta.sma()` vs manual loop).
6. **Check for `na`** when getting values from maps.
7. **Pre-size when possible** - `array.new<float>(100)` is more efficient than 100 `push()` calls.
